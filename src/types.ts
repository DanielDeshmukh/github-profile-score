export interface GitHubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  avatar_url: string;
  html_url: string;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  html_url: string;
  fork: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  open_issues_count: number;
  license: { spdx_id: string } | null;
}

export interface GitHubEvent {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: Record<string, unknown>;
}

export interface DimensionResult {
  score: number;
  max: number;
  callout: string | null;
  reason: string;
}

export interface ScoreResult {
  username: string;
  total: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  dimensions: {
    activity: DimensionResult;
    quality: DimensionResult;
    documentation: DimensionResult;
    diversity: DimensionResult;
    community: DimensionResult;
  };
  cached: boolean;
  cache_age_seconds: number;
  scored_at: string;
}

export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  ttl(key: string): Promise<number>;
}

export class GitHubRateLimitError extends Error {
  constructor(public readonly resetAt: Date) {
    super('GitHub API rate limit exceeded');
    this.name = 'GitHubRateLimitError';
  }
}
