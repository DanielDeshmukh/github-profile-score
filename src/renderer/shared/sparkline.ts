import { tokens } from '../../theme/tokens.js';

function computeOpacityTier(count: number, maxCount: number): number {
  if (maxCount === 0 || count === 0) return 0;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 0.35;
  if (ratio <= 0.5) return 0.6;
  if (ratio <= 0.75) return 0.8;
  return 1.0;
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

  const rects: string[] = [];
  for (let i = 0; i < segments; i++) {
    const count = weeklyCounts[i] ?? 0;
    const opacity = computeOpacityTier(count, maxCount);
    const fill = opacity === 0 ? tokens.bgTile : tokens.green;
    const fillOpacity = opacity === 0 ? '1' : String(opacity);
    const segX = x + i * (segWidth + gap);
    rects.push(`<rect x="${segX}" y="${y}" width="${segWidth}" height="${height}" rx="2" fill="${fill}" fill-opacity="${fillOpacity}"/>`);
  }

  return rects.join('\n  ');
}
