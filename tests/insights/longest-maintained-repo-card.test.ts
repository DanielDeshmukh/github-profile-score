import { describe, it, expect } from 'vitest';
import { renderLongestMaintainedCard } from '../../src/renderer/insights/LongestMaintainedRepoCard.js';
import { tokens } from '../../src/theme/tokens.js';

describe('LongestMaintainedRepoCard renderer', () => {
  it('should render SVG with theme colors', () => {
    const svg = renderLongestMaintainedCard('my-project', 1000, 'https://github.com/u/my-project', '2020-01-01T00:00:00Z');
    expect(svg).toContain('<svg');
    expect(svg).toContain(tokens.bg);
    expect(svg).toContain(tokens.textTertiary);
    expect(svg).toContain(tokens.border);
  });

  it('should display years and months format', () => {
    const svg = renderLongestMaintainedCard('project', 400, 'url', '2023-01-01T00:00:00Z');
    expect(svg).toContain('1y');
    expect(svg).toContain('since 2023');
  });

  it('should display years only for exact years', () => {
    const svg = renderLongestMaintainedCard('project', 730, 'url', '2022-01-01T00:00:00Z');
    expect(svg).toContain('2y (since 2022)');
  });

  it('should display months for < 1 year', () => {
    const svg = renderLongestMaintainedCard('project', 90, 'url', '2024-01-01T00:00:00Z');
    expect(svg).toContain('3m');
  });

  it('should display days for < 30 days', () => {
    const svg = renderLongestMaintainedCard('project', 15, 'url', '2024-06-01T00:00:00Z');
    expect(svg).toContain('15d');
  });

  it('should truncate long repo names', () => {
    const longName = 'a-very-long-repo-name-that-exceeds-the-limit';
    const svg = renderLongestMaintainedCard(longName, 100, 'url', '2024-01-01T00:00:00Z');
    expect(svg).toContain('\u2026');
  });

  it('should render correct viewBox dimensions', () => {
    const svg = renderLongestMaintainedCard('repo', 1, 'url', '2024-01-01T00:00:00Z');
    expect(svg).toContain('width="320"');
    expect(svg).toContain('height="80"');
  });
});
