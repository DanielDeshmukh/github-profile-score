import { tokens } from '../../theme/tokens.js';

const CARD_WIDTH = 320;
const CARD_HEIGHT = 80;

const ICON = {
  barChart: `<svg x="16" y="28" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="20" x2="12" y2="10" stroke="${tokens.blue}" stroke-width="1.5" stroke-linecap="round"/><line x1="18" y1="20" x2="18" y2="4" stroke="${tokens.blue}" stroke-width="1.5" stroke-linecap="round"/><line x1="6" y1="20" x2="6" y2="16" stroke="${tokens.blue}" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

export function renderAvgCommitsPerRepoCard(
  average: number,
  activeRepos: number,
  totalCommits: number,
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <style>
    .card-bg { transition: background 0.15s ease; }
    .card-bg:hover { background: #1c2128; }
  </style>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${tokens.bg}" rx="8" class="card-bg"/>
  <rect x="0" y="0" width="2" height="${CARD_HEIGHT}" fill="${tokens.blue}" rx="0"/>

  ${ICON.barChart}

  <text x="44" y="32" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="10" fill="${tokens.textMuted}" letter-spacing="0.06em">AVG COMMITS PER REPO</text>
  <text x="44" y="56" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="22" fill="${tokens.textPrimary}" font-weight="700">${average.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</text>
  <text x="44" y="72" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="11" fill="${tokens.textMuted}">${totalCommits.toLocaleString()} commits across ${activeRepos} repo${activeRepos !== 1 ? 's' : ''}</text>

  <rect y="${CARD_HEIGHT - 1}" width="${CARD_WIDTH}" height="1" fill="${tokens.border}" rx="0"/>
</svg>`;
}
