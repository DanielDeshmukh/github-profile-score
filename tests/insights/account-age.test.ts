import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculateAccountAge } from '../../src/scorer/insights/accountAge.js';

describe('calculateAccountAge', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should calculate years and months correctly', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = calculateAccountAge('2020-02-10T00:00:00Z');
    expect(result.years).toBe(4);
    expect(result.months).toBe(4);
    expect(result.createdAt).toBe('2020-02-10T00:00:00Z');
  });

  it('should handle exact years (zero months)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = calculateAccountAge('2020-06-15T00:00:00Z');
    expect(result.years).toBe(4);
    expect(result.months).toBe(0);
  });

  it('should handle less than one year', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = calculateAccountAge('2024-01-10T00:00:00Z');
    expect(result.years).toBe(0);
    expect(result.months).toBe(5);
  });

  it('should handle month boundary correctly', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    // Created on the 28th, now on the 15th — not yet reached the month anniversary
    const result = calculateAccountAge('2023-06-28T00:00:00Z');
    expect(result.years).toBe(0);
    expect(result.months).toBe(11);
  });

  it('should return zero for future dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = calculateAccountAge('2025-01-01T00:00:00Z');
    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
  });

  it('should handle same month', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = calculateAccountAge('2024-06-01T00:00:00Z');
    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
  });
});
