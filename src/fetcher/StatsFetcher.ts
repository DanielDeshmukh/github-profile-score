import { getConfig } from '../config.js';
import { createChildLogger } from '../logger.js';
import { CircuitBreaker } from '../utils/circuitBreaker.js';
import { deduplicate } from '../utils/deduplicator.js';
import { RateLimitError } from '../utils/errors.js';
import { withRetry } from '../utils/retry.js';
import type {
  ContributionCalendar,
  LanguageBreakdown,
} from '../types/stats.js';
import type { GitHubRepo } from '../types.js';
import { GitHubRateLimitError } from '../types.js';

const log = createChildLogger('stats-fetcher');

interface RateLimitState {
  remaining: number;
  reset: number;
}

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
          firstDay: string;
          contributionDays: Array<{
            date: string;
            contributionCount: number;
            color: string;
          }>;
        }>;
      };
      totalCommitContributions: number;
      totalPullRequestContributions: number;
      totalIssueContributions: number;
    };
  };
}

interface LanguageData {
  user: {
    repositories: {
      nodes: Array<{
        languages: {
          edges: Array<{
            size: number;
            node: { name: string; color: string };
          }>;
        };
      }>;
    };
  };
}

export class StatsFetcher {
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
      });

      const body = (await response.json()) as GraphQLResponse<T>;

      if (body.errors && body.errors.length > 0) {
        throw new Error(`GraphQL error: ${body.errors[0]?.message ?? 'Unknown error'}`);
      }

      if (!body.data) {
        throw new Error('GraphQL response missing data');
      }

      return body.data;
    });
  }

  async fetchContributionCalendar(username: string): Promise<ContributionCalendar> {
    return deduplicate(`stats:contributions:${username}`, async () => {
      log.info({ username }, 'Fetching contribution calendar via GraphQL');

      const data = await this.graphql<ContributionCalendarData>(
        `query ($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  firstDay
                  contributionDays {
                    date
                    contributionCount
                    color
                  }
                }
              }
              totalCommitContributions
              totalPullRequestContributions
              totalIssueContributions
            }
          }
        }`,
        { username },
      );

      const user = data.user;
      if (!user) {
        throw new Error('NOT_FOUND');
      }

      const cal = user.contributionsCollection.contributionCalendar;

      return {
        totalContributions: cal.totalContributions,
        weeks: cal.weeks.map((week: (typeof cal.weeks)[number]) => ({
          firstDay: week.firstDay,
          contributionDays: week.contributionDays.map(
            (day: (typeof week.contributionDays)[number]) => ({
              date: day.date,
              count: day.contributionCount,
              color: day.color,
            }),
          ),
        })),
      };
    });
  }

  async fetchContributionAggregates(
    username: string,
  ): Promise<{ totalCommits: number; totalPRs: number; totalIssues: number }> {
    return deduplicate(`stats:aggregates:${username}`, async () => {
      log.info({ username }, 'Fetching contribution aggregates via GraphQL');

      const data = await this.graphql<{
        user: {
          contributionsCollection: {
            totalCommitContributions: number;
            totalPullRequestContributions: number;
            totalIssueContributions: number;
          };
        };
      }>(
        `query ($username: String!) {
          user(login: $username) {
            contributionsCollection {
              totalCommitContributions
              totalPullRequestContributions
              totalIssueContributions
            }
          }
        }`,
        { username },
      );

      const user = data.user;
      if (!user) {
        throw new Error('NOT_FOUND');
      }

      const agg = user.contributionsCollection;
      return {
        totalCommits: agg.totalCommitContributions,
        totalPRs: agg.totalPullRequestContributions,
        totalIssues: agg.totalIssueContributions,
      };
    });
  }

  async fetchTotalStars(repos: GitHubRepo[]): Promise<number> {
    return repos
      .filter((r) => !r.fork)
      .reduce((sum, r) => sum + r.stargazers_count, 0);
  }

  async fetchLanguageBreakdown(username: string): Promise<LanguageBreakdown[]> {
    return deduplicate(`stats:languages:${username}`, async () => {
      log.info({ username }, 'Fetching language breakdown via GraphQL');

      const data = await this.graphql<LanguageData>(
        `query ($username: String!) {
          user(login: $username) {
            repositories(first: 100, ownerAffiliations: OWNER) {
              nodes {
                languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
                  edges {
                    size
                    node {
                      name
                      color
                    }
                  }
                }
              }
            }
          }
        }`,
        { username },
      );

      const user = data.user;
      if (!user) {
        throw new Error('NOT_FOUND');
      }

      const languageTotals = new Map<string, { bytes: number; color: string }>();

      for (const repo of user.repositories.nodes) {
        for (const edge of repo.languages.edges) {
          const existing = languageTotals.get(edge.node.name);
          if (existing) {
            existing.bytes += edge.size;
          } else {
            languageTotals.set(edge.node.name, {
              bytes: edge.size,
              color: edge.node.color,
            });
          }
        }
      }

      const totalBytes = Array.from(languageTotals.values()).reduce((sum, l) => sum + l.bytes, 0);

      if (totalBytes === 0) {
        return [];
      }

      return Array.from(languageTotals.entries())
        .map(([name, { bytes, color }]) => ({
          name,
          percent: Math.round((bytes / totalBytes) * 1000) / 10,
          color,
        }))
        .sort((a, b) => b.percent - a.percent);
    });
  }

  getRateLimitRemaining(): number {
    return this.rateLimit.remaining;
  }
}
