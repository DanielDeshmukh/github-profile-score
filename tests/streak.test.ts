import { describe, it, expect } from 'vitest';
import { calculateStreaks } from '../src/scorer/streak.js';
import type { ContributionDay } from '../src/types/stats.js';

function createDay(date: string, count: number): ContributionDay {
  return { date, count, color: '#ebedf0' };
}

function createDateRange(start: string, end: string): ContributionDay[] {
  const days: ContributionDay[] = [];
  const current = new Date(start + 'T00:00:00Z');
  const last = new Date(end + 'T00:00:00Z');

  while (current <= last) {
    days.push(createDay(current.toISOString().split('T')[0]!, 1));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return days;
}

describe('calculateStreaks', () => {
  it('should return zero streaks for empty calendar', () => {
    const result = calculateStreaks([]);
    expect(result.current).toBe(0);
    expect(result.longest).toBe(0);
    expect(result.currentRange.start).toBe('');
    expect(result.currentRange.end).toBe('');
    expect(result.longestRange.start).toBe('');
    expect(result.longestRange.end).toBe('');
  });

  it('should return zero streaks for all-zero calendar', () => {
    const calendar: ContributionDay[] = [
      createDay('2024-01-01', 0),
      createDay('2024-01-02', 0),
      createDay('2024-01-03', 0),
    ];
    const result = calculateStreaks(calendar);
    expect(result.current).toBe(0);
    expect(result.longest).toBe(0);
  });

  it('should detect a single-day streak', () => {
    const calendar: ContributionDay[] = [
      createDay('2024-01-01', 0),
      createDay('2024-01-02', 5),
      createDay('2024-01-03', 0),
    ];
    const result = calculateStreaks(calendar);
    expect(result.longest).toBe(1);
    expect(result.longestRange.start).toBe('2024-01-02');
    expect(result.longestRange.end).toBe('2024-01-02');
  });

  it('should detect a multi-day streak', () => {
    const calendar: ContributionDay[] = [
      createDay('2024-01-01', 0),
      createDay('2024-01-02', 3),
      createDay('2024-01-03', 5),
      createDay('2024-01-04', 2),
      createDay('2024-01-05', 0),
    ];
    const result = calculateStreaks(calendar);
    expect(result.longest).toBe(3);
    expect(result.longestRange.start).toBe('2024-01-02');
    expect(result.longestRange.end).toBe('2024-01-04');
  });

  it('should handle streak with zero-count days having contributions', () => {
    const calendar: ContributionDay[] = [
      createDay('2024-01-01', 1),
      createDay('2024-01-02', 0),
      createDay('2024-01-03', 1),
      createDay('2024-01-04', 1),
    ];
    const result = calculateStreaks(calendar);
    expect(result.longest).toBe(2);
  });

  it('should handle single day with contributions', () => {
    const calendar: ContributionDay[] = [createDay('2024-06-15', 10)];
    const result = calculateStreaks(calendar);
    expect(result.longest).toBe(1);
  });

  it('should handle multiple separate streaks and pick longest', () => {
    const calendar: ContributionDay[] = [
      createDay('2024-01-01', 1),
      createDay('2024-01-02', 1),
      createDay('2024-01-03', 0),
      createDay('2024-01-04', 1),
      createDay('2024-01-05', 1),
      createDay('2024-01-06', 1),
      createDay('2024-01-07', 1),
      createDay('2024-01-08', 0),
    ];
    const result = calculateStreaks(calendar);
    expect(result.longest).toBe(4);
    expect(result.longestRange.start).toBe('2024-01-04');
    expect(result.longestRange.end).toBe('2024-01-07');
  });

  it('should handle ties for longest streak by picking the first', () => {
    const calendar: ContributionDay[] = [
      createDay('2024-01-01', 1),
      createDay('2024-01-02', 1),
      createDay('2024-01-03', 0),
      createDay('2024-01-04', 1),
      createDay('2024-01-05', 1),
    ];
    const result = calculateStreaks(calendar);
    expect(result.longest).toBe(2);
    expect(result.longestRange.start).toBe('2024-01-01');
    expect(result.longestRange.end).toBe('2024-01-02');
  });

  it('should handle all days with contributions', () => {
    const calendar = createDateRange('2024-01-01', '2024-01-10');
    const result = calculateStreaks(calendar);
    expect(result.longest).toBe(10);
  });

  it('should handle contributions at start and end of calendar', () => {
    const calendar: ContributionDay[] = [
      createDay('2024-01-01', 1),
      createDay('2024-01-02', 0),
      createDay('2024-01-03', 0),
      createDay('2024-01-04', 0),
      createDay('2024-01-05', 1),
    ];
    const result = calculateStreaks(calendar);
    expect(result.longest).toBe(1);
  });
});
