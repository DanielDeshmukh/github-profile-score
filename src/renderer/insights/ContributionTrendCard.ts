import { THEME } from '../../theme/tokens.js';

const CARD_WIDTH = 320;
const CARD_HEIGHT = 80;

function formatDirection(direction: 'up' | 'down' | 'flat'): { symbol: string; label: string } {
  switch (direction) {
    case 'up': return { symbol: '\u2191', label: 'Trending up' };
    case 'down': return { symbol: '\u2193', label: 'Trending down' };
    case 'flat': return { symbol: '\u2192', label: 'Steady' };
  }
}

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
  const { symbol, label } = formatDirection(direction);
  const pctText = formatPercentage(yoyPercentage);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${THEME.cream}" rx="8"/>
  <rect width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
  <rect x="0" y="0" width="3" height="${CARD_HEIGHT}" fill="${THEME.gold}" rx="0"/>

  <text x="16" y="28" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="11" fill="${THEME.silver}">Contribution trend</text>

  <text x="16" y="52" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="20" fill="${THEME.goldLight}" font-weight="600">${symbol} ${pctText}</text>

  <text x="16" y="68" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="12" fill="${THEME.silver}">${label}: ${thisYearTotal.toLocaleString()} vs ${lastYearTotal.toLocaleString()} last year</text>

  <rect y="${CARD_HEIGHT - 2}" width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
</svg>`;
}
