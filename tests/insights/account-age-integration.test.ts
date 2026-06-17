import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculateAccountAge } from '../../src/scorer/insights/accountAge.js';
import { renderAccountAgeCard } from '../../src/renderer/insights/AccountAgeCard.js';

describe('Account Age insight integration', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should produce valid SVG from real calculation flow', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = calculateAccountAge('2019-03-10T00:00:00Z');
    expect(result.years).toBe(5);
    expect(result.months).toBe(3);

    const svg = renderAccountAgeCard(result.years, result.months);
    expect(svg).toContain('<svg');
    expect(svg).toContain('5 years');
    expect(svg).toContain('3 months');
  });

  it('should handle brand-new account', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = calculateAccountAge('2024-06-10T00:00:00Z');
    expect(result.years).toBe(0);
    expect(result.months).toBe(0);

    const svg = renderAccountAgeCard(result.years, result.months);
    expect(svg).toContain('< 1 month');
  });

  it('should handle decade-old account', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const result = calculateAccountAge('2014-06-15T00:00:00Z');
    expect(result.years).toBe(10);
    expect(result.months).toBe(0);

    const svg = renderAccountAgeCard(result.years, result.months);
    expect(svg).toContain('10 years');
  });
});
