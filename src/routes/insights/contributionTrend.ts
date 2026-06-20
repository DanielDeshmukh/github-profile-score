import { Router } from 'express';
import type { Request, Response } from 'express';
import { CACHE_TTL } from '../../cache/index.js';
import { CACHE_KEYS } from '../../cache/keys.js';
import { ContributionTrendFetcher } from '../../fetcher/insights/ContributionTrendFetcher.js';
import { calculateContributionTrend } from '../../scorer/insights/contributionTrend.js';
import { renderContributionTrendCard } from '../../renderer/insights/ContributionTrendCard.js';
import { GitHubRateLimitError } from '../../types.js';
import { usernameValidator } from '../../middleware/usernameValidator.js';
import type { CacheProvider } from '../../types.js';
import type { ContributionTrendResult } from '../../scorer/insights/contributionTrend.js';

const SLUG = 'contribution-trend';

export function contributionTrendRouter(
  cache: CacheProvider,
  trendFetcher: ContributionTrendFetcher,
): Router {
  const router = Router();
  const usernameParam = usernameValidator;

  router.get(`/insights/:username/${SLUG}.svg`, usernameParam, async (req: Request, res: Response) => {
    const username = req.params.username as string;
    const refresh = req.query.refresh === '1';

    try {
      const result = await getCachedOrCompute(cache, trendFetcher, username, refresh);

      res.set({
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        ETag: `"${result.direction}-${result.yoyPercentage.toFixed(1)}"`,
      });
      res.send(renderContributionTrendCard(
        result.thisYearTotal,
        result.lastYearTotal,
        result.yoyPercentage,
        result.direction,
      ));
    } catch (err) {
      res.set({ 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-cache' });
      if (err instanceof GitHubRateLimitError) {
        res.status(429).send(renderContributionTrendCard(0, 0, 0, 'flat'));
      } else {
        res.status(err instanceof Error && 'statusCode' in err ? (err as { statusCode: number }).statusCode : 500).send(renderContributionTrendCard(0, 0, 0, 'flat'));
      }
    }
  });

  router.get(`/insights/:username`, usernameParam, async (req: Request, res: Response) => {
    const username = req.params.username as string;
    const refresh = req.query.refresh === '1';

    try {
      const result = await getCachedOrCompute(cache, trendFetcher, username, refresh);
      res.set({ 'Cache-Control': 'public, max-age=300' });
      res.json({
        username,
        contributionTrend: result,
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
  trendFetcher: ContributionTrendFetcher,
  username: string,
  refresh: boolean,
): Promise<ContributionTrendResult> {
  const cacheKey = CACHE_KEYS.insight(SLUG, username);

  if (refresh) {
    const cooldownKey = `${cacheKey}:refresh_cooldown`;
    const onCooldown = await cache.exists(cooldownKey);
    if (onCooldown) {
      const cached = await cache.get<ContributionTrendResult>(cacheKey);
      if (cached) return cached;
    }
  }

  const cached = await cache.get<ContributionTrendResult>(cacheKey);
  if (cached && !refresh) {
    return cached;
  }

  const twoYearData = await trendFetcher.fetchTwoYearContributions(username);
  const result = calculateContributionTrend(twoYearData.thisYearTotal, twoYearData.lastYearTotal);

  await cache.set(cacheKey, result, CACHE_TTL.SCORE);

  if (refresh) {
    await cache.set(`${cacheKey}:refresh_cooldown`, '1', CACHE_TTL.REFRESH_COOLDOWN);
  }

  return result;
}
