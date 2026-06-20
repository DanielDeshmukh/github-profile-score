import { describe, it, expect } from 'vitest';
import { renderContributionTrendCard } from '../../src/renderer/insights/ContributionTrendCard.js';
import { tokens } from '../../src/theme/tokens.js';

describe('ContributionTrendCard renderer', () => {
  it('should render SVG with theme colors', () => {
    const svg = renderContributionTrendCard(100, 80, 25, 'up');
    expect(svg).toContain('<svg');
    expect(svg).toContain(tokens.bg);
    expect(svg).toContain(tokens.green);
    expect(svg).toContain(tokens.border);
  });

  it('should show up arrow for upward trend', () => {
    const svg = renderContributionTrendCard(150, 100, 50, 'up');
    expect(svg).toContain('\u2191');
    expect(svg).toContain('50.0%');
    expect(svg).toContain('Trending up');
  });

  it('should show down arrow for downward trend', () => {
    const svg = renderContributionTrendCard(50, 100, -50, 'down');
    expect(svg).toContain('\u2193');
    expect(svg).toContain('50.0%');
    expect(svg).toContain('Trending down');
  });

  it('should show right arrow for flat trend', () => {
    const svg = renderContributionTrendCard(100, 100, 0, 'flat');
    expect(svg).toContain('\u2192');
    expect(svg).toContain('0%');
    expect(svg).toContain('Steady');
  });

  it('should display this year and last year totals', () => {
    const svg = renderContributionTrendCard(100, 80, 25, 'up');
    expect(svg).toContain('100');
    expect(svg).toContain('80');
    expect(svg).toContain('last year');
  });

  it('should render correct viewBox dimensions', () => {
    const svg = renderContributionTrendCard(10, 5, 100, 'up');
    expect(svg).toContain('width="320"');
    expect(svg).toContain('height="80"');
  });
});
