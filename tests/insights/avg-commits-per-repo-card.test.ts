import { describe, it, expect } from 'vitest';
import { renderAvgCommitsPerRepoCard } from '../../src/renderer/insights/AvgCommitsPerRepoCard.js';
import { THEME } from '../../src/theme/tokens.js';

describe('AvgCommitsPerRepoCard renderer', () => {
  it('should render SVG with theme colors', () => {
    const svg = renderAvgCommitsPerRepoCard(20, 5, 100);
    expect(svg).toContain('<svg');
    expect(svg).toContain(THEME.cream);
    expect(svg).toContain(THEME.gold);
    expect(svg).toContain(THEME.goldLight);
    expect(svg).toContain(THEME.silver);
  });

  it('should display average with 1 decimal', () => {
    const svg = renderAvgCommitsPerRepoCard(20, 5, 100);
    expect(svg).toContain('20.0');
  });

  it('should display total commits and repo count', () => {
    const svg = renderAvgCommitsPerRepoCard(20, 5, 100);
    expect(svg).toContain('100');
    expect(svg).toContain('5 repos');
  });

  it('should use singular "repo" for 1', () => {
    const svg = renderAvgCommitsPerRepoCard(42, 1, 42);
    expect(svg).toContain('1 repo');
    expect(svg).not.toContain('1 repos');
  });

  it('should handle zero average', () => {
    const svg = renderAvgCommitsPerRepoCard(0, 0, 0);
    expect(svg).toContain('0.0');
    expect(svg).toContain('0 repos');
  });

  it('should render correct viewBox dimensions', () => {
    const svg = renderAvgCommitsPerRepoCard(10, 2, 20);
    expect(svg).toContain('width="320"');
    expect(svg).toContain('height="80"');
  });
});
