import { tokens } from '../../theme/tokens.js';

const CARD_WIDTH = 320;
const CARD_HEIGHT = 80;

const ICON = {
  zap: `<svg x="16" y="28" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="${tokens.gold}" stroke="${tokens.gold}" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
};

export function renderCommitsPerTenureCard(
  average: number,
  totalCommits: number,
  tenureYears: number,
): string {
  const tenureText = tenureYears < 1
    ? `${Math.round(tenureYears * 12)} months`
    : `${tenureYears} year${tenureYears !== 1 ? 's' : ''}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <style>
    .card-bg { transition: background 0.15s ease; }
    .card-bg:hover { background: #1c2128; }
  </style>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${tokens.bg}" rx="8" class="card-bg"/>
  <rect x="0" y="0" width="2" height="${CARD_HEIGHT}" fill="${tokens.gold}" rx="0"/>

  ${ICON.zap}

  <text x="44" y="32" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="10" fill="${tokens.textMuted}" letter-spacing="0.06em">COMMITS PER YEAR OF TENURE</text>
  <text x="44" y="56" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="22" fill="${tokens.textPrimary}" font-weight="700">${average.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</text>
  <text x="44" y="72" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="11" fill="${tokens.textMuted}">${totalCommits.toLocaleString()} commits over ${tenureText}</text>

  <rect y="${CARD_HEIGHT - 1}" width="${CARD_WIDTH}" height="1" fill="${tokens.border}" rx="0"/>
</svg>`;
}
