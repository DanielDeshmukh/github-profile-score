import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

import { getConfig } from './config.js';
import { createChildLogger } from './logger.js';
import { createCache, CACHE_KEYS, CACHE_TTL } from './cache/index.js';
import { GitHubFetcher } from './fetcher/index.js';
import { score } from './scorer/HeuristicScorer.js';
import { generateCallouts } from './ai/index.js';
import { renderSvg, renderErrorSvg, renderRateLimitSvg } from './renderer/SvgRenderer.js';
import { renderHtml } from './renderer/HtmlRenderer.js';
import { renderJson } from './renderer/JsonRenderer.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { usernameValidator } from './middleware/usernameValidator.js';
import { requestLogger } from './middleware/requestLogger.js';
import { escapeHtml } from './utils/escapeHtml.js';
import { statsRouter } from './routes/stats.js';
import { contributionTrendRouter } from './routes/insights/contributionTrend.js';
import { StatsFetcher } from './fetcher/StatsFetcher.js';
import { ContributionTrendFetcher } from './fetcher/insights/ContributionTrendFetcher.js';
import type { CacheProvider, ScoreResult } from './types.js';
import { GitHubRateLimitError } from './types.js';

const log = createChildLogger('server');

let cache: CacheProvider;
let fetcher: GitHubFetcher;

export async function buildApp(): Promise<express.Express> {
  const app = express();
  const config = getConfig();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(requestLogger);
  app.use(rateLimiter(100, 60000));

  cache = await createCache();
  fetcher = new GitHubFetcher();
  const statsFetcher = new StatsFetcher();
  const trendFetcher = new ContributionTrendFetcher();

  app.use(statsRouter(cache, fetcher, statsFetcher));
  app.use(contributionTrendRouter(cache, trendFetcher));

  const usernameParam = usernameValidator;

  app.get('/score/:username.svg', usernameParam, async (req, res) => {
    const username = req.params.username as string;
    const refresh = req.query.refresh === '1';

    try {
      const result = await getCachedOrCompute(username, refresh);
      res.set({
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        ETag: `"${result.total}-${result.scored_at}"`,
      });
      res.send(renderSvg(result));
    } catch (err) {
      res.set({ 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-cache' });
      if (err instanceof GitHubRateLimitError) {
        res.status(429).send(renderRateLimitSvg(username, err.resetAt));
      } else {
        res.status(err instanceof Error && 'statusCode' in err ? (err as { statusCode: number }).statusCode : 500).send(renderErrorSvg(username));
      }
    }
  });

  app.get('/score/:username', usernameParam, async (req, res) => {
    const username = req.params.username as string;
    const refresh = req.query.refresh === '1';

    try {
      const result = await getCachedOrCompute(username, refresh);
      res.set({ 'Cache-Control': 'public, max-age=300' });
      res.json(renderJson(result));
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

  app.get('/score/:username/html', usernameParam, async (req, res) => {
    const username = req.params.username as string;
    const refresh = req.query.refresh === '1';

    try {
      const result = await getCachedOrCompute(username, refresh);
      res.set({ 'Content-Type': 'text/html', 'Cache-Control': 'public, max-age=3600' });
      res.send(renderHtml(result));
    } catch (err) {
      if (err instanceof GitHubRateLimitError) {
        res.status(429).json({ error: 'rate_limited', retry_after: err.resetAt.toISOString() });
      } else {
        const status = err instanceof Error && 'statusCode' in err ? (err as { statusCode: number }).statusCode : 500;
        res.status(status).send(`<h1>Error: ${escapeHtml(err instanceof Error ? err.message : 'Unknown error')}</h1>`);
      }
    }
  });

  app.get('/score/:username/plan', usernameParam, async (req, res) => {
    const username = req.params.username as string;
    const refresh = req.query.refresh === '1';

    try {
      const result = await getCachedOrCompute(username, refresh);
      const improvements = (Object.entries(result.dimensions) as [string, { score: number; max: number; callout: string | null }][])
        .filter(([_, dim]) => dim.score < dim.max)
        .map(([dimension, dim]) => ({
          dimension,
          current_score: dim.score,
          max_score: dim.max,
          points_available: dim.max - dim.score,
          callout: dim.callout,
        }))
        .sort((a, b) => b.points_available - a.points_available)
        .map((item, index) => ({
          ...item,
          priority: index + 1,
        }));

      res.set({ 'Cache-Control': 'public, max-age=300' });
      res.json({
        username: result.username,
        total: result.total,
        grade: result.grade,
        improvements,
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

  app.get('/health', async (_req, res) => {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      cache: { type: config.REDIS_URL ? 'redis' : 'memory', connected: true },
      github: { rateLimitRemaining: fetcher.getRateLimitRemaining() },
    });
  });

  app.use(errorHandler);

  return app;
}

async function getCachedOrCompute(username: string, refresh: boolean): Promise<ScoreResult> {
  if (refresh) {
    const cooldownKey = CACHE_KEYS.refreshCooldown(username);
    const onCooldown = await cache.exists(cooldownKey);
    if (onCooldown) {
      const cached = await cache.get<ScoreResult>(CACHE_KEYS.score(username));
      if (cached) return { ...cached, cached: true };
    }
  }

  const cached = await cache.get<ScoreResult>(CACHE_KEYS.score(username));
  if (cached && !refresh) {
    const ttl = await cache.ttl(CACHE_KEYS.score(username));
    return { ...cached, cached: true, cache_age_seconds: ttl > 0 ? CACHE_TTL.SCORE - ttl : 0 };
  }

  const [profile, repos, events, commitCount] = await Promise.all([
    fetcher.fetchProfile(username),
    fetcher.fetchRepos(username),
    fetcher.fetchEvents(username),
    fetcher.fetchCommitCount(username),
  ]);

  const config = getConfig();
  const result = await score(profile, repos, events, config.SCORE_THRESHOLD, commitCount);

  await generateCallouts(result);

  await cache.set(CACHE_KEYS.score(username), result, CACHE_TTL.SCORE);

  if (refresh) {
    await cache.set(CACHE_KEYS.refreshCooldown(username), '1', CACHE_TTL.REFRESH_COOLDOWN);
  }

  return result;
}

export function startServer(app: express.Express): void {
  const config = getConfig();
  const server = app.listen(config.PORT, () => {
    log.info({ port: config.PORT }, 'Server started');
  });

  const shutdown = () => {
    log.info('Shutting down gracefully...');
    server.close(() => {
      log.info('Server closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 30000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
