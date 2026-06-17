import { tokens } from '../../theme/tokens.js';
import type { DayType, DayPart } from '../../scorer/insights/commitPattern.js';

const CARD_WIDTH = 320;
const CARD_HEIGHT = 100;

const ICON = {
  activity: `<svg x="16" y="20" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="${tokens.blue}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

function formatDayType(type: DayType): string {
  return type === 'weekday' ? 'Weekdays' : 'Weekends';
}

function formatDayPart(part: DayPart): string {
  switch (part) {
    case 'morning': return 'Mornings';
    case 'afternoon': return 'Afternoons';
    case 'evening': return 'Evenings';
    case 'night': return 'Late nights';
  }
}

export function renderCommitPatternCard(
  dominantDayType: DayType,
  dominantDayPart: DayPart,
  weekdayCount: number,
  _weekendCount: number,
  totalCommits: number,
): string {
  const dayTypeLabel = formatDayType(dominantDayType);
  const dayPartLabel = formatDayPart(dominantDayPart);

  const weekdayPct = totalCommits > 0 ? Math.round((weekdayCount / totalCommits) * 100) : 0;
  const weekendPct = totalCommits > 0 ? 100 - weekdayPct : 0;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <style>
    .card-bg { transition: background 0.15s ease; }
    .card-bg:hover { background: #1c2128; }
  </style>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${tokens.bg}" rx="8" class="card-bg"/>
  <rect x="0" y="0" width="2" height="${CARD_HEIGHT}" fill="${tokens.blue}" rx="0"/>

  ${ICON.activity}

  <text x="44" y="28" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="10" fill="${tokens.textMuted}" letter-spacing="0.06em">COMMIT PATTERN</text>

  <text x="44" y="48" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="14" fill="${tokens.textPrimary}" font-weight="600">${dayTypeLabel}: ${weekdayPct}% / ${weekendPct}%</text>

  <text x="44" y="68" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="14" fill="${tokens.textPrimary}" font-weight="600">Peak: ${dayPartLabel}</text>

  <text x="44" y="88" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="11" fill="${tokens.textMuted}">${totalCommits} commits sampled (last 90 days)</text>

  <rect y="${CARD_HEIGHT - 1}" width="${CARD_WIDTH}" height="1" fill="${tokens.border}" rx="0"/>
</svg>`;
}
