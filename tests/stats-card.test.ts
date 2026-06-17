import { describe, it, expect } from 'vitest';
import { renderStatsCard, renderLanguagesCard, renderStatsErrorSvg } from '../src/renderer/StatsCardRenderer.js';
import type { GitHubProfileStats, LanguageBreakdown } from '../src/types/stats.js';
import { THEME, tokens } from '../src/theme/tokens.js';

function createMockStats(overrides: Partial<GitHubProfileStats> = {}): GitHubProfileStats {
  return {
    totalStarsEarned: 150,
    totalCommitsLastYear: 420,
    totalPRs: 35,
    totalIssues: 12,
    grade: 'B',
    ...overrides,
  };
}

function createMockLanguages(overrides: Partial<LanguageBreakdown>[] = []): LanguageBreakdown[] {
  const defaults: LanguageBreakdown[] = [
    { name: 'TypeScript', percent: 45.2, color: '#3178c6' },
    { name: 'JavaScript', percent: 25.1, color: '#f1e05a' },
    { name: 'Python', percent: 15.3, color: '#3572a5' },
  ];
  return overrides.length > 0
    ? overrides.map((o) => ({ ...defaults[0]!, ...o }))
    : defaults;
}

describe('StatsCardRenderer', () => {
  describe('renderStatsCard', () => {
    it('should render valid SVG with theme colors', () => {
      const stats = createMockStats();
      const svg = renderStatsCard('testuser', stats);

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain(THEME.cream);
      expect(svg).toContain(tokens.purple);
      expect(svg).toContain(THEME.goldLight);
      expect(svg).toContain(THEME.silver);
    });

    it('should include stat labels and values', () => {
      const stats = createMockStats({
        totalStarsEarned: 100,
        totalCommitsLastYear: 200,
        totalPRs: 30,
        totalIssues: 10,
      });
      const svg = renderStatsCard('testuser', stats);

      expect(svg).toContain('Total Stars');
      expect(svg).toContain('Commits (Last Year)');
      expect(svg).toContain('Total PRs');
      expect(svg).toContain('Total Issues');
      expect(svg).toContain('GitHub Stats');
    });

    it('should include grade letter', () => {
      const stats = createMockStats({ grade: 'A' });
      const svg = renderStatsCard('testuser', stats);

      expect(svg).toContain('>A<');
    });

    it('should include username', () => {
      const svg = renderStatsCard('testuser', createMockStats());
      expect(svg).toContain('testuser');
    });

    it('should have correct viewBox dimensions', () => {
      const svg = renderStatsCard('testuser', createMockStats());
      expect(svg).toContain('width="480"');
      expect(svg).toContain('height="200"');
    });
  });

  describe('renderLanguagesCard', () => {
    it('should render valid SVG with theme chrome', () => {
      const languages = createMockLanguages();
      const svg = renderLanguagesCard(languages);

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain(THEME.cream);
      expect(svg).toContain(tokens.purple);
      expect(svg).toContain('Most Used Languages');
    });

    it('should include language names and percentages', () => {
      const languages = createMockLanguages();
      const svg = renderLanguagesCard(languages);

      expect(svg).toContain('TypeScript');
      expect(svg).toContain('45.2%');
      expect(svg).toContain('JavaScript');
      expect(svg).toContain('25.1%');
    });

    it('should preserve language brand colors', () => {
      const languages = createMockLanguages([
        { name: 'Python', percent: 60, color: '#3572a5' },
      ]);
      const svg = renderLanguagesCard(languages);

      expect(svg).toContain('#3572a5');
    });

    it('should handle empty languages', () => {
      const svg = renderLanguagesCard([]);
      expect(svg).toContain('<svg');
      expect(svg).toContain('Most Used Languages');
    });

    it('should limit legend to 5 items', () => {
      const languages: LanguageBreakdown[] = Array.from({ length: 10 }, (_, i) => ({
        name: `Lang${i}`,
        percent: 10,
        color: '#000000',
      }));
      const svg = renderLanguagesCard(languages);

      expect(svg).toContain('Lang0');
      expect(svg).toContain('Lang4');
      expect(svg).not.toContain('Lang5');
    });

    it('should have correct viewBox dimensions', () => {
      const svg = renderLanguagesCard(createMockLanguages());
      expect(svg).toContain('width="480"');
      expect(svg).toContain('height="200"');
    });
  });

  describe('renderStatsErrorSvg', () => {
    it('should render error SVG with username', () => {
      const svg = renderStatsErrorSvg('testuser');
      expect(svg).toContain('testuser');
      expect(svg).toContain('Stats Unavailable');
      expect(svg).toContain(THEME.cream);
    });
  });
});
