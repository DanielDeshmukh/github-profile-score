import { Router } from 'express';
import type { Request, Response } from 'express';
import { CACHE_TTL } from '../../cache/index.js';
import { CACHE_KEYS } from '../../cache/keys.js';
import { GitHubFetcher } from '../../fetcher/index.js';
import { LongestMaintainedFetcher } from '../../fetcher/insights/LongestMaintainedFetcher.js';
import { findLongestMaintainedRepo } from '../../scorer/insights/longestMaintainedRepo.js';
import { renderLongestMaintainedCard } from '../../renderer/insights/LongestMaintainedRepoCard.js';
import { GitHubRateLimitError } from '../../types.js';
import { usernameValidator } from '../../middleware/usernameValidator.js';
import type { CacheProvider } from '../../types.js';
import type { LongestMaintainedResult } from '../../scorer/insights/longestMaintainedRepo.js';

const SLUG = 'longest-maintained-repo';

export function longestMaintainedRepoRouter(
  cache: CacheProvider,
  githubFetcher: GitHubFetcher,
  longestMaintainedFetcher: LongestMaintainedFetcher,
): Router {
  const router = Router();
  const usernameParam = usernameValidator;

  router.get(`/insights/:username/${SLUG}.svg`, usernameParam, async (req: Request, res: Response) => {
    const username = req.params.username as string;
    const refresh = req.query.refresh === '1';

    try {
      const result = await getCachedOrCompute(cache, githubFetcher, longestMaintainedFetcher, username, refresh);

      if (!result) {
        res.set({
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=60, s-maxage=60',
        });
        res.send(renderLongestMaintainedCard('No repos', 0, '', new Date().toISOString()));
        return;
      }

      res.set({
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        ETag: `"${result.repoName}-${result.spanDays}"`,
      });
      res.send(renderLongestMaintainedCard(result.repoName, result.spanDays, result.repoUrl, result.firstCommitDate));
    } catch (err) {
      res.set({ 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-cache' });
      if (err instanceof GitHubRateLimitError) {
        res.status(429).send(renderLongestMaintainedCard('Rate limited', 0, '', new Date().toISOString()));
      } else {
        res.status(err instanceof Error && 'statusCode' in err ? (err as { statusCode: number }).statusCode : 500).send(renderLongestMaintainedCard('Error', 0, '', new Date().toISOString()));
      }
    }
  });

  router.get(`/insights/:username`, usernameParam, async (req: Request, res: Response) => {
    const username = req.params.username as string;
    const refresh = req.query.refresh === '1';

    try {
      const result = await getCachedOrCompute(cache, githubFetcher, longestMaintainedFetcher, username, refresh);
      res.set({ 'Cache-Control': 'public, max-age=300' });
      res.json({
        username,
        longestMaintainedRepo: result,
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
  longestMaintainedFetcher: LongestMaintainedFetcher,
  username: string,
  refresh: boolean,
): Promise<LongestMaintainedResult | null> {
  const cacheKey = CACHE_KEYS.insight(SLUG, username);

  if (refresh) {
    const cooldownKey = `${cacheKey}:refresh_cooldown`;
    const onCooldown = await cache.exists(cooldownKey);
    if (onCooldown) {
      const cached = await cache.get<LongestMaintainedResult | null>(cacheKey);
      if (cached !== undefined) return cached;
    }
  }

  const cached = await cache.get<LongestMaintainedResult | null>(cacheKey);
  if (cached !== undefined && !refresh) {
    return cached;
  }

  const repos = await githubFetcher.fetchRepos(username);
  const commitSpans = await longestMaintainedFetcher.fetchCommitSpans(username, repos);
  const result = findLongestMaintainedRepo(commitSpans);

  await cache.set(cacheKey, result, result !== null ? CACHE_TTL.SCORE : 60);

  if (refresh) {
    await cache.set(`${cacheKey}:refresh_cooldown`, '1', CACHE_TTL.REFRESH_COOLDOWN);
  }

  return result;
}
