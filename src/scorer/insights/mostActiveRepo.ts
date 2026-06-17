import type { RepoCommitCount } from '../../types/insights.js';

export interface MostActiveRepoResult {
  repoName: string;
  commitCount: number;
  repoUrl: string;
}

/**
 * Find the repository with the most commits by the user.
 *
 * Tie-break rule: When two repos have the same commit count, the one
 * with the most recent push date wins. This is a deliberate choice —
 * a repo that was actively pushed to more recently is more likely to
 * be the user's primary project, even if commit counts are identical.
 * If push dates are also identical (extremely rare), the first match
 * in array order wins (deterministic since input order is stable).
 */
export function findMostActiveRepo(repos: RepoCommitCount[]): MostActiveRepoResult | null {
  if (repos.length === 0) {
    return null;
  }

  let best = repos[0]!;

  for (let i = 1; i < repos.length; i++) {
    const current = repos[i]!;

    if (current.commitCount > best.commitCount) {
      best = current;
    } else if (current.commitCount === best.commitCount) {
      if (new Date(current.pushedAt) > new Date(best.pushedAt)) {
        best = current;
      }
    }
  }

  return {
    repoName: best.repoName,
    commitCount: best.commitCount,
    repoUrl: best.repoUrl,
  };
}
