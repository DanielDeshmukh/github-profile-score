import { tokens } from '../../theme/tokens.js';
import { renderFromTemplate } from '../shared/templateLoader.js';

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

  return renderFromTemplate('08-insight-contribution-trend', {
    trend_symbol: symbol,
    trend_pct: pctText,
    trend_color: valueColor,
    trend_detail: `${thisYearTotal.toLocaleString()} this year, ${lastYearTotal.toLocaleString()} last year`,
  });
}
