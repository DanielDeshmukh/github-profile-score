import { tokens } from '../../theme/tokens.js';

const CARD_WIDTH = 320;
const CARD_HEIGHT = 80;

export function renderCommitsPerTenureCard(
  average: number,
  totalCommits: number,
  tenureYears: number,
): string {
  const tenureText = tenureYears < 1
    ? `${Math.round(tenureYears * 12)} months`
    : `${tenureYears} year${tenureYears !== 1 ? 's' : ''}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${tokens.bg}" rx="6" stroke="${tokens.border}" stroke-width="0.5"/>

  <text x="20" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="${tokens.textTertiary}">Commits per year of tenure</text>
  <text x="20" y="50" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="16" font-weight="500" fill="${tokens.textPrimary}">${average.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</text>
  <text x="20" y="68" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="${tokens.textSecondary}">${totalCommits.toLocaleString()} commits over ${tenureText}</text>
</svg>`;
}
