import { tokens } from '../../theme/tokens.js';

const CARD_WIDTH = 320;
const CARD_HEIGHT = 80;

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
  const valueColor = direction === 'up' ? tokens.green : direction === 'down' ? tokens.red : tokens.textSecondary;
  const pctText = formatPercentage(yoyPercentage);
  const symbol = direction === 'up' ? '\u2191' : direction === 'down' ? '\u2193' : '\u2192';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${tokens.bg}" rx="6" stroke="${tokens.border}" stroke-width="0.5"/>

  <text x="20" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="${tokens.textTertiary}">Contribution trend</text>
  <text x="20" y="50" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="16" font-weight="500" fill="${valueColor}">${symbol} ${pctText}</text>
  <text x="20" y="68" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="${tokens.textSecondary}">${thisYearTotal.toLocaleString()} this year, ${lastYearTotal.toLocaleString()} last year</text>
</svg>`;
}
