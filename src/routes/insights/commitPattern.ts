import { Router } from 'express';
import type { Request, Response } from 'express';
import { CACHE_TTL } from '../../cache/index.js';
import { CACHE_KEYS } from '../../cache/keys.js';
import { CommitPatternFetcher } from '../../fetcher/insights/CommitPatternFetcher.js';
import { calculateCommitPattern } from '../../scorer/insights/commitPattern.js';
import { renderCommitPatternCard } from '../../renderer/insights/CommitPatternCard.js';
import { GitHubRateLimitError } from '../../types.js';
import { usernameValidator } from '../../middleware/usernameValidator.js';
import type { CacheProvider } from '../../types.js';
import type { CommitPatternResult } from '../../scorer/insights/commitPattern.js';

const SLUG = 'commit-pattern';

export function commitPatternRouter(
  cache: CacheProvider,
  patternFetcher: CommitPatternFetcher,
): Router {
  const router = Router();
  const usernameParam = usernameValidator;

  router.get(`/insights/:username/${SLUG}.svg`, usernameParam, async (req: Request, res: Response) => {
    const username = req.params.username as string;
    const refresh = req.query.refresh === '1';

    try {
      const result = await getCachedOrCompute(cache, patternFetcher, username, refresh);

      res.set({
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        ETag: `"${result.dominantDayType}-${result.dominantDayPart}-${result.totalCommits}"`,
      });
      res.send(renderCommitPatternCard(
        result.dominantDayType,
        result.dominantDayPart,
        result.weekdayCount,
        result.weekendCount,
        result.totalCommits,
      ));
    } catch (err) {
      res.set({ 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-cache' });
      if (err instanceof GitHubRateLimitError) {
        res.status(429).send(renderCommitPatternCard('weekday', 'morning', 0, 0, 0));
      } else {
        res.status(err instanceof Error && 'statusCode' in err ? (err as { statusCode: number }).statusCode : 500).send(renderCommitPatternCard('weekday', 'morning', 0, 0, 0));
      }
    }
  });

  router.get(`/insights/:username`, usernameParam, async (req: Request, res: Response) => {
    const username = req.params.username as string;
    const refresh = req.query.refresh === '1';

    try {
      const result = await getCachedOrCompute(cache, patternFetcher, username, refresh);
      res.set({ 'Cache-Control': 'public, max-age=300' });
      res.json({
        username,
        commitPattern: result,
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
  patternFetcher: CommitPatternFetcher,
  username: string,
  refresh: boolean,
): Promise<CommitPatternResult> {
  const cacheKey = CACHE_KEYS.insight(SLUG, username);

  if (refresh) {
    const cooldownKey = `${cacheKey}:refresh_cooldown`;
    const onCooldown = await cache.exists(cooldownKey);
    if (onCooldown) {
      const cached = await cache.get<CommitPatternResult>(cacheKey);
      if (cached) return cached;
    }
  }

  const cached = await cache.get<CommitPatternResult>(cacheKey);
  if (cached && !refresh) {
    return cached;
  }

  const timestamps = await patternFetcher.fetchCommitTimestamps(username);
  const result = calculateCommitPattern(timestamps);

  await cache.set(cacheKey, result, CACHE_TTL.SCORE);

  if (refresh) {
    await cache.set(`${cacheKey}:refresh_cooldown`, '1', CACHE_TTL.REFRESH_COOLDOWN);
  }

  return result;
}
