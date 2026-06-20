import { Router } from 'express';
import type { Request, Response } from 'express';
import { CACHE_TTL } from '../../cache/index.js';
import { CACHE_KEYS } from '../../cache/keys.js';
import { GitHubFetcher } from '../../fetcher/index.js';
import { calculateAccountAge } from '../../scorer/insights/accountAge.js';
import { renderAccountAgeCard } from '../../renderer/insights/AccountAgeCard.js';
import { GitHubRateLimitError } from '../../types.js';
import { usernameValidator } from '../../middleware/usernameValidator.js';
import type { CacheProvider } from '../../types.js';

const SLUG = 'account-age';

export function accountAgeRouter(
  cache: CacheProvider,
  githubFetcher: GitHubFetcher,
): Router {
  const router = Router();
  const usernameParam = usernameValidator;

  router.get(`/insights/:username/${SLUG}.svg`, usernameParam, async (req: Request, res: Response) => {
    const username = req.params.username as string;
    const refresh = req.query.refresh === '1';

    try {
      const result = await getCachedOrCompute(cache, githubFetcher, username, refresh);

      res.set({
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        ETag: `"${result.years}-${result.months}"`,
      });
      res.send(renderAccountAgeCard(result.years, result.months));
    } catch (err) {
      res.set({ 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-cache' });
      if (err instanceof GitHubRateLimitError) {
        res.status(429).send(renderAccountAgeCard(0, 0));
      } else {
        res.status(err instanceof Error && 'statusCode' in err ? (err as { statusCode: number }).statusCode : 500).send(renderAccountAgeCard(0, 0));
      }
    }
  });

  router.get(`/insights/:username`, usernameParam, async (req: Request, res: Response) => {
    const username = req.params.username as string;
    const refresh = req.query.refresh === '1';

    try {
      const result = await getCachedOrCompute(cache, githubFetcher, username, refresh);
      res.set({ 'Cache-Control': 'public, max-age=300' });
      res.json({
        username,
        accountAge: result,
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
  username: string,
  refresh: boolean,
): Promise<{ years: number; months: number; createdAt: string }> {
  const cacheKey = CACHE_KEYS.insight(SLUG, username);

  if (refresh) {
    const cooldownKey = `${cacheKey}:refresh_cooldown`;
    const onCooldown = await cache.exists(cooldownKey);
    if (onCooldown) {
      const cached = await cache.get<{ years: number; months: number; createdAt: string }>(cacheKey);
      if (cached) return cached;
    }
  }

  const cached = await cache.get<{ years: number; months: number; createdAt: string }>(cacheKey);
  if (cached && !refresh) {
    return cached;
  }

  const profile = await githubFetcher.fetchProfile(username);
  const result = calculateAccountAge(profile.created_at);

  await cache.set(cacheKey, result, CACHE_TTL.SCORE);

  if (refresh) {
    await cache.set(`${cacheKey}:refresh_cooldown`, '1', CACHE_TTL.REFRESH_COOLDOWN);
  }

  return result;
}
