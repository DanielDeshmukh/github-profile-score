import { describe, it, expect } from 'vitest';
import { renderAccountAgeCard } from '../../src/renderer/insights/AccountAgeCard.js';
import { THEME } from '../../src/theme/tokens.js';

describe('AccountAgeCard renderer', () => {
  it('should render SVG with theme colors', () => {
    const svg = renderAccountAgeCard(3, 6);
    expect(svg).toContain('<svg');
    expect(svg).toContain(THEME.cream);
    expect(svg).toContain(THEME.goldLight);
    expect(svg).toContain(THEME.silver);
  });

  it('should display years and months plural', () => {
    const svg = renderAccountAgeCard(3, 6);
    expect(svg).toContain('3 years');
    expect(svg).toContain('6 months');
  });

  it('should display singular forms for 1', () => {
    const svg = renderAccountAgeCard(1, 1);
    expect(svg).toContain('1 year');
    expect(svg).toContain('1 month');
    expect(svg).not.toContain('1 years');
    expect(svg).not.toContain('1 months');
  });

  it('should handle zero months', () => {
    const svg = renderAccountAgeCard(5, 0);
    expect(svg).toContain('5 years');
    expect(svg).not.toContain('month');
  });

  it('should handle zero years', () => {
    const svg = renderAccountAgeCard(0, 3);
    expect(svg).toContain('3 months');
    expect(svg).not.toContain('year');
  });

  it('should show < 1 month for 0/0', () => {
    const svg = renderAccountAgeCard(0, 0);
    expect(svg).toContain('< 1 month');
  });

  it('should render correct viewBox dimensions', () => {
    const svg = renderAccountAgeCard(2, 0);
    expect(svg).toContain('width="320"');
    expect(svg).toContain('height="80"');
  });
});
