import { describe, it, expect } from 'vitest';
import { findMostStarredRepo } from '../../src/scorer/insights/mostStarredRepo.js';
import { renderMostStarredRepoCard, renderMostStarredRepoEmptySvg } from '../../src/renderer/insights/MostStarredRepoCard.js';
import type { GitHubRepo } from '../../src/types.js';

function mockRepo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    id: 1, name: 'test-repo', full_name: 'u/test-repo',
    description: null, stargazers_count: 10, forks_count: 0,
    watchers_count: 0, language: null, topics: [],
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-06-01T00:00:00Z',
    pushed_at: '2024-06-01T00:00:00Z', html_url: 'https://github.com/u/test-repo',
    fork: false, has_wiki: false, has_pages: false,
    open_issues_count: 0, license: null, ...overrides,
  };
}

describe('Most Starred Repo insight integration', () => {
  it('should produce valid SVG from real calculation flow', () => {
    const repos = [
      mockRepo({ name: 'small', stargazers_count: 5, pushed_at: '2024-06-01T00:00:00Z' }),
      mockRepo({ name: 'popular', stargazers_count: 1500, pushed_at: '2024-03-01T00:00:00Z' }),
      mockRepo({ name: 'mid', stargazers_count: 100, pushed_at: '2024-05-01T00:00:00Z' }),
    ];

    const result = findMostStarredRepo(repos);
    expect(result).not.toBeNull();
    expect(result!.repoName).toBe('popular');
    expect(result!.stars).toBe(1500);

    const svg = renderMostStarredRepoCard(result!.repoName, result!.stars, result!.repoUrl);
    expect(svg).toContain('<svg');
    expect(svg).toContain('popular');
    expect(svg).toContain('1,500');
    expect(svg).toContain('stars');
  });

  it('should handle empty input end-to-end', () => {
    const result = findMostStarredRepo([]);
    expect(result).toBeNull();

    const svg = renderMostStarredRepoEmptySvg();
    expect(svg).toContain('No public repos found');
  });

  it('should handle repos with equal stars (tie-break)', () => {
    const repos = [
      mockRepo({ name: 'alpha', stargazers_count: 100, pushed_at: '2024-01-01T00:00:00Z' }),
      mockRepo({ name: 'beta', stargazers_count: 100, pushed_at: '2024-06-01T00:00:00Z' }),
    ];

    const result = findMostStarredRepo(repos);
    expect(result!.repoName).toBe('beta');

    const svg = renderMostStarredRepoCard(result!.repoName, result!.stars, result!.repoUrl);
    expect(svg).toContain('100');
    expect(svg).toContain('stars');
  });
});
