import { describe, it, expect } from 'vitest';
import { calculateContributionTrend } from '../../src/scorer/insights/contributionTrend.js';

describe('calculateContributionTrend', () => {
  it('should detect upward trend (> 3%)', () => {
    const result = calculateContributionTrend(150, 100);
    expect(result.direction).toBe('up');
    expect(result.yoyPercentage).toBeCloseTo(50, 0);
  });

  it('should detect downward trend (< -3%)', () => {
    const result = calculateContributionTrend(50, 100);
    expect(result.direction).toBe('down');
    expect(result.yoyPercentage).toBeCloseTo(-50, 0);
  });

  it('should detect flat trend (within ±3%)', () => {
    const result = calculateContributionTrend(102, 100);
    expect(result.direction).toBe('flat');
    expect(result.yoyPercentage).toBeCloseTo(2, 0);
  });

  it('should detect flat trend at exactly -3%', () => {
    const result = calculateContributionTrend(97, 100);
    expect(result.direction).toBe('flat');
    expect(result.yoyPercentage).toBeCloseTo(-3, 0);
  });

  it('should handle both years zero', () => {
    const result = calculateContributionTrend(0, 0);
    expect(result.direction).toBe('flat');
    expect(result.yoyPercentage).toBe(0);
  });

  it('should handle last year zero, this year > 0', () => {
    const result = calculateContributionTrend(50, 0);
    expect(result.direction).toBe('up');
    expect(result.yoyPercentage).toBe(100);
  });

  it('should handle this year zero, last year > 0', () => {
    const result = calculateContributionTrend(0, 50);
    expect(result.direction).toBe('down');
    expect(result.yoyPercentage).toBe(-100);
  });

  it('should clamp negative values to zero', () => {
    const result = calculateContributionTrend(-10, -5);
    expect(result.thisYearTotal).toBe(0);
    expect(result.lastYearTotal).toBe(0);
    expect(result.direction).toBe('flat');
  });

  it('should handle large increase', () => {
    const result = calculateContributionTrend(1000, 100);
    expect(result.direction).toBe('up');
    expect(result.yoyPercentage).toBeCloseTo(900, 0);
  });
});
