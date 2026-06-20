import { tokens } from '../theme/tokens.js';
import type { GitHubProfileStats, LanguageBreakdown } from '../types/stats.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { renderFromTemplate } from './shared/templateLoader.js';

function formatStatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function truncateName(name: string, maxLen: number): string {
  if (name.length <= maxLen) return name;
  return name.slice(0, maxLen - 1) + '\u2026';
}

export function renderStatsCard(username: string, stats: GitHubProfileStats, languages: LanguageBreakdown[] = []): string {
  const displayLangs = languages.slice(0, 5);

  let languageBar = '';
  let langX = 30;
  const barWidth = 420;

  for (const lang of displayLangs) {
    const segWidth = Math.max(2, (lang.percent / 100) * barWidth);
    languageBar += `<rect x="${langX}" y="143" width="${segWidth}" height="6" rx="3" fill="${lang.color}"/>`;
    langX += segWidth;
  }

  const legendItems: string[] = [];
  let legendX = 30;
  const legendY = 170;

  for (const lang of displayLangs) {
    const name = truncateName(lang.name, 12);
    const swatchSize = 7;
    legendItems.push(
      `<circle cx="${legendX + 3.5}" cy="${legendY}" r="${swatchSize / 2}" fill="${lang.color}"/>` +
      `<text x="${legendX + 12}" y="${legendY + 4}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="${tokens.textSecondary}">${escapeHtml(name)}</text>`
    );
    legendX += name.length * 7 + 22;
  }

  const remainingCount = languages.length - 5;
  if (remainingCount > 0) {
    legendItems.push(
      `<text x="${legendX}" y="${legendY + 4}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="${tokens.textTertiary}">+${remainingCount} more</text>`
    );
  }

  return renderFromTemplate('03-overview-card', {
    username: escapeHtml(username),
    stars: formatStatNumber(stats.totalStarsEarned),
    commits: formatStatNumber(stats.totalCommitsLastYear),
    prs: formatStatNumber(stats.totalPRs),
    language_bar: languageBar,
    language_legend: legendItems.join('\n  '),
  });
}

export function renderLanguagesCard(languages: LanguageBreakdown[]): string {
  const maxLegendItems = 6;

  const displayLanguages = languages.slice(0, maxLegendItems);

  let barSegments = '';
  let xOffset = 30;
  const barWidth = 432;

  for (const lang of displayLanguages) {
    const segWidth = Math.max(2, (lang.percent / 100) * barWidth);
    barSegments += `<rect x="${xOffset}" y="56" width="${segWidth}" height="6" rx="3" fill="${lang.color}"/>`;
    xOffset += segWidth;
  }

  const remainingCount = languages.length - maxLegendItems;

  const langRows = displayLanguages.map((lang, i) => {
    const rowY = 100 + i * 24;
    const bytesDisplay = lang.percent >= 1 ? `(${Math.round(lang.percent)}%)` : `(<1%)`;
    return `<circle cx="36" cy="${rowY}" r="4" fill="${lang.color}"/>
  <text x="50" y="${rowY + 4}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" fill="${tokens.textPrimary}">${escapeHtml(lang.name)}</text>
  <text x="456" y="${rowY + 4}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" fill="#6e7681" text-anchor="end">${escapeHtml(bytesDisplay)}</text>`;
  }).join('\n  ');

  const remainingText = remainingCount > 0
    ? `<text x="24" y="${100 + displayLanguages.length * 24 + 4}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="#6e7681">+${remainingCount} more</text>`
    : '';

  return renderFromTemplate('04-languages-card', {
    language_bar: barSegments,
    language_rows: langRows,
    remaining_text: remainingText,
  });
}

export function renderStatsErrorSvg(username: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="120" viewBox="0 0 480 120">
  <rect width="480" height="120" fill="${tokens.bg}" rx="12"/>
  <rect width="480" height="2" fill="${tokens.red}" rx="0"/>
  <text x="240" y="45" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" fill="${tokens.textSecondary}" text-anchor="middle">Stats unavailable</text>
  <text x="240" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" fill="${tokens.textPrimary}" text-anchor="middle">@${escapeHtml(username)}</text>
  <text x="240" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="${tokens.textSecondary}" text-anchor="middle">Check the username and try again</text>
  <rect y="118" width="480" height="2" fill="${tokens.red}" rx="0"/>
</svg>`;
}
