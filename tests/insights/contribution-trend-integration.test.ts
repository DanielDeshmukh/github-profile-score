import { describe, it, expect } from 'vitest';
import { calculateContributionTrend } from '../../src/scorer/insights/contributionTrend.js';
import { renderContributionTrendCard } from '../../src/renderer/insights/ContributionTrendCard.js';

describe('Contribution Trend insight integration', () => {
  it('should produce valid SVG from real calculation flow (up)', () => {
    const result = calculateContributionTrend(200, 120);
    expect(result.direction).toBe('up');
    expect(result.yoyPercentage).toBeCloseTo(66.7, 0);

    const svg = renderContributionTrendCard(
      result.thisYearTotal,
      result.lastYearTotal,
      result.yoyPercentage,
      result.direction,
    );
    expect(svg).toContain('\u2191');
    expect(svg).toContain('200');
    expect(svg).toContain('120');
  });

  it('should produce valid SVG from real calculation flow (down)', () => {
    const result = calculateContributionTrend(30, 100);
    expect(result.direction).toBe('down');

    const svg = renderContributionTrendCard(
      result.thisYearTotal,
      result.lastYearTotal,
      result.yoyPercentage,
      result.direction,
    );
    expect(svg).toContain('\u2193');
    expect(svg).toContain('Trending down');
  });

  it('should produce valid SVG from real calculation flow (flat)', () => {
    const result = calculateContributionTrend(100, 100);
    expect(result.direction).toBe('flat');

    const svg = renderContributionTrendCard(
      result.thisYearTotal,
      result.lastYearTotal,
      result.yoyPercentage,
      result.direction,
    );
    expect(svg).toContain('\u2192');
    expect(svg).toContain('Steady');
  });

  it('should handle brand new accounts (no contributions)', () => {
    const result = calculateContributionTrend(0, 0);
    expect(result.direction).toBe('flat');
    expect(result.yoyPercentage).toBe(0);

    const svg = renderContributionTrendCard(
      result.thisYearTotal,
      result.lastYearTotal,
      result.yoyPercentage,
      result.direction,
    );
    expect(svg).toContain('0%');
  });
});
