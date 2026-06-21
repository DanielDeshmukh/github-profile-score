import { getConfig } from '../../config.js';
import { createChildLogger } from '../../logger.js';
import { CircuitBreaker } from '../../utils/circuitBreaker.js';
import { RateLimitError } from '../../utils/errors.js';
import { withRetry } from '../../utils/retry.js';
import { GitHubRateLimitError } from '../../types.js';

const log = createChildLogger('contribution-trend-fetcher');

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface ContributionCalendarData {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: Array<{
          contributionDays: Array<{
            contributionCount: number;
            date: string;
          }>;
        }>;
      };
    };
  } | null;
}

export interface TwoYearContributions {
  thisYearTotal: number;
  lastYearTotal: number;
  thisYearDays: Array<{ date: string; count: number }>;
  lastYearDays: Array<{ date: string; count: number }>;
}

export class ContributionTrendFetcher {
  private rateLimit = { remaining: 5000, reset: 0 };
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
      if (!body.data) throw new Error('GraphQL response missing data');
      return body.data;
    });
  }

  async fetchTwoYearContributions(username: string): Promise<TwoYearContributions> {
    const now = new Date();
    const thisYearStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]!;
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0]!;
    const thisYearEnd = now.toISOString().split('T')[0]!;

    log.info({ username, thisYearStart, lastYearStart }, 'Fetching 2-year contribution data');

    const [thisYearData, lastYearData] = await Promise.all([
      this.graphql<ContributionCalendarData>(
        `query ($login: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $login) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                  }
                }
              }
            }
          }
        }`,
        { login: username, from: `${thisYearStart}T00:00:00Z`, to: `${thisYearEnd}T23:59:59Z` },
      ),
      this.graphql<ContributionCalendarData>(
        `query ($login: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $login) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                  }
                }
              }
            }
          }
        }`,
        { login: username, from: `${lastYearStart}T00:00:00Z`, to: `${new Date(now.getFullYear() - 1, 11, 31).toISOString().split('T')[0]}T23:59:59Z` },
      ),
    ]);

    const thisYearCal = thisYearData.user?.contributionsCollection.contributionCalendar;
    const lastYearCal = lastYearData.user?.contributionsCollection.contributionCalendar;

    const thisYearTotal = thisYearCal?.totalContributions ?? 0;
    const lastYearTotal = lastYearCal?.totalContributions ?? 0;

    const thisYearDays = (thisYearCal?.weeks ?? []).flatMap((w) =>
      w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })),
    );
    const lastYearDays = (lastYearCal?.weeks ?? []).flatMap((w) =>
      w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })),
    );

    return { thisYearTotal, lastYearTotal, thisYearDays, lastYearDays };
  }
}
