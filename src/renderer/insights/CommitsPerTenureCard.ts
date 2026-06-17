import { THEME } from '../../theme/tokens.js';

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
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${THEME.cream}" rx="8"/>
  <rect width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
  <rect x="0" y="0" width="3" height="${CARD_HEIGHT}" fill="${THEME.gold}" rx="0"/>

  <text x="16" y="28" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="11" fill="${THEME.silver}">Avg commits per year of tenure</text>

  <text x="16" y="52" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="20" fill="${THEME.goldLight}" font-weight="600">${average.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</text>

  <text x="16" y="68" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="12" fill="${THEME.silver}">${totalCommits.toLocaleString()} commits over ${tenureText}</text>

  <rect y="${CARD_HEIGHT - 2}" width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
</svg>`;
}
