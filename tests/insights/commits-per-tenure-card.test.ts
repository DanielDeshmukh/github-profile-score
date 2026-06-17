import { describe, it, expect } from 'vitest';
import { renderCommitsPerTenureCard } from '../../src/renderer/insights/CommitsPerTenureCard.js';
import { THEME } from '../../src/theme/tokens.js';

describe('CommitsPerTenureCard renderer', () => {
  it('should render SVG with theme colors', () => {
    const svg = renderCommitsPerTenureCard(100, 500, 5);
    expect(svg).toContain('<svg');
    expect(svg).toContain(THEME.cream);
    expect(svg).toContain(THEME.gold);
    expect(svg).toContain(THEME.goldLight);
    expect(svg).toContain(THEME.silver);
  });

  it('should display average with 1 decimal', () => {
    const svg = renderCommitsPerTenureCard(100, 500, 5);
    expect(svg).toContain('100.0');
  });

  it('should display years for multi-year tenure', () => {
    const svg = renderCommitsPerTenureCard(100, 500, 5);
    expect(svg).toContain('5 years');
    expect(svg).toContain('500');
  });

  it('should display singular "year" for 1', () => {
    const svg = renderCommitsPerTenureCard(200, 200, 1);
    expect(svg).toContain('1 year');
    expect(svg).not.toContain('1 years');
  });

  it('should display months for sub-year tenure', () => {
    const svg = renderCommitsPerTenureCard(120, 30, 0.25);
    expect(svg).toContain('3 months');
  });

  it('should handle zero average', () => {
    const svg = renderCommitsPerTenureCard(0, 0, 5);
    expect(svg).toContain('0.0');
  });

  it('should render correct viewBox dimensions', () => {
    const svg = renderCommitsPerTenureCard(50, 100, 2);
    expect(svg).toContain('width="320"');
    expect(svg).toContain('height="80"');
  });
});
