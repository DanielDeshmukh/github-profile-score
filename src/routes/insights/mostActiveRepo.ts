import { Router } from 'express';
import type { Request, Response } from 'express';
import { CACHE_TTL } from '../../cache/index.js';
import { CACHE_KEYS } from '../../cache/keys.js';
import { GitHubFetcher } from '../../fetcher/index.js';
import { InsightFetcher } from '../../fetcher/insights/MostActiveRepoFetcher.js';
import { findMostActiveRepo } from '../../scorer/insights/mostActiveRepo.js';
import { renderMostActiveRepoCard, renderMostActiveRepoEmptySvg } from '../../renderer/insights/MostActiveRepoCard.js';
import { GitHubRateLimitError } from '../../types.js';
import { usernameValidator } from '../../middleware/usernameValidator.js';
import type { CacheProvider } from '../../types.js';

const SLUG = 'most-active-repo';

function getInsightCacheKey(slug: string, username: string): string {
  return CACHE_KEYS.insight(slug, username);
}

function getInsightRefreshCooldownKey(slug: string, username: string): string {
  return `${CACHE_KEYS.insight(slug, username)}:refresh_cooldown`;
}

export function mostActiveRepoRouter(
  cache: CacheProvider,
  githubFetcher: GitHubFetcher,
  insightFetcher: InsightFetcher,
): Router {
  const router = Router();
  const usernameParam = usernameValidator;

  router.get(`/insights/:username/${SLUG}.svg`, usernameParam, async (req: Request, res: Response) => {
    const username = req.params.username as string;
    const refresh = req.query.refresh === '1';

    try {
      const result = await getCachedOrCompute(cache, githubFetcher, insightFetcher, username, refresh);

      if (!result) {
        res.set({
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=60, s-maxage=60',
        });
        res.send(renderMostActiveRepoEmptySvg());
        return;
      }

      res.set({
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        ETag: `"${result.repoName}-${result.commitCount}"`,
      });
      res.send(renderMostActiveRepoCard(result.repoName, result.commitCount, result.repoUrl));
    } catch (err) {
      res.set({ 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-cache' });
      if (err instanceof GitHubRateLimitError) {
        res.status(429).send(renderMostActiveRepoEmptySvg());
      } else {
        res.status(err instanceof Error && 'statusCode' in err ? (err as { statusCode: number }).statusCode : 500).send(renderMostActiveRepoEmptySvg());
      }
    }
  });

  router.get(`/insights/:username`, usernameParam, async (req: Request, res: Response) => {
    const username = req.params.username as string;
    const refresh = req.query.refresh === '1';

    try {
      const result = await getCachedOrCompute(cache, githubFetcher, insightFetcher, username, refresh);
      res.set({ 'Cache-Control': 'public, max-age=300' });
      res.json({
        username,
        mostActiveRepo: result,
      });
    } catch (err) {
      if (err instanceof GitHubRateLimitError) {
        res.status(429).json({ error: 'rate_limited', retry_after: err.resetAt.toISOString() });
      } else {
        const status = err instanceof Error && 'statusCode' in err ? (err as { statusCode: number }).statusCode : 500;
        const message = status === 500 ? 'Internal server error' : (err instanceof Error ? err.message : 'Unknown error');
        res.status(status).json({ error: message });
      }
    }
  });

  return router;
}

async function getCachedOrCompute(
  cache: CacheProvider,
  githubFetcher: GitHubFetcher,
  insightFetcher: InsightFetcher,
  username: string,
  refresh: boolean,
): Promise<{ repoName: string; commitCount: number; repoUrl: string } | null> {
  const cacheKey = getInsightCacheKey(SLUG, username);

  if (refresh) {
    const cooldownKey = getInsightRefreshCooldownKey(SLUG, username);
    const onCooldown = await cache.exists(cooldownKey);
      if (onCooldown) {
      const cached = await cache.get<{ repoName: string; commitCount: number; repoUrl: string } | null>(cacheKey);
      if (cached !== null) return cached;
    }
  }

  const cached = await cache.get<{ repoName: string; commitCount: number; repoUrl: string } | null>(cacheKey);
  if (cached !== null && !refresh) {
    return cached;
  }

  const repos = await githubFetcher.fetchRepos(username);
  const repoCommitCounts = await insightFetcher.fetchPerRepoCommitCounts(username, repos);
  const result = findMostActiveRepo(repoCommitCounts);

  await cache.set(cacheKey, result, result !== null ? CACHE_TTL.SCORE : 60);

  if (refresh) {
    await cache.set(getInsightRefreshCooldownKey(SLUG, username), '1', CACHE_TTL.REFRESH_COOLDOWN);
  }

  return result;
}
