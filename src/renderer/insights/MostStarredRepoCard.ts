import { tokens } from '../../theme/tokens.js';
import { escapeHtml } from '../../utils/escapeHtml.js';

const CARD_WIDTH = 320;
const CARD_HEIGHT = 80;

const ICON = {
  star: `<svg x="16" y="28" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="${tokens.gold}" stroke="${tokens.gold}" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
};

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
  <style>
    .card-bg { transition: background 0.15s ease; }
    .card-bg:hover { background: #1c2128; }
  </style>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${tokens.bg}" rx="8" class="card-bg"/>
  <rect x="0" y="0" width="2" height="${CARD_HEIGHT}" fill="${tokens.gold}" rx="0"/>

  ${ICON.star}

  <text x="44" y="32" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="10" fill="${tokens.textMuted}" letter-spacing="0.06em">MOST STARRED</text>
  <text x="44" y="52" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="14" fill="${tokens.textPrimary}" font-weight="600">
    <a href="${escapeHtml(repoUrl)}" style="text-decoration:none;fill:inherit">${escapeHtml(displayName)}</a>
  </text>
  <text x="44" y="68" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="11" fill="${tokens.textMuted}">${stars.toLocaleString()} stars</text>

  <rect y="${CARD_HEIGHT - 1}" width="${CARD_WIDTH}" height="1" fill="${tokens.border}" rx="0"/>
</svg>`;
}

export function renderMostStarredRepoEmptySvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${tokens.bg}" rx="8"/>
  <rect x="0" y="0" width="2" height="${CARD_HEIGHT}" fill="${tokens.textMuted}" rx="0"/>

  ${ICON.star}

  <text x="44" y="32" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="10" fill="${tokens.textMuted}" letter-spacing="0.06em">MOST STARRED</text>
  <text x="44" y="52" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="14" fill="${tokens.textMuted}">No public repos found</text>

  <rect y="${CARD_HEIGHT - 1}" width="${CARD_WIDTH}" height="1" fill="${tokens.border}" rx="0"/>
</svg>`;
}
