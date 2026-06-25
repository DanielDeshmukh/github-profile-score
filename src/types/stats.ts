export interface ContributionDay {
  date: string;
  count: number;
  color: string;
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: Array<{
    firstDay: string;
    contributionDays: ContributionDay[];
  }>;
}

export interface ContributionStats {
  totalContributions: number;
  rangeStart: string;
  rangeEnd: string;
  currentStreak: number;
  currentStreakRange: { start: string; end: string };
  longestStreak: number;
  longestStreakRange: { start: string; end: string };
  weeklyCounts: number[];
}

export interface GitHubProfileStats {
  totalStarsEarned: number;
  totalCommitsLastYear: number;
  totalPRs: number;
  totalIssues: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface LanguageBreakdown {
  name: string;
  percent: number;
  color: string;
}

export interface StatsResult {
  username: string;
  contributions: ContributionStats;
  profile: GitHubProfileStats;
  languages: LanguageBreakdown[];
  cached: boolean;
  cache_age_seconds: number;
  generated_at: string;
}
