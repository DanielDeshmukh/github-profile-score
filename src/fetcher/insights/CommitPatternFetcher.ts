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

interface SearchCommitItem {
  commit: {
    author: {
      date: string;
    };
  };
}

interface SearchCommitsResponse {
  total_count: number;
  items: SearchCommitItem[];
}

export interface CommitTimestamp {
  date: string;
  hour: number;
  dayOfWeek: number;
}

export class CommitPatternFetcher {
  private rateLimit: RateLimitState = { remaining: 5000, reset: 0 };
  private circuitBreaker = new CircuitBreaker(5, 30000);

  private async fetchJson<T>(url: string, acceptHeader?: string): Promise<T> {
    const config = getConfig();

    if (this.rateLimit.remaining < 10) {
      const waitSeconds = Math.max(0, this.rateLimit.reset - Math.floor(Date.now() / 1000));
      if (waitSeconds > 0) throw new RateLimitError(waitSeconds);
    }

    return this.circuitBreaker.execute(async () => {
      const response = await withRetry(async () => {
        const controller = new AbortController();
        const startTime = Date.now();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        try {
          const res = await fetch(url, {
            headers: {
              Authorization: `Bearer ${config.GITHUB_TOKEN}`,
              Accept: acceptHeader ?? 'application/vnd.github+json',
              'User-Agent': 'github-profile-score/1.0',
            },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          const remaining = res.headers.get('x-ratelimit-remaining');
          const reset = res.headers.get('x-ratelimit-reset');
          if (remaining) this.rateLimit.remaining = parseInt(remaining, 10);
          if (reset) this.rateLimit.reset = parseInt(reset, 10);

          console.log('[API CALL]', { url, status: res.status, remaining, reset });

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
            const elapsed = Date.now() - startTime;
            console.log('[TIMEOUT]', { url, elapsed });
            throw new Error(`TIMEOUT: ${url}`);
          }
          throw err;
        }
      });

      const data = (await response.json()) as T;
      console.log('[API RESPONSE]', { url, dataLength: JSON.stringify(data).length });
      return data;
    });
  }

  /**
   * Fetch commit timestamps using GitHub's Search API.
   *
   * The /search/commits endpoint supports author-date filtering
   * and returns full commit details including timestamps. The
   * public events API does NOT include commit details in PushEvent
   * payloads, so we use search instead.
   *
   * Search API returns up to 1000 results total, pages of 100.
   * We fetch up to 1000 commits from the last 90 days (sufficient
   * for time-of-day analysis).
   *
   * Requires the Accept: application/vnd.github.cloak-preview+json
   * header for commit search to work.
   */
  async fetchCommitTimestamps(username: string): Promise<CommitTimestamp[]> {
    log.info({ username }, 'Fetching commit timestamps from search API');

    const timestamps: CommitTimestamp[] = [];
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const sinceStr = since.toISOString().split('T')[0];

    const maxPages = 10;
    for (let page = 1; page <= maxPages; page++) {
      try {
        const data = await this.fetchJson<SearchCommitsResponse>(
          `https://api.github.com/search/commits?q=author:${encodeURIComponent(username)}+author-date:>=${sinceStr}&sort=author-date&order=desc&per_page=100&page=${page}`,
          'application/vnd.github.cloak-preview+json',
        );

        if (!data.items || data.items.length === 0) break;

        for (const item of data.items) {
          const d = new Date(item.commit.author.date);
          timestamps.push({
            date: d.toISOString().split('T')[0]!,
            hour: d.getUTCHours(),
            dayOfWeek: d.getUTCDay(),
          });
        }

        if (data.items.length < 100) break;
      } catch (err) {
        log.warn({ err, page }, 'Failed to fetch commit search page');
        break;
      }
    }

    log.info({ username, totalTimestamps: timestamps.length }, 'Fetched commit timestamps');
    return timestamps;
  }

  getRateLimitRemaining(): number {
    return this.rateLimit.remaining;
  }
}
