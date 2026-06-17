import { describe, it, expect } from 'vitest';
import { renderMostActiveRepoCard, renderMostActiveRepoEmptySvg } from '../../src/renderer/insights/MostActiveRepoCard.js';
import { THEME } from '../../src/theme/tokens.js';

describe('MostActiveRepoCard renderer', () => {
  it('should render SVG with theme colors', () => {
    const svg = renderMostActiveRepoCard('my-project', 340, 'https://github.com/user/my-project');
    expect(svg).toContain('<svg');
    expect(svg).toContain(THEME.cream);
    expect(svg).toContain(THEME.gold);
    expect(svg).toContain(THEME.goldLight);
    expect(svg).toContain(THEME.silver);
  });

  it('should include repo name and commit count', () => {
    const svg = renderMostActiveRepoCard('test-repo', 150, 'https://github.com/u/test-repo');
    expect(svg).toContain('test-repo');
    expect(svg).toContain('150');
    expect(svg).toContain('commits');
  });

  it('should truncate long repo names', () => {
    const longName = 'a-repo-with-a-very-long-name-that-exceeds-limit';
    const svg = renderMostActiveRepoCard(longName, 10, 'https://github.com/u/repo');
    expect(svg).toContain('\u2026');
    expect(svg).not.toContain(longName);
  });

  it('should not truncate short names', () => {
    const svg = renderMostActiveRepoCard('short', 5, 'https://github.com/u/short');
    expect(svg).toContain('short');
    expect(svg).not.toContain('\u2026');
  });

  it('should include repo URL as link (HTML-escaped)', () => {
    const url = 'https://github.com/user/project';
    const svg = renderMostActiveRepoCard('project', 10, url);
    expect(svg).toContain('href=');
    expect(svg).toContain('project');
  });

  it('should render correct viewBox dimensions', () => {
    const svg = renderMostActiveRepoCard('repo', 1, 'url');
    expect(svg).toContain('width="320"');
    expect(svg).toContain('height="80"');
    expect(svg).toContain('viewBox="0 0 320 80"');
  });

  it('should render empty state SVG', () => {
    const svg = renderMostActiveRepoEmptySvg();
    expect(svg).toContain('<svg');
    expect(svg).toContain('No public repos found');
    expect(svg).toContain(THEME.cream);
  });
});
