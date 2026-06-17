import type { RepoCommitCount } from '../../types/insights.js';

export interface AvgCommitsPerRepoResult {
  average: number;
  activeRepos: number;
  totalCommits: number;
}

/**
 * Calculate average commits per active repository.
 *
 * Only repos with at least 1 commit are included in the average.
 * This avoids diluting the average with empty/forked repos that
 * the user hasn't contributed to. A user with 100 commits across
 * 5 active repos (avg 20) is meaningfully different from 100
 * commits across 50 repos (avg 2) — the latter suggests the user
 * spreads effort thinly.
 *
 * Rounding: Result is rounded to 1 decimal place for display.
 * The underlying value is preserved for callers that need
 * precision.
 */
export function calculateAvgCommitsPerRepo(
  repos: RepoCommitCount[],
): AvgCommitsPerRepoResult {
  const activeRepos = repos.filter((r) => r.commitCount > 0);

  if (activeRepos.length === 0) {
    return { average: 0, activeRepos: 0, totalCommits: 0 };
  }

  const totalCommits = activeRepos.reduce((sum, r) => sum + r.commitCount, 0);
  const average = totalCommits / activeRepos.length;

  return {
    average: Math.round(average * 10) / 10,
    activeRepos: activeRepos.length,
    totalCommits,
  };
}
