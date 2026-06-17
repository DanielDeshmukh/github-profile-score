import { describe, it, expect } from 'vitest';
import { findLongestMaintainedRepo } from '../../src/scorer/insights/longestMaintainedRepo.js';
import type { RepoCommitSpan } from '../../src/types/insights.js';

function mockSpan(repoName: string, spanDays: number, lastCommit: string): RepoCommitSpan {
  return {
    repoName,
    repoUrl: `https://github.com/u/${repoName}`,
    firstCommitDate: '2020-01-01T00:00:00Z',
    lastCommitDate: lastCommit,
    spanDays,
  };
}

describe('findLongestMaintainedRepo', () => {
  it('should return null for empty spans', () => {
    expect(findLongestMaintainedRepo([])).toBeNull();
  });

  it('should return the single span', () => {
    const result = findLongestMaintainedRepo([mockSpan('only', 365, '2024-06-01T00:00:00Z')]);
    expect(result?.repoName).toBe('only');
    expect(result?.spanDays).toBe(365);
  });

  it('should find repo with longest span', () => {
    const spans = [
      mockSpan('short', 100, '2024-06-01T00:00:00Z'),
      mockSpan('long', 1000, '2024-06-01T00:00:00Z'),
      mockSpan('mid', 500, '2024-06-01T00:00:00Z'),
    ];
    const result = findLongestMaintainedRepo(spans);
    expect(result?.repoName).toBe('long');
    expect(result?.spanDays).toBe(1000);
  });

  it('should break ties by most recent push', () => {
    const spans = [
      mockSpan('older', 365, '2024-01-01T00:00:00Z'),
      mockSpan('newer', 365, '2024-06-01T00:00:00Z'),
    ];
    const result = findLongestMaintainedRepo(spans);
    expect(result?.repoName).toBe('newer');
  });

  it('should handle zero-day spans', () => {
    const spans = [
      mockSpan('same-day', 0, '2024-06-01T00:00:00Z'),
    ];
    const result = findLongestMaintainedRepo(spans);
    expect(result?.spanDays).toBe(0);
  });
});
