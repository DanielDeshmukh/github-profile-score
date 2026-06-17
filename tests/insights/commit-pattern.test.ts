import { describe, it, expect } from 'vitest';
import { calculateCommitPattern } from '../../src/scorer/insights/commitPattern.js';
import type { CommitTimestamp } from '../../src/fetcher/insights/CommitPatternFetcher.js';

function ts(hour: number, dayOfWeek: number): CommitTimestamp {
  return { date: '2024-06-15', hour, dayOfWeek };
}

describe('calculateCommitPattern', () => {
  it('should return empty result for no timestamps', () => {
    const result = calculateCommitPattern([]);
    expect(result.totalCommits).toBe(0);
    expect(result.weekdayCount).toBe(0);
    expect(result.weekendCount).toBe(0);
  });

  it('should count weekday vs weekend correctly', () => {
    const timestamps = [
      ts(10, 1), // Mon morning - weekday
      ts(10, 2), // Tue morning - weekday
      ts(10, 6), // Sat morning - weekend
    ];
    const result = calculateCommitPattern(timestamps);
    expect(result.weekdayCount).toBe(2);
    expect(result.weekendCount).toBe(1);
    expect(result.dominantDayType).toBe('weekday');
  });

  it('should detect weekend dominance', () => {
    const timestamps = [
      ts(10, 0), // Sun
      ts(10, 0), // Sun
      ts(10, 6), // Sat
      ts(10, 1), // Mon (only 1 weekday)
    ];
    const result = calculateCommitPattern(timestamps);
    expect(result.weekendCount).toBe(3);
    expect(result.weekdayCount).toBe(1);
    expect(result.dominantDayType).toBe('weekend');
  });

  it('should bucket dayparts correctly', () => {
    const timestamps = [
      ts(8, 1),   // morning
      ts(14, 1),  // afternoon
      ts(20, 1),  // evening
      ts(2, 1),   // night
    ];
    const result = calculateCommitPattern(timestamps);
    expect(result.morningCount).toBe(1);
    expect(result.afternoonCount).toBe(1);
    expect(result.eveningCount).toBe(1);
    expect(result.nightCount).toBe(1);
  });

  it('should detect afternoon dominance', () => {
    const timestamps = [
      ts(12, 1), ts(13, 1), ts(14, 1), ts(15, 1),
      ts(8, 1), // only 1 morning
    ];
    const result = calculateCommitPattern(timestamps);
    expect(result.afternoonCount).toBe(4);
    expect(result.dominantDayPart).toBe('afternoon');
  });

  it('should handle edge hours correctly', () => {
    const timestamps = [
      ts(5, 1),  // night (0-5)
      ts(6, 1),  // morning (6-11)
      ts(11, 1), // morning
      ts(12, 1), // afternoon (12-17)
      ts(17, 1), // afternoon
      ts(18, 1), // evening (18-23)
      ts(23, 1), // evening
    ];
    const result = calculateCommitPattern(timestamps);
    expect(result.nightCount).toBe(1);
    expect(result.morningCount).toBe(2);
    expect(result.afternoonCount).toBe(2);
    expect(result.eveningCount).toBe(2);
  });

  it('should handle Sunday correctly as weekend', () => {
    const timestamps = [ts(10, 0)];
    const result = calculateCommitPattern(timestamps);
    expect(result.weekendCount).toBe(1);
    expect(result.weekdayCount).toBe(0);
  });

  it('should handle Saturday correctly as weekend', () => {
    const timestamps = [ts(10, 6)];
    const result = calculateCommitPattern(timestamps);
    expect(result.weekendCount).toBe(1);
    expect(result.weekdayCount).toBe(0);
  });
});
