import type { GitHubRepo } from '../../types.js';

export interface MostStarredRepoResult {
  repoName: string;
  stars: number;
  repoUrl: string;
}

/**
 * Find the repository with the most stars.
 *
 * Tie-break rule: When two repos have the same star count,
 * the one with the most recently pushed date wins (same as
 * most-active-repo). If push dates are also identical,
 * alphabetical order breaks the tie.
 */
export function findMostStarredRepo(repos: GitHubRepo[]): MostStarredRepoResult | null {
  if (repos.length === 0) {
    return null;
  }

  let best = repos[0]!;

  for (let i = 1; i < repos.length; i++) {
    const current = repos[i]!;

    if (current.stargazers_count > best.stargazers_count) {
      best = current;
    } else if (current.stargazers_count === best.stargazers_count) {
      if (new Date(current.pushed_at) > new Date(best.pushed_at)) {
        best = current;
      } else if (
        new Date(current.pushed_at).getTime() === new Date(best.pushed_at).getTime() &&
        current.name < best.name
      ) {
        best = current;
      }
    }
  }

  return {
    repoName: best.name,
    stars: best.stargazers_count,
    repoUrl: best.html_url,
  };
}
