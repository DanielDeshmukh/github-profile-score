import { tokens } from '../../theme/tokens.js';

const CARD_WIDTH = 320;
const CARD_HEIGHT = 80;

const ICON = {
  trendingUp: `<svg x="16" y="28" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="${tokens.green}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="17 6 23 6 23 12" stroke="${tokens.green}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  trendingDown: `<svg x="16" y="28" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" stroke="${tokens.red}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="17 18 23 18 23 12" stroke="${tokens.red}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  minus: `<svg x="16" y="28" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="5" y1="12" x2="19" y2="12" stroke="${tokens.textMuted}" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

function formatPercentage(pct: number): string {
  const abs = Math.abs(pct);
  if (!Number.isFinite(abs)) return '100%';
  if (abs === 0) return '0%';
  return `${abs.toFixed(1)}%`;
}

export function renderContributionTrendCard(
  thisYearTotal: number,
  lastYearTotal: number,
  yoyPercentage: number,
  direction: 'up' | 'down' | 'flat',
): string {
  const iconColor = direction === 'up' ? tokens.green : direction === 'down' ? tokens.red : tokens.textMuted;
  const label = direction === 'up' ? 'Trending up' : direction === 'down' ? 'Trending down' : 'Steady';
  const pctText = formatPercentage(yoyPercentage);
  const symbol = direction === 'up' ? '\u2191' : direction === 'down' ? '\u2193' : '\u2192';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <style>
    .card-bg { transition: background 0.15s ease; }
    .card-bg:hover { background: #1c2128; }
  </style>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${tokens.bg}" rx="8" class="card-bg"/>
  <rect x="0" y="0" width="2" height="${CARD_HEIGHT}" fill="${iconColor}" rx="0"/>

  ${direction === 'up' ? ICON.trendingUp : direction === 'down' ? ICON.trendingDown : ICON.minus}

  <text x="44" y="32" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="10" fill="${tokens.textMuted}" letter-spacing="0.06em">CONTRIBUTION TREND</text>
  <text x="44" y="56" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="22" fill="${iconColor}" font-weight="700">${symbol} ${pctText}</text>
  <text x="44" y="72" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="11" fill="${tokens.textMuted}">${label}: ${thisYearTotal.toLocaleString()} vs ${lastYearTotal.toLocaleString()} last year</text>

  <rect y="${CARD_HEIGHT - 1}" width="${CARD_WIDTH}" height="1" fill="${tokens.border}" rx="0"/>
</svg>`;
}
