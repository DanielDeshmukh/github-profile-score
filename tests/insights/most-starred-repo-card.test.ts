import { describe, it, expect } from 'vitest';
import { renderMostStarredRepoCard, renderMostStarredRepoEmptySvg } from '../../src/renderer/insights/MostStarredRepoCard.js';
import { tokens } from '../../src/theme/tokens.js';

describe('MostStarredRepoCard renderer', () => {
  it('should render SVG with theme colors', () => {
    const svg = renderMostStarredRepoCard('my-project', 1200, 'https://github.com/user/my-project');
    expect(svg).toContain('<svg');
    expect(svg).toContain(tokens.bg);
    expect(svg).toContain(tokens.textTertiary);
    expect(svg).toContain(tokens.border);
  });

  it('should include repo name and star count', () => {
    const svg = renderMostStarredRepoCard('test-repo', 500, 'https://github.com/u/test-repo');
    expect(svg).toContain('test-repo');
    expect(svg).toContain('500');
    expect(svg).toContain('stars');
  });

  it('should truncate long repo names', () => {
    const longName = 'a-repo-with-a-very-long-name-that-exceeds-limit';
    const svg = renderMostStarredRepoCard(longName, 10, 'https://github.com/u/repo');
    expect(svg).toContain('\u2026');
    expect(svg).not.toContain(longName);
  });

  it('should not truncate short names', () => {
    const svg = renderMostStarredRepoCard('short', 5, 'https://github.com/u/short');
    expect(svg).toContain('short');
    expect(svg).not.toContain('\u2026');
  });

  it('should render correct viewBox dimensions', () => {
    const svg = renderMostStarredRepoCard('repo', 1, 'url');
    expect(svg).toContain('width="320"');
    expect(svg).toContain('height="80"');
  });

  it('should render empty state SVG', () => {
    const svg = renderMostStarredRepoEmptySvg();
    expect(svg).toContain('<svg');
    expect(svg).toContain('No public repos found');
    expect(svg).toContain(tokens.bg);
  });
});
