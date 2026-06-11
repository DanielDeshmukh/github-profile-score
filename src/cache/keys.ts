export const CACHE_KEYS = {
  score: (username: string) => `score:${username}`,
  profile: (username: string) => `github:${username}:profile`,
  repos: (username: string) => `github:${username}:repos`,
  events: (username: string) => `github:${username}:events`,
  refreshCooldown: (username: string) => `refresh_cooldown:${username}`,
} as const;

export const CACHE_TTL = {
  SCORE: 21600,
  GITHUB_DATA: 3600,
  REFRESH_COOLDOWN: 600,
} as const;
