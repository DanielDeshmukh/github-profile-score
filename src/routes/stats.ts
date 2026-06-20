import { Router } from 'express';
import type { Request, Response } from 'express';
import { CACHE_TTL } from '../cache/index.js';
import { GitHubFetcher } from '../fetcher/index.js';
import { StatsFetcher } from '../fetcher/StatsFetcher.js';
import { calculateStreaks } from '../scorer/streak.js';
import { renderContributionsCard, renderContributionsErrorSvg } from '../renderer/ContributionsCardRenderer.js';
import { renderStatsCard, renderLanguagesCard, renderStatsErrorSvg } from '../renderer/StatsCardRenderer.js';
import { GitHubRateLimitError } from '../types.js';
import { usernameValidator } from '../middleware/usernameValidator.js';
import type { StatsResult, ContributionStats, GitHubProfileStats } from '../types/stats.js';
import type { CacheProvider } from '../types.js';

let cache: CacheProvider;
let statsFetcher: StatsFetcher;
let githubFetcher: GitHubFetcher;

function getCacheKeyPrefix(): string {
  return 'stats:v1';
}

function getStatsCacheKey(username: string): string {
  return `${getCacheKeyPrefix()}:${username}`;
}

function getStatsRefreshCooldownKey(username: string): string {
  return `${getCacheKeyPrefix()}:refresh_cooldown:${username}`;
}

export function statsRouter(
  cacheInstance: CacheProvider,
  githubFetcherInstance: GitHubFetcher,
  statsFetcherInstance: StatsFetcher,
): Router {
  cache = cacheInstance;
  githubFetcher = githubFetcherInstance;
  statsFetcher = statsFetcherInstance;

  const router = Router();
  const usernameParam = usernameValidator;

  router.get('/stats/:username/contributions.svg', usernameParam, handleContributionsSvg);
  router.get('/stats/:username/overview.svg', usernameParam, handleOverviewSvg);
  router.get('/stats/:username/languages.svg', usernameParam, handleLanguagesSvg);
  router.get('/stats/:username', usernameParam, handleStatsJson);

  return router;
}

async function handleContributionsSvg(req: Request, res: Response): Promise<void> {
  const username = req.params.username as string;
  const refresh = req.query.refresh === '1';

  try {
    const result = await getCachedOrComputeStats(username, refresh);
    res.set({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      ETag: `"${result.contributions.totalContributions}-${result.generated_at}"`,
    });
    res.send(renderContributionsCard(username, result.contributions));
  } catch (err) {
    res.set({ 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-cache' });
    if (err instanceof GitHubRateLimitError) {
      res.status(429).send(renderContributionsErrorSvg(username));
    } else {
      res.status(err instanceof Error && 'statusCode' in err ? (err as { statusCode: number }).statusCode : 500).send(renderContributionsErrorSvg(username));
    }
  }
}

async function handleOverviewSvg(req: Request, res: Response): Promise<void> {
  const username = req.params.username as string;
  const refresh = req.query.refresh === '1';

  try {
    const result = await getCachedOrComputeStats(username, refresh);
    res.set({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      ETag: `"${result.profile.totalStarsEarned}-${result.generated_at}"`,
    });
    res.send(renderStatsCard(username, result.profile, result.languages));
  } catch (err) {
    res.set({ 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-cache' });
    if (err instanceof GitHubRateLimitError) {
      res.status(429).send(renderStatsErrorSvg(username));
    } else {
      res.status(err instanceof Error && 'statusCode' in err ? (err as { statusCode: number }).statusCode : 500).send(renderStatsErrorSvg(username));
    }
  }
}

async function handleLanguagesSvg(req: Request, res: Response): Promise<void> {
  const username = req.params.username as string;
  const refresh = req.query.refresh === '1';

  try {
    const result = await getCachedOrComputeStats(username, refresh);
    res.set({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      ETag: `"languages-${result.generated_at}"`,
    });
    res.send(renderLanguagesCard(result.languages));
  } catch (err) {
    res.set({ 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-cache' });
    if (err instanceof GitHubRateLimitError) {
      res.status(429).send(renderStatsErrorSvg(username));
    } else {
      res.status(err instanceof Error && 'statusCode' in err ? (err as { statusCode: number }).statusCode : 500).send(renderStatsErrorSvg(username));
    }
  }
}

async function handleStatsJson(req: Request, res: Response): Promise<void> {
  const username = req.params.username as string;
  const refresh = req.query.refresh === '1';

  try {
    const result = await getCachedOrComputeStats(username, refresh);
    res.set({ 'Cache-Control': 'public, max-age=300' });
    res.json({
      username: result.username,
      contributions: result.contributions,
      profile: result.profile,
      languages: result.languages,
      cached: result.cached,
      cache_age_seconds: result.cache_age_seconds,
      generated_at: result.generated_at,
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
}

async function getCachedOrComputeStats(username: string, refresh: boolean): Promise<StatsResult> {
  if (refresh) {
    const cooldownKey = getStatsRefreshCooldownKey(username);
    const onCooldown = await cache.exists(cooldownKey);
    if (onCooldown) {
      const cached = await cache.get<StatsResult>(getStatsCacheKey(username));
      if (cached) return { ...cached, cached: true };
    }
  }

  const cached = await cache.get<StatsResult>(getStatsCacheKey(username));
  if (cached && !refresh) {
    const ttl = await cache.ttl(getStatsCacheKey(username));
    return { ...cached, cached: true, cache_age_seconds: ttl > 0 ? CACHE_TTL.SCORE - ttl : 0 };
  }

  const [repos, calendar, aggregates, languages] = await Promise.all([
    githubFetcher.fetchRepos(username),
    statsFetcher.fetchContributionCalendar(username),
    statsFetcher.fetchContributionAggregates(username),
    statsFetcher.fetchLanguageBreakdown(username),
  ]);

  const totalStars = await statsFetcher.fetchTotalStars(repos);

  const streaks = calculateStreaks(
    calendar.weeks.flatMap((w) => w.contributionDays),
  );

  const contributions: ContributionStats = {
    totalContributions: calendar.totalContributions,
    rangeStart: calendar.weeks[0]?.firstDay ?? '',
    rangeEnd: calendar.weeks[calendar.weeks.length - 1]?.firstDay ?? '',
    currentStreak: streaks.current,
    currentStreakRange: streaks.currentRange,
    longestStreak: streaks.longest,
    longestStreakRange: streaks.longestRange,
  };

  const totalActivity = totalStars + aggregates.totalCommits + aggregates.totalPRs + aggregates.totalIssues;
  let grade: GitHubProfileStats['grade'] = 'F';
  if (totalActivity >= 900) grade = 'A';
  else if (totalActivity >= 700) grade = 'B';
  else if (totalActivity >= 500) grade = 'C';
  else if (totalActivity >= 300) grade = 'D';

  const profile: GitHubProfileStats = {
    totalStarsEarned: totalStars,
    totalCommitsLastYear: aggregates.totalCommits,
    totalPRs: aggregates.totalPRs,
    totalIssues: aggregates.totalIssues,
    grade,
  };

  const result: StatsResult = {
    username,
    contributions,
    profile,
    languages,
    cached: false,
    cache_age_seconds: 0,
    generated_at: new Date().toISOString(),
  };

  await cache.set(getStatsCacheKey(username), result, CACHE_TTL.SCORE);

  if (refresh) {
    await cache.set(getStatsRefreshCooldownKey(username), '1', CACHE_TTL.REFRESH_COOLDOWN);
  }

  return result;
}
