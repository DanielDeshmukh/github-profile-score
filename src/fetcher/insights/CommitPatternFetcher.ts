import { getConfig } from '../../config.js';
import { createChildLogger } from '../../logger.js';
import { CircuitBreaker } from '../../utils/circuitBreaker.js';
import { RateLimitError } from '../../utils/errors.js';
import { withRetry } from '../../utils/retry.js';
import { GitHubRateLimitError } from '../../types.js';

const log = createChildLogger('commit-pattern-fetcher');

interface RateLimitState {
  remaining: number;
  reset: number;
}

interface GitHubEvent {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: Record<string, unknown>;
}

export interface CommitTimestamp {
  date: string;
  hour: number;
  dayOfWeek: number;
}

export class CommitPatternFetcher {
  private rateLimit: RateLimitState = { remaining: 5000, reset: 0 };
  private circuitBreaker = new CircuitBreaker(5, 30000);

  private async fetchJson<T>(url: string): Promise<T> {
    const config = getConfig();

    if (this.rateLimit.remaining < 10) {
      const waitSeconds = Math.max(0, this.rateLimit.reset - Math.floor(Date.now() / 1000));
      if (waitSeconds > 0) throw new RateLimitError(waitSeconds);
    }

    return this.circuitBreaker.execute(async () => {
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
   * Fetch commit timestamps from the user's public events.
   *
   * Uses the public events endpoint which returns up to 10 pages
   * of 10 events each (100 events max). This is a rough sample —
   * frame results as approximate, not authoritative.
   *
   * The events endpoint returns PushEvents with commit timestamps
   * in the payload, which we extract for time-of-day analysis.
   */
  async fetchCommitTimestamps(username: string): Promise<CommitTimestamp[]> {
    log.info({ username }, 'Fetching commit timestamps from events');

    const timestamps: CommitTimestamp[] = [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);

    for (let page = 1; page <= 10; page++) {
      try {
        const events = await this.fetchJson<GitHubEvent[]>(
          `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=100&page=${page}`,
        );

        if (events.length === 0) break;

        for (const event of events) {
          if (event.type !== 'PushEvent') continue;

          const eventDate = new Date(event.created_at);
          if (eventDate < cutoff) return timestamps;

          const commits = event.payload.commits as Array<{ author: { date: string } }> | undefined;
          if (!commits) continue;

          for (const commit of commits) {
            const d = new Date(commit.author.date);
            timestamps.push({
              date: d.toISOString().split('T')[0]!,
              hour: d.getUTCHours(),
              dayOfWeek: d.getUTCDay(),
            });
          }
        }
      } catch {
        break;
      }
    }

    return timestamps;
  }

  getRateLimitRemaining(): number {
    return this.rateLimit.remaining;
  }
}
