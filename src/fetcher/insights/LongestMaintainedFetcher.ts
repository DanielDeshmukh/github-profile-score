import { getConfig } from '../../config.js';
import { createChildLogger } from '../../logger.js';
import { CircuitBreaker } from '../../utils/circuitBreaker.js';
import { RateLimitError } from '../../utils/errors.js';
import { withRetry } from '../../utils/retry.js';
import { GitHubRateLimitError } from '../../types.js';
import type { RepoCommitSpan } from '../../types/insights.js';
import type { GitHubRepo } from '../../types.js';

const log = createChildLogger('longest-maintained-fetcher');
const MAX_REPOS = 10;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface CommitSpanData {
  repository: {
    firstCommit: { history: { edges: Array<{ node: { committedDate: string } }> } };
    lastCommit: { history: { edges: Array<{ node: { committedDate: string } }> } };
  } | null;
}

export class LongestMaintainedFetcher {
  private rateLimit = { remaining: 5000, reset: 0 };
  private circuitBreaker = new CircuitBreaker(5, 30000);

  private async graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const config = getConfig();

    if (this.rateLimit.remaining < 10) {
      const waitSeconds = Math.max(0, this.rateLimit.reset - Math.floor(Date.now() / 1000));
      if (waitSeconds > 0) throw new RateLimitError(waitSeconds);
    }

    return this.circuitBreaker.execute(async () => {
      const response = await withRetry(async () => {
        const res = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'github-profile-score/1.0',
          },
          body: JSON.stringify({ query, variables }),
        });

        const remaining = res.headers.get('x-ratelimit-remaining');
        const reset = res.headers.get('x-ratelimit-reset');
        if (remaining) this.rateLimit.remaining = parseInt(remaining, 10);
        if (reset) this.rateLimit.reset = parseInt(reset, 10);

        if (res.status === 404) throw new Error('NOT_FOUND');
        if ((res.status === 403 || res.status === 429) && remaining === '0') {
          const resetTimestamp = reset ? parseInt(reset, 10) : Math.floor(Date.now() / 1000) + 60;
          throw new GitHubRateLimitError(new Date(resetTimestamp * 1000));
        }
        if (res.status === 403 || res.status === 429) {
          const retryAfter = res.headers.get('retry-after');
          throw new RateLimitError(retryAfter ? parseInt(retryAfter, 10) : 60);
        }
        if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
        return res;
      });

      const body = (await response.json()) as GraphQLResponse<T>;
      if (body.errors && body.errors.length > 0) {
        throw new Error(`GraphQL error: ${body.errors[0]?.message ?? 'Unknown error'}`);
      }
      if (!body.data) throw new Error('GraphQL response missing data');
      return body.data;
    });
  }

  /**
   * Fetch first and last commit dates per repo.
   *
   * IMPORTANT: This is the most expensive insight — one GraphQL
   * call per repo. Limited to MAX_REPOS (10) repos to control
   * API quota. Uses the most recently pushed repos as a proxy
   * for "repos the user cares about" since those are most likely
   * to have meaningful commit spans.
   */
  async fetchCommitSpans(username: string, repos: GitHubRepo[]): Promise<RepoCommitSpan[]> {
    const targetRepos = repos
      .filter((r) => !r.fork)
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
      .slice(0, MAX_REPOS);

    log.info({ username, repoCount: targetRepos.length }, 'Fetching commit spans');

    const results: RepoCommitSpan[] = [];

    for (const repo of targetRepos) {
      try {
        const owner = repo.full_name.split('/')[0] ?? username;

        const data = await this.graphql<CommitSpanData>(
          `query ($owner: String!, $name: String!, $author: String!) {
            repository(owner: $owner, name: $name) {
              firstCommit: defaultBranchRef {
                target {
                  ... on Commit {
                    history(author: { login: $author }, first: 1) {
                      edges { node { committedDate } }
                    }
                  }
                }
              }
              lastCommit: defaultBranchRef {
                target {
                  ... on Commit {
                    history(author: { login: $author }, last: 1) {
                      edges { node { committedDate } }
                    }
                  }
                }
              }
            }
          }`,
          { owner, name: repo.name, author: username },
        );

        const firstDate = data.repository?.firstCommit?.target?.history?.edges?.[0]?.node?.committedDate;
        const lastDate = data.repository?.lastCommit?.target?.history?.edges?.[0]?.node?.committedDate;

        if (firstDate && lastDate) {
          const spanDays = Math.round(
            (new Date(lastDate).getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24),
          );
          results.push({
            repoName: repo.name,
            repoUrl: repo.html_url,
            firstCommitDate: firstDate,
            lastCommitDate: lastDate,
            spanDays,
          });
        }
      } catch {
        // Skip repos where commit span fetch fails
      }
    }

    return results;
  }
}
