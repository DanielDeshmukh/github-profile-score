import { describe, it, expect } from 'vitest';
import { renderContributionsCard, renderContributionsErrorSvg } from '../src/renderer/ContributionsCardRenderer.js';
import type { ContributionStats } from '../src/types/stats.js';
import { THEME } from '../src/theme/tokens.js';

function createMockStats(overrides: Partial<ContributionStats> = {}): ContributionStats {
  return {
    totalContributions: 500,
    rangeStart: '2024-01-01',
    rangeEnd: '2024-12-31',
    currentStreak: 15,
    currentStreakRange: { start: '2024-06-01', end: '2024-06-15' },
    longestStreak: 30,
    longestStreakRange: { start: '2024-01-10', end: '2024-02-08' },
    ...overrides,
  };
}

describe('ContributionsCardRenderer', () => {
  it('should render valid SVG with theme colors', () => {
    const stats = createMockStats();
    const svg = renderContributionsCard('testuser', stats);

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain(THEME.cream);
    expect(svg).toContain(THEME.gold);
    expect(svg).toContain(THEME.goldLight);
    expect(svg).toContain(THEME.silver);
    expect(svg).toContain(THEME.slate);
  });

  it('should include total contributions', () => {
    const stats = createMockStats({ totalContributions: 1234 });
    const svg = renderContributionsCard('testuser', stats);

    expect(svg).toContain('1234');
    expect(svg).toContain('Total Contributions');
  });

  it('should include current streak', () => {
    const stats = createMockStats({ currentStreak: 21 });
    const svg = renderContributionsCard('testuser', stats);

    expect(svg).toContain('21');
    expect(svg).toContain('day streak');
  });

  it('should include longest streak', () => {
    const stats = createMockStats({ longestStreak: 45 });
    const svg = renderContributionsCard('testuser', stats);

    expect(svg).toContain('45');
    expect(svg).toContain('Longest Streak');
  });

  it('should handle zero contributions', () => {
    const stats = createMockStats({
      totalContributions: 0,
      currentStreak: 0,
      longestStreak: 0,
    });
    const svg = renderContributionsCard('testuser', stats);

    expect(svg).toContain('0');
    expect(svg).toContain('No active streak');
    expect(svg).toContain('N/A');
  });

  it('should escape username in error SVG', () => {
    const svg = renderContributionsErrorSvg('testuser');

    expect(svg).toContain('testuser');
    expect(svg).toContain('Contributions Unavailable');
    expect(svg).toContain(THEME.cream);
  });

  it('should have correct viewBox dimensions', () => {
    const stats = createMockStats();
    const svg = renderContributionsCard('testuser', stats);

    expect(svg).toContain('width="480"');
    expect(svg).toContain('height="200"');
    expect(svg).toContain('viewBox="0 0 480 200"');
  });

  it('should contain streak ring elements', () => {
    const stats = createMockStats({ currentStreak: 10, longestStreak: 20 });
    const svg = renderContributionsCard('testuser', stats);

    expect(svg).toContain('stroke-dasharray');
    expect(svg).toContain('stroke-dashoffset');
    expect(svg).toContain('stroke-linecap="round"');
  });
});
