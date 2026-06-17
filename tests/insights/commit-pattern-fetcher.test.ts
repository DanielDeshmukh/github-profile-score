import { describe, it, expect } from 'vitest';
import type { CommitTimestamp } from '../../src/fetcher/insights/CommitPatternFetcher.js';

describe('CommitPatternFetcher types', () => {
  it('should have correct CommitTimestamp shape', () => {
    const ts: CommitTimestamp = {
      date: '2024-06-15',
      hour: 14,
      dayOfWeek: 6,
    };
    expect(ts).toHaveProperty('date');
    expect(ts).toHaveProperty('hour');
    expect(ts).toHaveProperty('dayOfWeek');
  });
});
