import { describe, it, expect } from 'vitest';
import { CACHE_KEYS, CACHE_TTL } from '../src/cache/index.js';

describe('Cache key isolation', () => {
  it('score and stats keys should not collide for same username', () => {
    const username = 'testuser';
    const scoreKey = CACHE_KEYS.score(username);
    const statsKey = CACHE_KEYS.stats(username);

    expect(scoreKey).not.toBe(statsKey);
    expect(scoreKey).toBe('score:testuser');
    expect(statsKey).toBe('stats:v1:testuser');
  });

  it('refresh cooldown keys should not collide', () => {
    const username = 'testuser';
    const scoreCooldown = CACHE_KEYS.refreshCooldown(username);
    const statsCooldown = CACHE_KEYS.statsRefreshCooldown(username);

    expect(scoreCooldown).not.toBe(statsCooldown);
    expect(scoreCooldown).toBe('refresh_cooldown:testuser');
    expect(statsCooldown).toBe('stats:v1:refresh_cooldown:testuser');
  });

  it('different usernames should produce different keys', () => {
    const key1 = CACHE_KEYS.stats('user1');
    const key2 = CACHE_KEYS.stats('user2');

    expect(key1).not.toBe(key2);
  });

  it('score TTL and stats TTL should default to same value', () => {
    expect(CACHE_TTL.SCORE).toBe(300);
    expect(CACHE_TTL.STATS).toBe(300);
  });

  it('refresh cooldown TTL should be defined', () => {
    expect(CACHE_TTL.REFRESH_COOLDOWN).toBe(600);
  });

  it('github data TTL should be separate from score/stats TTL', () => {
    expect(CACHE_TTL.GITHUB_DATA).toBe(3600);
  });
});
