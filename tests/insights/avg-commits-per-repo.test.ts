import { describe, it, expect } from 'vitest';
import { calculateAvgCommitsPerRepo } from '../../src/scorer/insights/avgCommitsPerRepo.js';
import type { RepoCommitCount } from '../../src/types/insights.js';

function mockRepo(name: string, commits: number): RepoCommitCount {
  return {
    repoName: name,
    repoUrl: `https://github.com/testuser/${name}`,
    commitCount: commits,
    pushedAt: '2024-06-01T00:00:00Z',
  };
}

describe('calculateAvgCommitsPerRepo', () => {
  it('should return 0 for empty repos', () => {
    const result = calculateAvgCommitsPerRepo([]);
    expect(result.average).toBe(0);
    expect(result.activeRepos).toBe(0);
    expect(result.totalCommits).toBe(0);
  });

  it('should return 0 when all repos have 0 commits', () => {
    const repos = [mockRepo('empty-1', 0), mockRepo('empty-2', 0)];
    const result = calculateAvgCommitsPerRepo(repos);
    expect(result.average).toBe(0);
    expect(result.activeRepos).toBe(0);
  });

  it('should calculate average for active repos only', () => {
    const repos = [
      mockRepo('active-1', 100),
      mockRepo('active-2', 50),
      mockRepo('empty', 0),
    ];
    const result = calculateAvgCommitsPerRepo(repos);
    expect(result.average).toBe(75);
    expect(result.activeRepos).toBe(2);
    expect(result.totalCommits).toBe(150);
  });

  it('should round to 1 decimal place', () => {
    const repos = [
      mockRepo('a', 10),
      mockRepo('b', 10),
      mockRepo('c', 11),
    ];
    const result = calculateAvgCommitsPerRepo(repos);
    expect(result.average).toBe(10.3);
  });

  it('should handle single active repo', () => {
    const repos = [mockRepo('only', 42)];
    const result = calculateAvgCommitsPerRepo(repos);
    expect(result.average).toBe(42);
    expect(result.activeRepos).toBe(1);
  });

  it('should handle large commit counts', () => {
    const repos = [
      mockRepo('big-1', 10000),
      mockRepo('big-2', 20000),
    ];
    const result = calculateAvgCommitsPerRepo(repos);
    expect(result.average).toBe(15000);
    expect(result.totalCommits).toBe(30000);
  });
});
