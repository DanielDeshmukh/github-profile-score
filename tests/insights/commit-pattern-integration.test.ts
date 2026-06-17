import { describe, it, expect } from 'vitest';
import { calculateCommitPattern } from '../../src/scorer/insights/commitPattern.js';
import { renderCommitPatternCard } from '../../src/renderer/insights/CommitPatternCard.js';
import type { CommitTimestamp } from '../../src/fetcher/insights/CommitPatternFetcher.js';

describe('Commit Pattern insight integration', () => {
  it('should produce valid SVG from real calculation flow', () => {
    const timestamps: CommitTimestamp[] = [
      { date: '2024-06-01', hour: 10, dayOfWeek: 1 }, // Mon morning
      { date: '2024-06-02', hour: 14, dayOfWeek: 2 }, // Tue afternoon
      { date: '2024-06-03', hour: 10, dayOfWeek: 3 }, // Wed morning
      { date: '2024-06-04', hour: 20, dayOfWeek: 6 }, // Sat evening
    ];

    const result = calculateCommitPattern(timestamps);
    expect(result.totalCommits).toBe(4);
    expect(result.weekdayCount).toBe(3);
    expect(result.weekendCount).toBe(1);
    expect(result.dominantDayType).toBe('weekday');

    const svg = renderCommitPatternCard(
      result.dominantDayType,
      result.dominantDayPart,
      result.weekdayCount,
      result.weekendCount,
      result.totalCommits,
    );
    expect(svg).toContain('<svg');
    expect(svg).toContain('Weekdays');
    expect(svg).toContain('4 commits sampled');
  });

  it('should handle empty timestamps', () => {
    const result = calculateCommitPattern([]);
    expect(result.totalCommits).toBe(0);

    const svg = renderCommitPatternCard(
      result.dominantDayType,
      result.dominantDayPart,
      result.weekdayCount,
      result.weekendCount,
      result.totalCommits,
    );
    expect(svg).toContain('0 commits sampled');
  });

  it('should detect weekend coder pattern', () => {
    const timestamps: CommitTimestamp[] = [
      { date: '2024-06-01', hour: 22, dayOfWeek: 6 }, // Sat night
      { date: '2024-06-02', hour: 23, dayOfWeek: 0 }, // Sun night
      { date: '2024-06-08', hour: 21, dayOfWeek: 6 }, // Sat night
      { date: '2024-06-09', hour: 22, dayOfWeek: 0 }, // Sun night
    ];

    const result = calculateCommitPattern(timestamps);
    expect(result.dominantDayType).toBe('weekend');
    expect(result.dominantDayPart).toBe('evening');
  });
});
