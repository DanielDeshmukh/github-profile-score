import { describe, it, expect } from 'vitest';
import { CACHE_KEYS, CACHE_TTL } from '../src/cache/index.js';
import { THEME, THEME_DERIVED } from '../src/theme/tokens.js';

describe('Stats feature integration', () => {
  it('should have correct cache key isolation', () => {
    const username = 'testuser';
    const scoreKey = CACHE_KEYS.score(username);
    const statsKey = CACHE_KEYS.stats(username);

    expect(scoreKey).not.toBe(statsKey);
    expect(scoreKey).toBe('score:testuser');
    expect(statsKey).toBe('stats:v1:testuser');
  });

  it('should have correct theme tokens', () => {
    expect(THEME.cream).toBe('#0d1117');
    expect(THEME.gold).toBe('#58a6ff');
    expect(THEME.goldLight).toBe('#e6edf3');
    expect(THEME.slate).toBe('#30363d');
    expect(THEME.silver).toBe('#8b949e');
    expect(THEME.charcoal).toBe('#0d1117');
  });

  it('should have correct derived tokens', () => {
    expect(THEME_DERIVED.goldTransparent).toBe('rgba(88, 166, 255, 0.15)');
    expect(THEME_DERIVED.textMuted).toBe('#8b949e');
    expect(THEME_DERIVED.barTrack).toBe('#21262d');
  });

  it('should have matching TTL values', () => {
    expect(CACHE_TTL.SCORE).toBe(300);
    expect(CACHE_TTL.STATS).toBe(300);
    expect(CACHE_TTL.REFRESH_COOLDOWN).toBe(600);
  });

  it('should have distinct refresh cooldown keys', () => {
    const username = 'testuser';
    const scoreCooldown = CACHE_KEYS.refreshCooldown(username);
    const statsCooldown = CACHE_KEYS.statsRefreshCooldown(username);

    expect(scoreCooldown).not.toBe(statsCooldown);
    expect(scoreCooldown).toBe('refresh_cooldown:testuser');
    expect(statsCooldown).toBe('stats:v1:refresh_cooldown:testuser');
  });
});
