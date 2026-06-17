export interface ContributionTrendResult {
  thisYearTotal: number;
  lastYearTotal: number;
  yoyPercentage: number;
  direction: 'up' | 'down' | 'flat';
}

const FLAT_THRESHOLD = 3;

/**
 * Calculate year-over-year contribution trend.
 *
 * Uses a flat threshold of ±3% to avoid reporting noise as
 * meaningful trend. Below this threshold, the trend is 'flat'.
 *
 * Edge cases:
 * - Both years zero: flat (no data to compare)
 * - Last year zero, this year > 0: 'up' with Infinity guarded as 100%
 * - Last year > 0, this year zero: 'down' with -100%
 * - Negative contributions (impossible but defensive): treated as 0
 */
export function calculateContributionTrend(
  thisYearTotal: number,
  lastYearTotal: number,
): ContributionTrendResult {
  const safeThis = Math.max(0, thisYearTotal);
  const safeLast = Math.max(0, lastYearTotal);

  if (safeLast === 0 && safeThis === 0) {
    return { thisYearTotal: safeThis, lastYearTotal: safeLast, yoyPercentage: 0, direction: 'flat' };
  }

  if (safeLast === 0) {
    return { thisYearTotal: safeThis, lastYearTotal: safeLast, yoyPercentage: 100, direction: 'up' };
  }

  const yoyPercentage = ((safeThis - safeLast) / safeLast) * 100;

  let direction: 'up' | 'down' | 'flat';
  if (yoyPercentage > FLAT_THRESHOLD) {
    direction = 'up';
  } else if (yoyPercentage < -FLAT_THRESHOLD) {
    direction = 'down';
  } else {
    direction = 'flat';
  }

  return { thisYearTotal: safeThis, lastYearTotal: safeLast, yoyPercentage, direction };
}
