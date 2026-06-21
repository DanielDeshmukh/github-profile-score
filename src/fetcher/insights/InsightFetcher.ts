import { getConfig } from '../../config.js';
import { createChildLogger } from '../../logger.js';
import { CircuitBreaker } from '../../utils/circuitBreaker.js';
import { deduplicate } from '../../utils/deduplicator.js';
import { RateLimitError } from '../../utils/errors.js';
import { withRetry } from '../../utils/retry.js';
import { GitHubRateLimitError } from '../../types.js';
import type { RepoCommitCount } from '../../types/insights.js';
import type { GitHubRepo } from '../../types.js';

const log = createChildLogger('insight-fetcher');

interface RateLimitState {
  remaining: number;
  reset: number;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface RepoCommitHistoryData {
  repository: {
    defaultBranchRef: {
      target: {
        history: {
          totalCount: number;
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

export class InsightFetcher {
  private rateLimit: RateLimitState = { remaining: 5000, reset: 0 };
  private circuitBreaker = new CircuitBreaker(5, 30000);

  private async graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const config = getConfig();

    if (this.rateLimit.remaining < 10) {
      const waitSeconds = Math.max(0, this.rateLimit.reset - Math.floor(Date.now() / 1000));
      if (waitSeconds > 0) {
        throw new RateLimitError(waitSeconds);
      }
    }

    return this.circuitBreaker.execute(async () => {
      const response = await withRetry(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        try {
          const res = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${config.GITHUB_TOKEN}`,
              'Content-Type': 'application/json',
              'User-Agent': 'github-profile-score/1.0',
            },
            body: JSON.stringify({ query, variables }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          const remaining = res.headers.get('x-ratelimit-remaining');
          const reset = res.headers.get('x-ratelimit-reset');
          if (remaining) this.rateLimit.remaining = parseInt(remaining, 10);
          if (reset) this.rateLimit.reset = parseInt(reset, 10);

          console.log('[API CALL]', { url: 'https://api.github.com/graphql', status: res.status, remaining, reset });

          if (res.status === 404) {
            throw new Error('NOT_FOUND');
          }
          if ((res.status === 403 || res.status === 429) && remaining === '0') {
            const resetTimestamp = reset ? parseInt(reset, 10) : Math.floor(Date.now() / 1000) + 60;
            throw new GitHubRateLimitError(new Date(resetTimestamp * 1000));
          }
          if (res.status === 403 || res.status === 429) {
            const retryAfter = res.headers.get('retry-after');
            throw new RateLimitError(retryAfter ? parseInt(retryAfter, 10) : 60);
          }
          if (!res.ok) {
            throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
          }

          return res;
        } catch (err) {
          clearTimeout(timeoutId);
          if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('TIMEOUT: https://api.github.com/graphql');
          }
          throw err;
        }
      });

      const body = (await response.json()) as GraphQLResponse<T>;
      console.log('[API RESPONSE]', { url: 'https://api.github.com/graphql', dataLength: JSON.stringify(body).length });

      if (body.errors && body.errors.length > 0) {
        throw new Error(`GraphQL error: ${body.errors[0]?.message ?? 'Unknown error'}`);
      }

      if (!body.data) {
        throw new Error('GraphQL response missing data');
      }

      return body.data;
    });
  }

  async fetchPerRepoCommitCounts(username: string, repos: GitHubRepo[]): Promise<RepoCommitCount[]> {
    return deduplicate(`insight:repo-commits:${username}`, async () => {
      log.info({ username, repoCount: repos.length }, 'Fetching per-repo commit counts');

      const userId = await this.fetchUserId(username);
      if (!userId) {
        log.warn({ username }, 'Could not resolve user ID, skipping commit counts');
        return repos.slice(0, 20).map(repo => ({
          repoName: repo.name,
          repoUrl: repo.html_url,
          commitCount: 0,
          pushedAt: repo.pushed_at,
        }));
      }

      const results: RepoCommitCount[] = [];

      for (const repo of repos.slice(0, 20)) {
        try {
          const data = await this.graphql<RepoCommitHistoryData>(
            `query ($owner: String!, $name: String!, $authorId: ID!) {
              repository(owner: $owner, name: $name) {
                defaultBranchRef {
                  target {
                    ... on Commit {
                      history(author: { id: $authorId }) {
                        totalCount
                      }
                    }
                  }
                }
              }
            }`,
            {
              owner: repo.full_name.split('/')[0] ?? username,
              name: repo.name,
              authorId: userId,
            },
          );

          const history = data.repository?.defaultBranchRef?.target?.history;
          const commitCount = history?.totalCount ?? 0;

          results.push({
            repoName: repo.name,
            repoUrl: repo.html_url,
            commitCount,
            pushedAt: repo.pushed_at,
          });
        } catch (err) {
          log.warn({ err, repo: repo.name, owner: repo.full_name.split('/')[0] }, 'Failed to fetch commit count');
          results.push({
            repoName: repo.name,
            repoUrl: repo.html_url,
            commitCount: 0,
            pushedAt: repo.pushed_at,
          });
        }
      }

      return results;
    });
  }

  getRateLimitRemaining(): number {
    return this.rateLimit.remaining;
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
