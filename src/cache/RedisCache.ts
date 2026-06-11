import type { CacheProvider } from '../types.js';
import { getConfig } from '../config.js';
import { createChildLogger } from '../logger.js';
import { MemoryCache } from './MemoryCache.js';

const log = createChildLogger('cache');

async function createRedisCache(redisUrl: string): Promise<CacheProvider> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Redis = (await import('ioredis')).default as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client: any = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  await client.connect();
  log.info('Connected to Redis');

  return {
    async get<T>(key: string): Promise<T | null> {
      const data = await client.get(key);
      if (!data) return null;
      try {
        return JSON.parse(data) as T;
      } catch {
        return null;
      }
    },
    async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
      await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    },
    async del(key: string): Promise<void> {
      await client.del(key);
    },
    async exists(key: string): Promise<boolean> {
      return (await client.exists(key)) === 1;
    },
    async ttl(key: string): Promise<number> {
      return client.ttl(key);
    },
  };
}

export async function createCache(): Promise<CacheProvider> {
  const config = getConfig();

  if (config.REDIS_URL) {
    try {
      return await createRedisCache(config.REDIS_URL);
    } catch (err) {
      log.warn({ error: err instanceof Error ? err.message : err }, 'Redis connection failed, falling back to memory cache');
    }
  }

  log.info('Using in-memory cache');
  return new MemoryCache();
}
