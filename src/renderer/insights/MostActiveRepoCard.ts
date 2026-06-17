import { THEME } from '../../theme/tokens.js';
import { escapeHtml } from '../../utils/escapeHtml.js';

const CARD_WIDTH = 320;
const CARD_HEIGHT = 80;

function truncateName(name: string, maxLen: number): string {
  if (name.length <= maxLen) return name;
  return name.slice(0, maxLen - 1) + '\u2026';
}

/**
 * Render the most-active-repo insight as a standalone SVG card.
 *
 * Layout: Compact horizontal card with label, repo name + commit count.
 * Theme-compliant: cream background, gold accent bar, silver label,
 * goldLight for the main text.
 */
export function renderMostActiveRepoCard(
  repoName: string,
  commitCount: number,
  repoUrl: string,
): string {
  const displayName = truncateName(repoName, 22);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${THEME.cream}" rx="8"/>
  <rect width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
  <rect x="0" y="0" width="3" height="${CARD_HEIGHT}" fill="${THEME.gold}" rx="0"/>

  <text x="16" y="28" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="11" fill="${THEME.silver}">Most contributions to</text>

  <text x="16" y="50" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="16" fill="${THEME.goldLight}" font-weight="600">
    <a href="${escapeHtml(repoUrl)}" style="text-decoration:none;fill:inherit">${escapeHtml(displayName)}</a>
  </text>

  <text x="16" y="68" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="12" fill="${THEME.silver}">${commitCount.toLocaleString()} commits</text>

  <rect y="${CARD_HEIGHT - 2}" width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
</svg>`;
}

export function renderMostActiveRepoEmptySvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${THEME.cream}" rx="8"/>
  <rect width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
  <rect x="0" y="0" width="3" height="${CARD_HEIGHT}" fill="${THEME.gold}" rx="0"/>

  <text x="16" y="28" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="11" fill="${THEME.silver}">Most contributions to</text>
  <text x="16" y="50" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="14" fill="${THEME.silver}">No public repos found</text>

  <rect y="${CARD_HEIGHT - 2}" width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
</svg>`;
}
