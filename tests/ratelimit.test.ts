import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubRateLimitError } from '../src/types.js';
import { renderRateLimitSvg } from '../src/renderer/SvgRenderer.js';

describe('GitHubRateLimitError', () => {
  it('should create error with resetAt date', () => {
    const resetAt = new Date('2024-01-01T12:00:00Z');
    const error = new GitHubRateLimitError(resetAt);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(GitHubRateLimitError);
    expect(error.name).toBe('GitHubRateLimitError');
    expect(error.message).toBe('GitHub API rate limit exceeded');
    expect(error.resetAt).toEqual(resetAt);
  });
});

describe('renderRateLimitSvg', () => {
  it('should render SVG with reset time', () => {
    const resetAt = new Date('2024-06-15T14:30:00Z');
    const svg = renderRateLimitSvg('testuser', resetAt);

    expect(svg).toContain('Rate limited — retry after 14:30 UTC');
    expect(svg).toContain('@testuser');
    expect(svg).toContain('GitHub API rate limit exceeded');
    expect(svg).toContain('<svg');
  });

  it('should handle midnight time', () => {
    const resetAt = new Date('2024-06-15T00:00:00Z');
    const svg = renderRateLimitSvg('testuser', resetAt);

    expect(svg).toContain('00:00 UTC');
  });
});

describe('GitHubFetcher rate limit handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw GitHubRateLimitError when X-RateLimit-Remaining is 0', async () => {
    vi.mock('../src/config.js', () => ({
      getConfig: () => ({
        GITHUB_TOKEN: 'test-token',
        NVIDIA_API_KEY: undefined,
        NVIDIA_MODEL: 'meta/llama-3.1-8b-instruct',
        PORT: 3000,
        CACHE_TTL_SECONDS: 21600,
        SCORE_THRESHOLD: 14,
      }),
    }));

    const mockResponse = {
      ok: false,
      status: 403,
      headers: new Map([
        ['x-ratelimit-remaining', '0'],
        ['x-ratelimit-reset', '1700000000'],
      ]),
      json: () => Promise.resolve({}),
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const { GitHubFetcher } = await import('../src/fetcher/GitHubFetcher.js');
    const fetcher = new GitHubFetcher();

    await expect(fetcher.fetchProfile('testuser')).rejects.toThrow(GitHubRateLimitError);
  });

  it('should throw RateLimitError for 403/429 without remaining=0', async () => {
    vi.mock('../src/config.js', () => ({
      getConfig: () => ({
        GITHUB_TOKEN: 'test-token',
        NVIDIA_API_KEY: undefined,
        NVIDIA_MODEL: 'meta/llama-3.1-8b-instruct',
        PORT: 3000,
        CACHE_TTL_SECONDS: 21600,
        SCORE_THRESHOLD: 14,
      }),
    }));

    const { RateLimitError } = await import('../src/utils/errors.js');

    const mockResponse = {
      ok: false,
      status: 429,
      headers: new Map([
        ['x-ratelimit-remaining', '10'],
        ['retry-after', '30'],
      ]),
      json: () => Promise.resolve({}),
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const { GitHubFetcher } = await import('../src/fetcher/GitHubFetcher.js');
    const fetcher = new GitHubFetcher();

    await expect(fetcher.fetchProfile('testuser')).rejects.toThrow(RateLimitError);
  });
});
