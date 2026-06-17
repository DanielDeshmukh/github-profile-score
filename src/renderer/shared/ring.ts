import { THEME } from '../../theme/tokens.js';

export interface RingOptions {
  cx: number;
  cy: number;
  radius: number;
  progress: number;
  trackColor?: string;
  progressColor?: string;
  strokeWidth?: number;
}

/**
 * Generate SVG elements for a circular progress ring.
 *
 * This extracts the arc-drawing math used by both the score badge
 * renderer and the new stats cards to avoid duplication and ensure
 * consistent grade circles across all renderers.
 */
export function createProgressRing(options: RingOptions): string {
  const {
    cx,
    cy,
    radius,
    progress,
    trackColor = THEME.slate,
    progressColor = THEME.gold,
    strokeWidth = 5,
  } = options;

  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const dashOffset = circumference * (1 - clampedProgress);

  return `
  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${trackColor}" stroke-width="${strokeWidth}"/>
  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${progressColor}" stroke-width="${strokeWidth}" stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}" stroke-linecap="round" transform="rotate(-90, ${cx}, ${cy})"/>`;
}

export interface GradeRingOptions {
  cx: number;
  cy: number;
  radius: number;
  score: number;
  maxScore: number;
  grade: string;
}

/**
 * Generate SVG elements for a grade ring with score number and letter.
 * Used by both the original score badge and the new GitHub stats card.
 */
export function createGradeRing(options: GradeRingOptions): string {
  const { cx, cy, radius, score, maxScore, grade } = options;
  const progress = maxScore > 0 ? score / maxScore : 0;

  const ring = createProgressRing({
    cx,
    cy,
    radius,
    progress,
    strokeWidth: 4,
  });

  return `${ring}
  <text x="${cx}" y="${cy - 3}" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="14" fill="${THEME.goldLight}" text-anchor="middle" font-weight="700">${score}</text>
  <text x="${cx}" y="${cy + 11}" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="10" fill="${THEME.gold}" text-anchor="middle">${grade}</text>`;
}
