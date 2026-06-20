export const CACHE_KEYS = {
  score: (username: string) => `score:${username}`,
  profile: (username: string) => `github:${username}:profile`,
  repos: (username: string) => `github:${username}:repos`,
  events: (username: string) => `github:${username}:events`,
  refreshCooldown: (username: string) => `refresh_cooldown:${username}`,
  stats: (username: string) => `stats:v1:${username}`,
  statsRefreshCooldown: (username: string) => `stats:v1:refresh_cooldown:${username}`,
  insight: (slug: string, username: string) => `insight:${slug}:v1:${username}`,
} as const;

export const CACHE_TTL = {
  SCORE: 300,
  STATS: 300,
  GITHUB_DATA: 3600,
  REFRESH_COOLDOWN: 600,
} as const;
