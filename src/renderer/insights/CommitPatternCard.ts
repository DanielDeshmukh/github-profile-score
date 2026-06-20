import { tokens } from '../../theme/tokens.js';
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
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${tokens.bg}" rx="6" stroke="${tokens.border}" stroke-width="0.5"/>

  <text x="20" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="${tokens.textTertiary}">Commit pattern</text>

  <text x="20" y="46" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="16" font-weight="500" fill="${tokens.textPrimary}">${dayTypeLabel}: ${weekdayPct}% / ${weekendPct}%</text>

  <text x="20" y="68" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="16" font-weight="500" fill="${tokens.textPrimary}">Peak: ${dayPartLabel}</text>

  <text x="20" y="88" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="${tokens.textSecondary}">${totalCommits} commits sampled (last 90 days)</text>
</svg>`;
}
