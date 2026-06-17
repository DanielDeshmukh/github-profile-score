import { describe, it, expect } from 'vitest';
import { findMostActiveRepo } from '../../src/scorer/insights/mostActiveRepo.js';
import type { RepoCommitCount } from '../../src/types/insights.js';

function mockRepo(name: string, commits: number, pushedAt: string): RepoCommitCount {
  return {
    repoName: name,
    repoUrl: `https://github.com/testuser/${name}`,
    commitCount: commits,
    pushedAt,
  };
}

describe('findMostActiveRepo', () => {
  it('should return null for empty repos', () => {
    expect(findMostActiveRepo([])).toBeNull();
  });

  it('should return the single repo when only one exists', () => {
    const repos = [mockRepo('only-repo', 10, '2024-01-01T00:00:00Z')];
    const result = findMostActiveRepo(repos);
    expect(result).toEqual({
      repoName: 'only-repo',
      commitCount: 10,
      repoUrl: 'https://github.com/testuser/only-repo',
    });
  });

  it('should return the repo with most commits', () => {
    const repos = [
      mockRepo('small-repo', 5, '2024-06-01T00:00:00Z'),
      mockRepo('big-repo', 100, '2024-03-01T00:00:00Z'),
      mockRepo('mid-repo', 30, '2024-05-01T00:00:00Z'),
    ];
    const result = findMostActiveRepo(repos);
    expect(result?.repoName).toBe('big-repo');
    expect(result?.commitCount).toBe(100);
  });

  it('should break ties by most recent push date', () => {
    const repos = [
      mockRepo('older-active', 50, '2024-01-01T00:00:00Z'),
      mockRepo('newer-active', 50, '2024-06-01T00:00:00Z'),
    ];
    const result = findMostActiveRepo(repos);
    expect(result?.repoName).toBe('newer-active');
  });

  it('should handle all zero-commit repos', () => {
    const repos = [
      mockRepo('empty-1', 0, '2024-01-01T00:00:00Z'),
      mockRepo('empty-2', 0, '2024-06-01T00:00:00Z'),
    ];
    const result = findMostActiveRepo(repos);
    expect(result).not.toBeNull();
    expect(result?.commitCount).toBe(0);
  });

  it('should pick the first when all factors are identical', () => {
    const repos = [
      mockRepo('first', 10, '2024-01-01T00:00:00Z'),
      mockRepo('second', 10, '2024-01-01T00:00:00Z'),
    ];
    const result = findMostActiveRepo(repos);
    expect(result?.repoName).toBe('first');
  });
});
