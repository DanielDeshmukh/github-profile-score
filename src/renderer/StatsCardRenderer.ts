import { THEME } from '../theme/tokens.js';
import type { GitHubProfileStats, LanguageBreakdown } from '../types/stats.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { createGradeRing } from './shared/ring.js';

const CARD_WIDTH = 280;
const CARD_HEIGHT = 200;

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function createStatRow(label: string, value: number, yOffset: number): string {
  return `
  <text x="24" y="${yOffset}" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="11" fill="${THEME.silver}">${escapeHtml(label)}</text>
  <text x="${CARD_WIDTH - 24}" y="${yOffset}" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="13" fill="${THEME.goldLight}" text-anchor="end" font-weight="600">${formatNumber(value)}</text>`;
}

/**
 * Render the GitHub Stats card (left card in the bottom row).
 *
 * Shows: total stars earned, total commits (last year), total PRs,
 * total issues, plus a small grade ring in the top-right corner.
 *
 * The grade ring reuses the shared createGradeRing helper from
 * src/renderer/shared/ring.ts to ensure consistent arc-drawing
 * between the score badge and this card.
 */
export function renderStatsCard(username: string, stats: GitHubProfileStats): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${THEME.cream}" rx="12"/>
  <rect width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>

  <text x="24" y="30" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="13" fill="${THEME.goldLight}" font-weight="600">GitHub Stats</text>
  <text x="24" y="46" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="10" fill="${THEME.silver}">@${escapeHtml(username)}</text>

  ${createGradeRing({ cx: CARD_WIDTH - 40, cy: 36, radius: 20, score: stats.totalStarsEarned + stats.totalCommitsLastYear + stats.totalPRs + stats.totalIssues, maxScore: 1000, grade: stats.grade })}

  <line x1="24" y1="58" x2="${CARD_WIDTH - 24}" y2="58" stroke="${THEME.slate}" stroke-width="0.5"/>

  ${createStatRow('Total Stars Earned', stats.totalStarsEarned, 78)}
  ${createStatRow('Commits (Last Year)', stats.totalCommitsLastYear, 100)}
  ${createStatRow('Total PRs', stats.totalPRs, 122)}
  ${createStatRow('Total Issues', stats.totalIssues, 144)}

  <rect y="${CARD_HEIGHT - 2}" width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
</svg>`;
}

/**
 * Render the Language Breakdown card (right card in the bottom row).
 *
 * IMPORTANT: Language bar segments use each language's recognizable
 * GitHub brand color (e.g. Python blue, JS yellow, HTML orange).
 * This is a universally recognized convention — users expect to see
 * Python as blue, JavaScript as yellow, etc. Only the CARD CHROME
 * (background, borders, headers, text) uses the gold/charcoal theme.
 * Do NOT "fix" the language colors to use theme tokens — that would
 * break the visual recognition that makes language cards useful.
 */
export function renderLanguagesCard(languages: LanguageBreakdown[]): string {
  const svgHeight = 200;
  const barY = 55;
  const barHeight = 12;
  const legendStartY = 85;
  const maxLegendItems = 6;

  const displayLanguages = languages.slice(0, maxLegendItems);

  let barSegments = '';
  let xOffset = 24;
  const barWidth = CARD_WIDTH - 48;

  for (const lang of displayLanguages) {
    const segWidth = Math.max(2, (lang.percent / 100) * barWidth);
    barSegments += `<rect x="${xOffset}" y="${barY}" width="${segWidth}" height="${barHeight}" rx="2" fill="${lang.color}"/>`;
    xOffset += segWidth;
  }

  let legend = '';
  for (let i = 0; i < displayLanguages.length; i++) {
    const lang = displayLanguages[i]!;
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 24 + col * 130;
    const y = legendStartY + row * 20;

    legend += `
  <circle cx="${x}" cy="${y - 3}" r="4" fill="${lang.color}"/>
  <text x="${x + 10}" y="${y}" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="10" fill="${THEME.goldLight}">${escapeHtml(lang.name)}</text>
  <text x="${x + 110}" y="${y}" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="10" fill="${THEME.silver}" text-anchor="end">${lang.percent}%</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${svgHeight}" viewBox="0 0 ${CARD_WIDTH} ${svgHeight}">
  <rect width="${CARD_WIDTH}" height="${svgHeight}" fill="${THEME.cream}" rx="12"/>
  <rect width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>

  <text x="24" y="30" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="13" fill="${THEME.goldLight}" font-weight="600">Most Used Languages</text>

  <line x1="24" y1="42" x2="${CARD_WIDTH - 24}" y2="42" stroke="${THEME.slate}" stroke-width="0.5"/>

  <rect x="24" y="${barY}" width="${barWidth}" height="${barHeight}" rx="2" fill="${THEME.barTrack}"/>
  ${barSegments}

  ${legend}

  <rect y="${svgHeight - 2}" width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
</svg>`;
}

export function renderStatsErrorSvg(username: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="120" viewBox="0 0 ${CARD_WIDTH} 120">
  <rect width="${CARD_WIDTH}" height="120" fill="${THEME.cream}" rx="12"/>
  <rect width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
  <text x="${CARD_WIDTH / 2}" y="45" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="14" fill="${THEME.silver}" text-anchor="middle">Stats Unavailable</text>
  <text x="${CARD_WIDTH / 2}" y="70" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="12" fill="${THEME.goldLight}" text-anchor="middle">@${escapeHtml(username)}</text>
  <text x="${CARD_WIDTH / 2}" y="95" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="10" fill="${THEME.textMuted}" text-anchor="middle">Check the username and try again</text>
  <rect y="118" width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
</svg>`;
}
