import { getConfig } from '../config.js';
import { createChildLogger } from '../logger.js';
import { CircuitBreaker } from '../utils/circuitBreaker.js';
import { deduplicate } from '../utils/deduplicator.js';
import { RateLimitError } from '../utils/errors.js';
import { withRetry } from '../utils/retry.js';
import type { GitHubProfile, GitHubRepo, GitHubEvent } from '../types.js';
import { GitHubRateLimitError } from '../types.js';

const log = createChildLogger('github-fetcher');

interface RateLimitState {
  remaining: number;
  reset: number;
}

export class GitHubFetcher {
  private rateLimit: RateLimitState = { remaining: 5000, reset: 0 };
  private searchRateLimit: RateLimitState = { remaining: 30, reset: 0 };
  private circuitBreaker = new CircuitBreaker(5, 30000);
  private lastResponseStatus: number = 0;

  private getHeaders(accept?: string): Record<string, string> {
    const config = getConfig();
    return {
      Accept: accept ?? 'application/vnd.github.v3+json',
      'User-Agent': 'github-profile-score/1.0',
      Authorization: `Bearer ${config.GITHUB_TOKEN}`,
    };
  }

  private async request<T>(url: string, options?: { headers?: Record<string, string> }): Promise<T> {
    const isSearchEndpoint = url.includes('/search/');
    const activeRateLimit = isSearchEndpoint ? this.searchRateLimit : this.rateLimit;

    if (activeRateLimit.remaining < 10) {
      const waitSeconds = Math.max(0, activeRateLimit.reset - Math.floor(Date.now() / 1000));
      if (waitSeconds > 0) {
        throw new RateLimitError(waitSeconds);
      }
    }

    return this.circuitBreaker.execute(async () => {
      const response = await withRetry(async () => {
        const res = await fetch(url, { headers: options?.headers ?? this.getHeaders() });

        const remaining = res.headers.get('x-ratelimit-remaining');
        const reset = res.headers.get('x-ratelimit-reset');
        if (remaining) activeRateLimit.remaining = parseInt(remaining, 10);
        if (reset) activeRateLimit.reset = parseInt(reset, 10);

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

        this.lastResponseStatus = res.status;
        return res;
      });

      return response.json() as Promise<T>;
    });
  }

  async fetchProfile(username: string): Promise<GitHubProfile> {
    return deduplicate(`profile:${username}`, () => {
      log.info({ username }, 'Fetching GitHub profile');
      return this.request<GitHubProfile>(`https://api.github.com/users/${username}`);
    });
  }

  async fetchRepos(username: string): Promise<GitHubRepo[]> {
    return deduplicate(`repos:${username}`, async () => {
      log.info({ username }, 'Fetching GitHub repos');
      const allRepos: GitHubRepo[] = [];
      let page = 1;

      while (allRepos.length < 30) {
        const repos = await this.request<GitHubRepo[]>(
          `https://api.github.com/users/${username}/repos?per_page=10&page=${page}&sort=pushed&direction=desc`,
        );
        if (repos.length === 0) break;
        allRepos.push(...repos);
        page++;
      }

      if (allRepos.length === 0) {
        log.warn({ username, httpStatus: this.lastResponseStatus, emptyFetch: true }, 'GitHub repos returned empty');
      }

      return allRepos.slice(0, 30);
    });
  }

  async fetchEvents(username: string, days: number = 90): Promise<GitHubEvent[]> {
    return deduplicate(`events:${username}`, async () => {
      log.info({ username, days }, 'Fetching GitHub events');
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      const allEvents: GitHubEvent[] = [];
      let page = 1;

      while (true) {
        const events = await this.request<GitHubEvent[]>(
          `https://api.github.com/users/${username}/events/public?per_page=100&page=${page}`,
        );
        if (events.length === 0) break;

        for (const event of events) {
          if (new Date(event.created_at) < cutoff) return allEvents;
          allEvents.push(event);
        }

        if (events.length < 100) break;
        page++;
      }

      return allEvents;
    });
  }

  async fetchCommitCount(username: string, days: number = 90): Promise<number> {
    return deduplicate(`commits:${username}:${days}`, async () => {
      log.info({ username, days }, 'Fetching commit count via search API');
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString().split('T')[0];

      const result = await this.request<{ total_count: number }>(
        `https://api.github.com/search/commits?q=author:${username}+author-date:>${sinceStr}&per_page=1`,
        { headers: this.getHeaders('application/vnd.github.cloak-preview+json') },
      );
      return result.total_count ?? 0;
    });
  }

  getRateLimitRemaining(): number {
    return this.rateLimit.remaining;
  }
}
