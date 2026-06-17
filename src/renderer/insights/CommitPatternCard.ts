import { THEME } from '../../theme/tokens.js';
import type { DayType, DayPart } from '../../scorer/insights/commitPattern.js';

const CARD_WIDTH = 320;
const CARD_HEIGHT = 100;

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
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${THEME.cream}" rx="8"/>
  <rect width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
  <rect x="0" y="0" width="3" height="${CARD_HEIGHT}" fill="${THEME.gold}" rx="0"/>

  <text x="16" y="24" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="11" fill="${THEME.silver}">Commit pattern (approximate)</text>

  <text x="16" y="44" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="14" fill="${THEME.goldLight}" font-weight="600">${dayTypeLabel}: ${weekdayPct}% / ${weekendPct}%</text>

  <text x="16" y="64" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="14" fill="${THEME.goldLight}" font-weight="600">Peak: ${dayPartLabel}</text>

  <text x="16" y="82" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="11" fill="${THEME.silver}">${totalCommits} commits sampled (last 90 days)</text>

  <rect y="${CARD_HEIGHT - 2}" width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
</svg>`;
}
