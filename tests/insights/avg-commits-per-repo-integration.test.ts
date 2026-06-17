import { describe, it, expect } from 'vitest';
import { calculateAvgCommitsPerRepo } from '../../src/scorer/insights/avgCommitsPerRepo.js';
import { renderAvgCommitsPerRepoCard } from '../../src/renderer/insights/AvgCommitsPerRepoCard.js';
import type { RepoCommitCount } from '../../src/types/insights.js';

describe('Avg Commits Per Repo insight integration', () => {
  it('should produce valid SVG from real calculation flow', () => {
    const repos: RepoCommitCount[] = [
      { repoName: 'project-a', repoUrl: 'url', commitCount: 200, pushedAt: '2024-06-01T00:00:00Z' },
      { repoName: 'project-b', repoUrl: 'url', commitCount: 100, pushedAt: '2024-06-01T00:00:00Z' },
      { repoName: 'empty-repo', repoUrl: 'url', commitCount: 0, pushedAt: '2024-06-01T00:00:00Z' },
    ];

    const result = calculateAvgCommitsPerRepo(repos);
    expect(result.average).toBe(150);
    expect(result.activeRepos).toBe(2);
    expect(result.totalCommits).toBe(300);

    const svg = renderAvgCommitsPerRepoCard(result.average, result.activeRepos, result.totalCommits);
    expect(svg).toContain('<svg');
    expect(svg).toContain('150.0');
    expect(svg).toContain('300');
    expect(svg).toContain('2 repos');
  });

  it('should handle all empty repos', () => {
    const repos: RepoCommitCount[] = [
      { repoName: 'empty', repoUrl: 'url', commitCount: 0, pushedAt: '2024-06-01T00:00:00Z' },
    ];

    const result = calculateAvgCommitsPerRepo(repos);
    expect(result.average).toBe(0);
    expect(result.activeRepos).toBe(0);

    const svg = renderAvgCommitsPerRepoCard(result.average, result.activeRepos, result.totalCommits);
    expect(svg).toContain('0.0');
  });

  it('should handle single repo', () => {
    const repos: RepoCommitCount[] = [
      { repoName: 'only', repoUrl: 'url', commitCount: 42, pushedAt: '2024-06-01T00:00:00Z' },
    ];

    const result = calculateAvgCommitsPerRepo(repos);
    expect(result.average).toBe(42);
    expect(result.activeRepos).toBe(1);

    const svg = renderAvgCommitsPerRepoCard(result.average, result.activeRepos, result.totalCommits);
    expect(svg).toContain('1 repo');
  });
});
