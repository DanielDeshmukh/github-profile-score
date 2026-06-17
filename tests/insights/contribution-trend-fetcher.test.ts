import { describe, it, expect } from 'vitest';
import type { TwoYearContributions } from '../../src/fetcher/insights/ContributionTrendFetcher.js';

describe('ContributionTrendFetcher types', () => {
  it('should have correct TwoYearContributions shape', () => {
    const data: TwoYearContributions = {
      thisYearTotal: 100,
      lastYearTotal: 80,
      thisYearDays: [{ date: '2024-01-01', count: 5 }],
      lastYearDays: [{ date: '2023-01-01', count: 3 }],
    };
    expect(data.thisYearTotal).toBe(100);
    expect(data.lastYearTotal).toBe(80);
    expect(data.thisYearDays).toHaveLength(1);
    expect(data.lastYearDays).toHaveLength(1);
  });
});
