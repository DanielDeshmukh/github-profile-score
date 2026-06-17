import { describe, it, expect } from 'vitest';
import { findMostStarredRepo } from '../../src/scorer/insights/mostStarredRepo.js';
import type { GitHubRepo } from '../../src/types.js';

function mockRepo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    id: 1,
    name: 'test-repo',
    full_name: 'testuser/test-repo',
    description: null,
    stargazers_count: 10,
    forks_count: 0,
    watchers_count: 0,
    language: null,
    topics: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
    pushed_at: '2024-06-01T00:00:00Z',
    html_url: 'https://github.com/testuser/test-repo',
    fork: false,
    has_wiki: false,
    has_pages: false,
    open_issues_count: 0,
    license: null,
    ...overrides,
  };
}

describe('findMostStarredRepo', () => {
  it('should return null for empty repos', () => {
    expect(findMostStarredRepo([])).toBeNull();
  });

  it('should return the single repo', () => {
    const repos = [mockRepo({ name: 'only', stargazers_count: 5 })];
    const result = findMostStarredRepo(repos);
    expect(result?.repoName).toBe('only');
    expect(result?.stars).toBe(5);
  });

  it('should return the repo with most stars', () => {
    const repos = [
      mockRepo({ name: 'small', stargazers_count: 5 }),
      mockRepo({ name: 'big', stargazers_count: 500 }),
      mockRepo({ name: 'mid', stargazers_count: 50 }),
    ];
    const result = findMostStarredRepo(repos);
    expect(result?.repoName).toBe('big');
    expect(result?.stars).toBe(500);
  });

  it('should break ties by most recent push date', () => {
    const repos = [
      mockRepo({ name: 'older', stargazers_count: 100, pushed_at: '2024-01-01T00:00:00Z' }),
      mockRepo({ name: 'newer', stargazers_count: 100, pushed_at: '2024-06-01T00:00:00Z' }),
    ];
    const result = findMostStarredRepo(repos);
    expect(result?.repoName).toBe('newer');
  });

  it('should break ties by alphabetical order when push dates are identical', () => {
    const repos = [
      mockRepo({ name: 'beta', stargazers_count: 50, pushed_at: '2024-06-01T00:00:00Z' }),
      mockRepo({ name: 'alpha', stargazers_count: 50, pushed_at: '2024-06-01T00:00:00Z' }),
    ];
    const result = findMostStarredRepo(repos);
    expect(result?.repoName).toBe('alpha');
  });

  it('should handle all zero-star repos', () => {
    const repos = [
      mockRepo({ name: 'empty-1', stargazers_count: 0, pushed_at: '2024-01-01T00:00:00Z' }),
      mockRepo({ name: 'empty-2', stargazers_count: 0, pushed_at: '2024-06-01T00:00:00Z' }),
    ];
    const result = findMostStarredRepo(repos);
    expect(result).not.toBeNull();
    expect(result?.stars).toBe(0);
  });
});
