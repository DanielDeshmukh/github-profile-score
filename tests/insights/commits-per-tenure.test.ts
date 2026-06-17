import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculateCommitsPerTenure } from '../../src/scorer/insights/commitsPerTenure.js';

describe('calculateCommitsPerTenure', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should calculate average for multi-year account', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = calculateCommitsPerTenure(500, '2019-06-15T00:00:00Z');
    expect(result.average).toBe(100);
    expect(result.totalCommits).toBe(500);
    expect(result.tenureYears).toBe(5);
  });

  it('should handle sub-year accounts with fractional calculation', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = calculateCommitsPerTenure(30, '2024-01-01T00:00:00Z');
    expect(result.average).toBeGreaterThan(0);
    expect(result.tenureYears).toBeLessThan(1);
  });

  it('should handle zero commits', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = calculateCommitsPerTenure(0, '2020-01-01T00:00:00Z');
    expect(result.average).toBe(0);
    expect(result.totalCommits).toBe(0);
  });

  it('should handle brand new account', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = calculateCommitsPerTenure(5, '2024-06-01T00:00:00Z');
    expect(result.average).toBeGreaterThan(0);
    expect(result.tenureYears).toBeLessThan(1);
  });

  it('should handle future date gracefully', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = calculateCommitsPerTenure(100, '2025-01-01T00:00:00Z');
    expect(result.tenureYears).toBe(0);
  });

  it('should round average to 1 decimal', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = calculateCommitsPerTenure(100, '2021-06-15T00:00:00Z');
    expect(result.average).toBe(33.3);
  });
});
