import type { DayType, DayPart } from '../../scorer/insights/commitPattern.js';
import { renderFromTemplate } from '../shared/templateLoader.js';

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

  return renderFromTemplate('11-insight-commit-pattern', {
    day_type_label: dayTypeLabel,
    weekday_pct: String(weekdayPct),
    weekend_pct: String(weekendPct),
    day_part_label: dayPartLabel,
    total_commits: String(totalCommits),
  });
}
