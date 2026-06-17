import type { ContributionDay } from '../types/stats.js';

export interface StreakResult {
  current: number;
  longest: number;
  currentRange: { start: string; end: string };
  longestRange: { start: string; end: string };
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Calculate current and longest contribution streaks from a GitHub
 * contribution calendar.
 *
 * Algorithm: Walk the daily contribution calendar chronologically.
 * A streak is a consecutive sequence of days where contributionCount > 0.
 *
 * Current streak definition: The streak must include today (UTC) or
 * yesterday (UTC) to count as "current". This accounts for the fact
 * that GitHub's calendar may show today's contributions as incomplete
 * and that some users in late timezones may not have committed yet today.
 *
 * Timezone: All date comparisons use UTC consistently. GitHub's
 * contribution calendar is already in the user's local timezone, but
 * the API returns dates as UTC midnight strings. We treat each date
 * string as a UTC day boundary, which matches GitHub's own streak
 * calculation behavior.
 */
export function calculateStreaks(calendar: ContributionDay[]): StreakResult {
  if (calendar.length === 0) {
    return {
      current: 0,
      longest: 0,
      currentRange: { start: '', end: '' },
      longestRange: { start: '', end: '' },
    };
  }

  const sorted = [...calendar].sort((a, b) => a.date.localeCompare(b.date));

  let longest = 0;
  let longestStart = sorted[0]!.date;
  let longestEnd = sorted[0]!.date;

  let currentRun = 0;
  let currentStart = sorted[0]!.date;
  let currentEnd = sorted[0]!.date;

  let bestCurrentRun = 0;
  let bestCurrentStart = sorted[0]!.date;
  let bestCurrentEnd = sorted[0]!.date;

  for (let i = 0; i < sorted.length; i++) {
    const day = sorted[i]!;

    if (day.count > 0) {
      if (currentRun === 0) {
        currentStart = day.date;
      }
      currentRun++;
      currentEnd = day.date;

      if (currentRun > longest) {
        longest = currentRun;
        longestStart = currentStart;
        longestEnd = currentEnd;
      }
    } else {
      currentRun = 0;
    }
  }

  const today = new Date();
  const todayStr = toDateStr(today);
  const yesterdayStr = toDateStr(addDays(today, -1));

  const lastDayWithContributions = findLastContributionDay(sorted);

  if (lastDayWithContributions && (lastDayWithContributions.date === todayStr || lastDayWithContributions.date === yesterdayStr)) {
    let streakEnd = lastDayWithContributions.date;
    let streakStart = streakEnd;
    let count = 0;

    for (let i = sorted.length - 1; i >= 0; i--) {
      const day = sorted[i]!;
      if (day.date > streakEnd) continue;

      if (count === 0) {
        if (day.date !== streakEnd) break;
      }

      if (day.count > 0) {
        if (count === 0 || day.date === toDateStr(addDays(new Date(streakStart + 'T00:00:00Z'), -1))) {
          count++;
          streakStart = day.date;
        } else {
          break;
        }
      } else {
        if (count > 0) break;
      }
    }

    if (count > bestCurrentRun) {
      bestCurrentRun = count;
      bestCurrentStart = streakStart;
      bestCurrentEnd = streakEnd;
    }
  }

  if (bestCurrentRun === 0 && longest > 0) {
    let streakEnd = lastDayWithContributions?.date ?? sorted[0]!.date;
    let streakStart = streakEnd;
    let count = 0;

    for (let i = sorted.length - 1; i >= 0; i--) {
      const day = sorted[i]!;
      if (day.date > streakEnd) continue;

      if (count === 0) {
        if (day.date !== streakEnd) break;
      }

      if (day.count > 0) {
        if (count === 0 || day.date === toDateStr(addDays(new Date(streakStart + 'T00:00:00Z'), -1))) {
          count++;
          streakStart = day.date;
        } else {
          break;
        }
      } else {
        if (count > 0) break;
      }
    }

    bestCurrentRun = count;
    bestCurrentStart = streakStart;
    bestCurrentEnd = streakEnd;
  }

  return {
    current: bestCurrentRun,
    longest,
    currentRange: {
      start: bestCurrentStart,
      end: bestCurrentEnd,
    },
    longestRange: {
      start: longestStart,
      end: longestEnd,
    },
  };
}

function findLastContributionDay(sorted: ContributionDay[]): ContributionDay | undefined {
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i]!.count > 0) {
      return sorted[i];
    }
  }
  return undefined;
}
