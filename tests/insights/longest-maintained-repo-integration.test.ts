import { describe, it, expect } from 'vitest';
import { findLongestMaintainedRepo } from '../../src/scorer/insights/longestMaintainedRepo.js';
import { renderLongestMaintainedCard } from '../../src/renderer/insights/LongestMaintainedRepoCard.js';
import type { RepoCommitSpan } from '../../src/types/insights.js';

describe('Longest Maintained Repo insight integration', () => {
  it('should produce valid SVG from real calculation flow', () => {
    const spans: RepoCommitSpan[] = [
      { repoName: 'new-project', repoUrl: 'https://github.com/u/new-project', firstCommitDate: '2024-01-01T00:00:00Z', lastCommitDate: '2024-06-01T00:00:00Z', spanDays: 152 },
      { repoName: 'old-project', repoUrl: 'https://github.com/u/old-project', firstCommitDate: '2019-03-10T00:00:00Z', lastCommitDate: '2024-06-01T00:00:00Z', spanDays: 1909 },
    ];

    const result = findLongestMaintainedRepo(spans);
    expect(result).not.toBeNull();
    expect(result!.repoName).toBe('old-project');
    expect(result!.spanDays).toBe(1909);

    const svg = renderLongestMaintainedCard(result!.repoName, result!.spanDays, result!.repoUrl, result!.firstCommitDate);
    expect(svg).toContain('<svg');
    expect(svg).toContain('old-project');
    expect(svg).toContain('5y');
    expect(svg).toContain('since 2019');
  });

  it('should handle empty spans', () => {
    const result = findLongestMaintainedRepo([]);
    expect(result).toBeNull();
  });

  it('should handle single repo', () => {
    const spans: RepoCommitSpan[] = [
      { repoName: 'only', repoUrl: 'url', firstCommitDate: '2022-06-01T00:00:00Z', lastCommitDate: '2024-06-01T00:00:00Z', spanDays: 730 },
    ];

    const result = findLongestMaintainedRepo(spans);
    expect(result!.spanDays).toBe(730);

    const svg = renderLongestMaintainedCard(result!.repoName, result!.spanDays, result!.repoUrl, result!.firstCommitDate);
    expect(svg).toContain('2y');
  });

  it('should handle tie-breaking correctly', () => {
    const spans: RepoCommitSpan[] = [
      { repoName: 'older', repoUrl: 'url', firstCommitDate: '2020-01-01T00:00:00Z', lastCommitDate: '2024-01-01T00:00:00Z', spanDays: 1461 },
      { repoName: 'newer', repoUrl: 'url', firstCommitDate: '2020-06-01T00:00:00Z', lastCommitDate: '2024-06-01T00:00:00Z', spanDays: 1461 },
    ];

    const result = findLongestMaintainedRepo(spans);
    expect(result!.repoName).toBe('newer');
  });
});
