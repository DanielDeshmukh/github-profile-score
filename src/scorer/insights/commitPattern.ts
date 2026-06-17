import type { CommitTimestamp } from '../../fetcher/insights/CommitPatternFetcher.js';

export type DayPart = 'morning' | 'afternoon' | 'evening' | 'night';
export type DayType = 'weekday' | 'weekend';

export interface CommitPatternResult {
  weekdayCount: number;
  weekendCount: number;
  dominantDayType: DayType;
  morningCount: number;
  afternoonCount: number;
  eveningCount: number;
  nightCount: number;
  dominantDayPart: DayPart;
  totalCommits: number;
}

/**
 * Bucket commit timestamps into weekday/weekend and daypart categories.
 *
 * Dayparts (UTC hours):
 * - Morning: 6-11
 * - Afternoon: 12-17
 * - Evening: 18-23
 * - Night: 0-5
 *
 * These are UTC-based and may not reflect the user's local timezone.
 * This is a known limitation documented in the code — GitHub's API
 * provides UTC timestamps only, and timezone inference from commit
 * patterns is unreliable.
 *
 * Uses a flat threshold of 5% to determine dominance — if the
 * difference between categories is less than 5%, it's considered
 * 'no clear pattern' rather than claiming one is dominant.
 */
export function calculateCommitPattern(
  timestamps: CommitTimestamp[],
): CommitPatternResult {
  let weekdayCount = 0;
  let weekendCount = 0;
  let morningCount = 0;
  let afternoonCount = 0;
  let eveningCount = 0;
  let nightCount = 0;

  for (const ts of timestamps) {
    if (ts.dayOfWeek === 0 || ts.dayOfWeek === 6) {
      weekendCount++;
    } else {
      weekdayCount++;
    }

    if (ts.hour >= 6 && ts.hour <= 11) {
      morningCount++;
    } else if (ts.hour >= 12 && ts.hour <= 17) {
      afternoonCount++;
    } else if (ts.hour >= 18 && ts.hour <= 23) {
      eveningCount++;
    } else {
      nightCount++;
    }
  }

  const totalCommits = weekdayCount + weekendCount;

  let dominantDayType: DayType = 'weekday';
  if (totalCommits > 0) {
    const weekdayPct = weekdayCount / totalCommits;
    const weekendPct = weekendCount / totalCommits;
    if (Math.abs(weekdayPct - weekendPct) < 0.05) {
      dominantDayType = 'weekday';
    } else if (weekendPct > weekdayPct) {
      dominantDayType = 'weekend';
    }
  }

  const dayPartCounts = [
    { part: 'morning' as DayPart, count: morningCount },
    { part: 'afternoon' as DayPart, count: afternoonCount },
    { part: 'evening' as DayPart, count: eveningCount },
    { part: 'night' as DayPart, count: nightCount },
  ];
  dayPartCounts.sort((a, b) => b.count - a.count);

  let dominantDayPart: DayPart = dayPartCounts[0]?.part ?? 'morning';

  if (totalCommits > 0) {
    const maxPct = dayPartCounts[0]!.count / totalCommits;
    const secondPct = dayPartCounts[1]?.count ?? 0;
    if (maxPct - secondPct / totalCommits < 0.05) {
      dominantDayPart = dayPartCounts[0]!.part;
    }
  }

  return {
    weekdayCount,
    weekendCount,
    dominantDayType,
    morningCount,
    afternoonCount,
    eveningCount,
    nightCount,
    dominantDayPart,
    totalCommits,
  };
}
