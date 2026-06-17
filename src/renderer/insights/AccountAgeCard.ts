import { THEME } from '../../theme/tokens.js';

const CARD_WIDTH = 320;
const CARD_HEIGHT = 80;

export function renderAccountAgeCard(years: number, months: number): string {
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
  const ageText = parts.length > 0 ? parts.join(', ') : '< 1 month';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${THEME.cream}" rx="8"/>
  <rect width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
  <rect x="0" y="0" width="3" height="${CARD_HEIGHT}" fill="${THEME.gold}" rx="0"/>

  <text x="16" y="28" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="11" fill="${THEME.silver}">Account age</text>

  <text x="16" y="52" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="20" fill="${THEME.goldLight}" font-weight="600">${ageText}</text>

  <rect y="${CARD_HEIGHT - 2}" width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
</svg>`;
}
