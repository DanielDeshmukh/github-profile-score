import { describe, it, expect } from 'vitest';
import { renderContributionsCard, renderContributionsErrorSvg } from '../src/renderer/ContributionsCardRenderer.js';
import type { ContributionStats } from '../src/types/stats.js';
import { tokens } from '../src/theme/tokens.js';

function createMockStats(overrides: Partial<ContributionStats> = {}): ContributionStats {
  return {
    totalContributions: 500,
    rangeStart: '2024-01-01',
    rangeEnd: '2024-12-31',
    currentStreak: 15,
    currentStreakRange: { start: '2024-06-01', end: '2024-06-15' },
    longestStreak: 30,
    longestStreakRange: { start: '2024-01-10', end: '2024-02-08' },
    weeklyCounts: [10, 15, 8, 20, 12, 5, 18, 25, 14, 9, 22, 16],
    ...overrides,
  };
}

describe('ContributionsCardRenderer', () => {
  it('should render valid SVG with theme colors', () => {
    const stats = createMockStats();
    const svg = renderContributionsCard('testuser', stats);

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain(tokens.bg);
    expect(svg).toContain(tokens.textPrimary);
    expect(svg).toContain(tokens.textSecondary);
  });

  it('should include total contributions', () => {
    const stats = createMockStats({ totalContributions: 1234 });
    const svg = renderContributionsCard('testuser', stats);

    expect(svg).toContain('1,234');
    expect(svg).toContain('Contributions');
  });

  it('should include current streak', () => {
    const stats = createMockStats({ currentStreak: 21 });
    const svg = renderContributionsCard('testuser', stats);

    expect(svg).toContain('21');
    expect(svg).toContain('current streak');
  });

  it('should include longest streak', () => {
    const stats = createMockStats({ longestStreak: 45 });
    const svg = renderContributionsCard('testuser', stats);

    expect(svg).toContain('45');
    expect(svg).toContain('longest streak');
  });

  it('should handle zero contributions', () => {
    const stats = createMockStats({
      totalContributions: 0,
      currentStreak: 0,
      longestStreak: 0,
    });
    const svg = renderContributionsCard('testuser', stats);

    expect(svg).toContain('>0<');
    expect(svg).toContain('current streak');
    expect(svg).toContain('longest streak');
  });

  it('should escape username in error SVG', () => {
    const svg = renderContributionsErrorSvg('testuser');

    expect(svg).toContain('testuser');
    expect(svg).toContain('Contributions unavailable');
    expect(svg).toContain(tokens.bg);
    expect(svg).toContain(tokens.red);
  });

  it('should have correct viewBox dimensions', () => {
    const stats = createMockStats();
    const svg = renderContributionsCard('testuser', stats);

    expect(svg).toContain('width="480"');
    expect(svg).toContain('height="210"');
    expect(svg).toContain('viewBox="0 0 480 210"');
  });

  it('should contain sparkline strip elements', () => {
    const stats = createMockStats({ currentStreak: 10, longestStreak: 20 });
    const svg = renderContributionsCard('testuser', stats);

    expect(svg).toContain('Last 12 weeks');
    expect(svg).toContain('fill-opacity');
    expect(svg).toContain(tokens.green);
  });
});
