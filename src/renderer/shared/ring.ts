import { tokens } from '../../theme/tokens.js';

export interface RingOptions {
  cx: number;
  cy: number;
  radius: number;
  progress: number;
  trackColor?: string;
  progressColor?: string;
  strokeWidth?: number;
  animated?: boolean;
}

export function createProgressRing(options: RingOptions): string {
  const {
    cx, cy, radius, progress,
    trackColor = tokens.border,
    progressColor = tokens.blue,
    strokeWidth = 5,
    animated = true,
  } = options;

  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const dashOffset = circumference * (1 - clampedProgress);

  return `
  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${trackColor}" stroke-width="${strokeWidth}"/>
  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${progressColor}" stroke-width="${strokeWidth}" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}" stroke-linecap="round" transform="rotate(-90, ${cx}, ${cy})" class="${animated ? 'ring-arc' : ''}" style="${animated ? `--dash-offset: ${dashOffset}` : `stroke-dashoffset: ${dashOffset}`}"/>`;
}

export interface GradeRingOptions {
  cx: number;
  cy: number;
  radius: number;
  score: number;
  maxScore: number;
  grade: string;
  color?: string;
  animated?: boolean;
}

export function createGradeRing(options: GradeRingOptions): string {
  const { cx, cy, radius, score, maxScore, grade, color = tokens.purple, animated = true } = options;
  const progress = maxScore > 0 ? score / maxScore : 0;

  const ring = createProgressRing({ cx, cy, radius, progress, progressColor: color, strokeWidth: 4, animated });

  return `${ring}
  <text x="${cx}" y="${cy - 3}" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="14" fill="${tokens.textPrimary}" text-anchor="middle" font-weight="700">${score}</text>
  <text x="${cx}" y="${cy + 11}" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="10" fill="${color}" text-anchor="middle">${grade}</text>`;
}
