import type { RepoCommitSpan } from '../../types/insights.js';

export interface LongestMaintainedResult {
  repoName: string;
  repoUrl: string;
  spanDays: number;
  firstCommitDate: string;
  lastCommitDate: string;
}

/**
 * Find the repository with the longest maintenance span.
 *
 * Span = days between first and last commit by the user.
 * This measures how long the user has been actively maintaining
 * a single project, not just how many commits they made.
 *
 * Tie-break: Most recently pushed repo wins (a currently-active
 * long-lived project is more meaningful than an abandoned one).
 */
export function findLongestMaintainedRepo(
  spans: RepoCommitSpan[],
): LongestMaintainedResult | null {
  if (spans.length === 0) {
    return null;
  }

  let best = spans[0]!;

  for (let i = 1; i < spans.length; i++) {
    const current = spans[i]!;

    if (current.spanDays > best.spanDays) {
      best = current;
    } else if (current.spanDays === best.spanDays) {
      if (new Date(current.lastCommitDate) > new Date(best.lastCommitDate)) {
        best = current;
      }
    }
  }

  return {
    repoName: best.repoName,
    repoUrl: best.repoUrl,
    spanDays: best.spanDays,
    firstCommitDate: best.firstCommitDate,
    lastCommitDate: best.lastCommitDate,
  };
}
