import { describe, it, expect } from 'vitest';
import { renderCommitPatternCard } from '../../src/renderer/insights/CommitPatternCard.js';
import { THEME } from '../../src/theme/tokens.js';

describe('CommitPatternCard renderer', () => {
  it('should render SVG with theme colors', () => {
    const svg = renderCommitPatternCard('weekday', 'afternoon', 80, 20, 100);
    expect(svg).toContain('<svg');
    expect(svg).toContain(THEME.cream);
    expect(svg).toContain(THEME.gold);
    expect(svg).toContain(THEME.goldLight);
    expect(svg).toContain(THEME.silver);
  });

  it('should display weekday percentages', () => {
    const svg = renderCommitPatternCard('weekday', 'morning', 75, 25, 100);
    expect(svg).toContain('Weekdays: 75%');
    expect(svg).toContain('25%');
  });

  it('should display weekend as dominant', () => {
    const svg = renderCommitPatternCard('weekend', 'evening', 20, 80, 100);
    expect(svg).toContain('Weekends');
  });

  it('should display peak daypart', () => {
    const svg = renderCommitPatternCard('weekday', 'night', 80, 20, 100);
    expect(svg).toContain('Late nights');
  });

  it('should show approximate label', () => {
    const svg = renderCommitPatternCard('weekday', 'morning', 80, 20, 100);
    expect(svg).toContain('approximate');
  });

  it('should show sample count', () => {
    const svg = renderCommitPatternCard('weekday', 'morning', 80, 20, 100);
    expect(svg).toContain('100 commits sampled');
  });

  it('should handle zero commits', () => {
    const svg = renderCommitPatternCard('weekday', 'morning', 0, 0, 0);
    expect(svg).toContain('Weekdays: 0%');
    expect(svg).toContain('0 commits sampled');
  });

  it('should render correct viewBox dimensions', () => {
    const svg = renderCommitPatternCard('weekday', 'morning', 50, 50, 100);
    expect(svg).toContain('width="320"');
    expect(svg).toContain('height="100"');
  });
});
