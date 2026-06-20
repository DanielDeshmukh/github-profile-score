import { tokens } from '../theme/tokens.js';
import type { GitHubProfileStats, LanguageBreakdown } from '../types/stats.js';
import { escapeHtml } from '../utils/escapeHtml.js';

const CARD_WIDTH = 480;
const CARD_HEIGHT = 180;

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
    languageBar += `<rect x="${langX}" y="128" width="${segWidth}" height="8" rx="4" fill="${lang.color}"/>`;
    langX += segWidth;
  }

  const legendItems: string[] = [];
  let legendX = 30;
  const legendY = 158;

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

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${tokens.bg}" rx="12"/>

  <text x="30" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" fill="${tokens.textSecondary}">${escapeHtml(username)}'s GitHub stats</text>

  <text x="30" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="18" font-weight="500" fill="${tokens.textPrimary}">${formatStatNumber(stats.totalStarsEarned)}</text>
  <text x="30" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="${tokens.textTertiary}">Stars</text>

  <text x="170" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="18" font-weight="500" fill="${tokens.textPrimary}">${formatStatNumber(stats.totalCommitsLastYear)}</text>
  <text x="170" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="${tokens.textTertiary}">Commits (last year)</text>

  <text x="310" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="18" font-weight="500" fill="${tokens.textPrimary}">${formatStatNumber(stats.totalPRs)}</text>
  <text x="310" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="${tokens.textTertiary}">Pull requests</text>

  <line x1="30" y1="100" x2="450" y2="100" stroke="${tokens.border}" stroke-width="0.5"/>

  <text x="30" y="116" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="${tokens.textTertiary}">Top languages</text>

  ${languageBar}

  ${legendItems.join('\n  ')}
</svg>`;
}

export function renderLanguagesCard(languages: LanguageBreakdown[]): string {
  const svgHeight = 180;
  const barY = 44;
  const barHeight = 8;
  const maxLegendItems = 6;

  const displayLanguages = languages.slice(0, maxLegendItems);

  let barSegments = '';
  let xOffset = 30;
  const barWidth = 420;

  for (const lang of displayLanguages) {
    const segWidth = Math.max(2, (lang.percent / 100) * barWidth);
    barSegments += `<rect x="${xOffset}" y="${barY}" width="${segWidth}" height="${barHeight}" rx="4" fill="${lang.color}"/>`;
    xOffset += segWidth;
  }

  const remainingCount = languages.length - maxLegendItems;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${svgHeight}" viewBox="0 0 ${CARD_WIDTH} ${svgHeight}">
  <rect width="${CARD_WIDTH}" height="${svgHeight}" fill="${tokens.bg}" rx="12"/>

  <text x="30" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" fill="${tokens.textSecondary}">Languages</text>

  <rect x="30" y="${barY}" width="${barWidth}" height="${barHeight}" rx="4" fill="${tokens.bgTile}"/>
  ${barSegments}

  ${displayLanguages.map((lang, i) => {
    const rowY = 60 + i * 22;
    const bytesDisplay = lang.percent >= 1 ? `(${Math.round(lang.percent)}%)` : `(<1%)`;
    return `<circle cx="37" cy="${rowY}" r="3.5" fill="${lang.color}"/>
  <text x="48" y="${rowY + 4}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" fill="${tokens.textPrimary}">${escapeHtml(lang.name)}</text>
  <text x="420" y="${rowY + 4}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" fill="${tokens.textSecondary}" text-anchor="end">${escapeHtml(bytesDisplay)}</text>`;
  }).join('\n  ')}

  ${remainingCount > 0 ? `<text x="30" y="${60 + displayLanguages.length * 22 + 4}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="${tokens.textTertiary}">+${remainingCount} more</text>` : ''}
</svg>`;
}

export function renderStatsErrorSvg(username: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="120" viewBox="0 0 ${CARD_WIDTH} 120">
  <rect width="${CARD_WIDTH}" height="120" fill="${tokens.bg}" rx="12"/>
  <rect width="${CARD_WIDTH}" height="2" fill="${tokens.red}" rx="0"/>
  <text x="${CARD_WIDTH / 2}" y="45" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" fill="${tokens.textSecondary}" text-anchor="middle">Stats unavailable</text>
  <text x="${CARD_WIDTH / 2}" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" fill="${tokens.textPrimary}" text-anchor="middle">@${escapeHtml(username)}</text>
  <text x="${CARD_WIDTH / 2}" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="${tokens.textSecondary}" text-anchor="middle">Check the username and try again</text>
  <rect y="118" width="${CARD_WIDTH}" height="2" fill="${tokens.red}" rx="0"/>
</svg>`;
}
