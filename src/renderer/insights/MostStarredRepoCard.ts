import { tokens } from '../../theme/tokens.js';
import { starIcon } from '../shared/icons.js';
import { escapeHtml } from '../../utils/escapeHtml.js';

const CARD_WIDTH = 320;
const CARD_HEIGHT = 80;

function truncateName(name: string, maxLen: number): string {
  if (name.length <= maxLen) return name;
  return name.slice(0, maxLen - 1) + '\u2026';
}

export function renderMostStarredRepoCard(
  repoName: string,
  stars: number,
  repoUrl: string,
): string {
  const displayName = truncateName(repoName, 22);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${tokens.bg}" rx="6" stroke="${tokens.border}" stroke-width="0.5"/>

  ${starIcon(20, 35)}

  <text x="46" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="${tokens.textTertiary}">Most starred</text>
  <text x="46" y="50" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="16" font-weight="500" fill="${tokens.textPrimary}">
    <a href="${escapeHtml(repoUrl)}" style="text-decoration:none;fill:inherit">${escapeHtml(displayName)}</a>
  </text>
  <text x="46" y="68" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="${tokens.textSecondary}">${stars.toLocaleString()} stars</text>
</svg>`;
}

export function renderMostStarredRepoEmptySvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${tokens.bg}" rx="6" stroke="${tokens.border}" stroke-width="0.5"/>

  ${starIcon(20, 35)}

  <text x="46" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="${tokens.textTertiary}">Most starred</text>
  <text x="46" y="50" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="16" font-weight="500" fill="${tokens.textSecondary}">No public repos found</text>
</svg>`;
}
