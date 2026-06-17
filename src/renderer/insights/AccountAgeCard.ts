import { tokens } from '../../theme/tokens.js';

const CARD_WIDTH = 320;
const CARD_HEIGHT = 80;

const ICON = {
  calendar: `<svg x="16" y="28" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="2" stroke="${tokens.blue}" stroke-width="1.5"/><line x1="3" y1="10" x2="21" y2="10" stroke="${tokens.blue}" stroke-width="1.5"/><line x1="8" y1="2" x2="8" y2="6" stroke="${tokens.blue}" stroke-width="1.5" stroke-linecap="round"/><line x1="16" y1="2" x2="16" y2="6" stroke="${tokens.blue}" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

export function renderAccountAgeCard(years: number, months: number): string {
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
  const ageText = parts.length > 0 ? parts.join(', ') : '< 1 month';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <style>
    .card-bg { transition: background 0.15s ease; }
    .card-bg:hover { background: #1c2128; }
  </style>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${tokens.bg}" rx="8" class="card-bg"/>
  <rect x="0" y="0" width="2" height="${CARD_HEIGHT}" fill="${tokens.blue}" rx="0"/>

  ${ICON.calendar}

  <text x="44" y="32" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="10" fill="${tokens.textMuted}" letter-spacing="0.06em">ACCOUNT AGE</text>
  <text x="44" y="56" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="22" fill="${tokens.textPrimary}" font-weight="700">${ageText}</text>

  <rect y="${CARD_HEIGHT - 1}" width="${CARD_WIDTH}" height="1" fill="${tokens.border}" rx="0"/>
</svg>`;
}
