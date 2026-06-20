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

interface CommitHistoryData {
  repository: {
    defaultBranchRef: {
      target: {
        history: {
          totalCount: number;
          edges: Array<{ node: { committedDate: string } }>;
        };
      };
    } | null;
  } | null;
}

interface UserIdData {
  user: {
    id: string;
  } | null;
}

interface RestCommit {
  commit: {
    author: {
      date: string;
    };
  };
}

export class LongestMaintainedFetcher {
  private rateLimit = { remaining: 5000, reset: 0 };
  private graphqlCircuitBreaker = new CircuitBreaker(5, 30000);
  private restCircuitBreaker = new CircuitBreaker(5, 30000);

  private async graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const config = getConfig();

    if (this.rateLimit.remaining < 10) {
      const waitSeconds = Math.max(0, this.rateLimit.reset - Math.floor(Date.now() / 1000));
      if (waitSeconds > 0) throw new RateLimitError(waitSeconds);
    }

    return this.graphqlCircuitBreaker.execute(async () => {
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

  private async restFetchJson<T>(url: string): Promise<T> {
    const config = getConfig();

    if (this.rateLimit.remaining < 10) {
      const waitSeconds = Math.max(0, this.rateLimit.reset - Math.floor(Date.now() / 1000));
      if (waitSeconds > 0) throw new RateLimitError(waitSeconds);
    }

    return this.restCircuitBreaker.execute(async () => {
      const response = await withRetry(async () => {
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${config.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github+json',
            'User-Agent': 'github-profile-score/1.0',
          },
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

      return (await response.json()) as T;
    });
  }

  /**
   * Fetch first and last commit dates per repo.
   *
   * Strategy: GraphQL for newest commit + totalCount (1 call),
   * REST API for oldest commit via page calculation (1 call).
   * Total: 2 API calls per repo regardless of commit count.
   *
   * GraphQL history() defaults to reverse chronological, so
   * first:1 = newest. REST returns reverse chronological too,
   * so the oldest commit is on the last page.
   */
  async fetchCommitSpans(username: string, repos: GitHubRepo[]): Promise<RepoCommitSpan[]> {
    const targetRepos = repos
      .filter((r) => !r.fork)
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
      .slice(0, MAX_REPOS);

    log.info({ username, repoCount: targetRepos.length }, 'Fetching commit spans');

    const userId = await this.fetchUserId(username);
    if (!userId) {
      log.warn({ username }, 'Could not resolve user ID, skipping commit spans');
      return [];
    }

    const results: RepoCommitSpan[] = [];

    for (const repo of targetRepos) {
      try {
        const owner = repo.full_name.split('/')[0] ?? username;

        // Step 1: GraphQL — newest commit + total count
        const gqlData = await this.graphql<CommitHistoryData>(
          `query ($owner: String!, $name: String!, $authorId: ID!) {
            repository(owner: $owner, name: $name) {
              defaultBranchRef {
                target {
                  ... on Commit {
                    history(author: { id: $authorId }, first: 1) {
                      totalCount
                      edges { node { committedDate } }
                    }
                  }
                }
              }
            }
          }`,
          { owner, name: repo.name, authorId: userId },
        );

        const history = gqlData.repository?.defaultBranchRef?.target?.history;
        const newestDate = history?.edges?.[0]?.node?.committedDate;
        const totalCount = history?.totalCount ?? 0;

        if (!newestDate || totalCount === 0) {
          log.warn({ repo: repo.name }, 'No commits found by this user');
          continue;
        }

        // Step 2: REST — oldest commit via page calculation
        const lastPage = Math.ceil(totalCount / 100);
        const oldestDate = await this.fetchOldestCommit(owner, repo.name, username, lastPage);

        if (!oldestDate) {
          log.warn({ repo: repo.name }, 'Could not determine oldest commit');
          continue;
        }

        const spanDays = Math.round(
          (new Date(newestDate).getTime() - new Date(oldestDate).getTime()) / (1000 * 60 * 60 * 24),
        );

        results.push({
          repoName: repo.name,
          repoUrl: repo.html_url,
          firstCommitDate: oldestDate,
          lastCommitDate: newestDate,
          spanDays,
        });
      } catch (err) {
        log.warn({ err, repo: repo.name, owner: repo.full_name.split('/')[0] }, 'Failed to fetch commit span');
      }
    }

    return results;
  }

  /**
   * Fetch the oldest commit by a user in a repo using REST API.
   *
   * REST returns commits in reverse chronological order by default.
   * We calculate which page has the oldest commit based on totalCount
   * from GraphQL, then fetch just that page.
   */
  private async fetchOldestCommit(
    owner: string,
    repo: string,
    username: string,
    lastPage: number,
  ): Promise<string | null> {
    const commits = await this.restFetchJson<RestCommit[]>(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?author=${encodeURIComponent(username)}&per_page=100&page=${lastPage}`,
    );

    if (!Array.isArray(commits) || commits.length === 0) return null;

    // REST returns newest-first, so last element on last page is oldest
    return commits[commits.length - 1]?.commit.author.date ?? null;
  }

  private async fetchUserId(username: string): Promise<string | null> {
    try {
      const data = await this.graphql<UserIdData>(
        `query ($login: String!) {
          user(login: $login) {
            id
          }
        }`,
        { login: username },
      );
      return data.user?.id ?? null;
    } catch (err) {
      log.warn({ err, username }, 'Failed to resolve user ID');
      return null;
    }
  }
}
