import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculateCommitsPerTenure } from '../../src/scorer/insights/commitsPerTenure.js';
import { renderCommitsPerTenureCard } from '../../src/renderer/insights/CommitsPerTenureCard.js';

describe('Commits Per Tenure insight integration', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should produce valid SVG from real calculation flow', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = calculateCommitsPerTenure(500, '2019-06-15T00:00:00Z');
    expect(result.average).toBe(100);
    expect(result.totalCommits).toBe(500);
    expect(result.tenureYears).toBe(5);

    const svg = renderCommitsPerTenureCard(result.average, result.totalCommits, result.tenureYears);
    expect(svg).toContain('<svg');
    expect(svg).toContain('100.0');
    expect(svg).toContain('500');
    expect(svg).toContain('5 years');
  });

  it('should handle new account', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = calculateCommitsPerTenure(30, '2024-01-01T00:00:00Z');
    expect(result.average).toBeGreaterThan(0);
    expect(result.tenureYears).toBeLessThan(1);

    const svg = renderCommitsPerTenureCard(result.average, result.totalCommits, result.tenureYears);
    expect(svg).toContain('months');
  });

  it('should handle zero commits', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = calculateCommitsPerTenure(0, '2020-01-01T00:00:00Z');
    expect(result.average).toBe(0);

    const svg = renderCommitsPerTenureCard(result.average, result.totalCommits, result.tenureYears);
    expect(svg).toContain('0.0');
  });
});
