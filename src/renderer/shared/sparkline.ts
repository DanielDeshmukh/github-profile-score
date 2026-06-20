import { tokens } from '../../theme/tokens.js';

function computeOpacityTier(count: number, maxCount: number): number {
  if (maxCount === 0 || count === 0) return 0;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 0.35;
  if (ratio <= 0.5) return 0.6;
  if (ratio <= 0.75) return 0.8;
  return 1.0;
}

function getWeekLabel(index: number): string {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() - (11 - index) * 7);
  const weekStart = new Date(weekEnd);
  weekStart.setDate(weekEnd.getDate() - 6);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startMonth = months[weekStart.getMonth()]!;
  const endMonth = months[weekEnd.getMonth()]!;
  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}\u2013${endDay}`;
  }
  return `${startMonth} ${startDay}\u2013${endMonth} ${endDay}`;
}

export interface SparklineOptions {
  x: number;
  y: number;
  totalWidth: number;
  height: number;
  segments: number;
  weeklyCounts: number[];
}

export function renderSparkline(options: SparklineOptions): string {
  const { x, y, totalWidth, height, segments, weeklyCounts } = options;
  const gap = 3;
  const segWidth = (totalWidth - gap * (segments - 1)) / segments;
  const maxCount = Math.max(...weeklyCounts, 1);

  const bars: string[] = [];
  for (let i = 0; i < segments; i++) {
    const count = weeklyCounts[i] ?? 0;
    const opacity = computeOpacityTier(count, maxCount);
    const fill = opacity === 0 ? tokens.bgTile : tokens.green;
    const fillOpacity = opacity === 0 ? '1' : String(opacity);
    const segX = x + i * (segWidth + gap);
    const centerX = segX + segWidth / 2;
    const weekLabel = getWeekLabel(i);

    bars.push(`  <g class="day-bar">
    <rect class="bar" x="${segX}" y="${y}" width="${segWidth}" height="${height}" rx="2" fill="${fill}" fill-opacity="${fillOpacity}"/>
    <g class="tooltip" transform="translate(${centerX},0)">
      <rect x="-35" y="${y - 40}" width="70" height="36" rx="4" fill="#21262d" stroke="#30363d"/>
      <polygon points="-5,${y - 4} 5,${y - 4} 0,${y + 1}" fill="#21262d"/>
      <text x="0" y="${y - 25}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="9" font-weight="600" fill="#e6edf3" text-anchor="middle">${weekLabel}</text>
      <text x="0" y="${y - 12}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="9" fill="#8b949e" text-anchor="middle">${count} contributions</text>
    </g>
  </g>`);
  }

  return bars.join('\n');
}
