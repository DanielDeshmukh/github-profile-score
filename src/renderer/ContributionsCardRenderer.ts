import { THEME, THEME_DERIVED } from '../theme/tokens.js';
import type { ContributionStats } from '../types/stats.js';
import { escapeHtml } from '../utils/escapeHtml.js';

const SVG_WIDTH = 480;
const SVG_HEIGHT = 200;
const CARD_PADDING = 24;
const COLUMN_WIDTH = (SVG_WIDTH - CARD_PADDING * 2) / 3;

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function createStatColumn(
  label: string,
  value: number | string,
  sublabel: string,
  xOffset: number,
): string {
  return `
  <text x="${xOffset + COLUMN_WIDTH / 2}" y="55" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="11" fill="${THEME.silver}" text-anchor="middle">${escapeHtml(label)}</text>
  <text x="${xOffset + COLUMN_WIDTH / 2}" y="95" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="32" fill="${THEME.goldLight}" text-anchor="middle" font-weight="700">${value}</text>
  <text x="${xOffset + COLUMN_WIDTH / 2}" y="115" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="10" fill="${THEME.silver}" text-anchor="middle">${sublabel}</text>`;
}

function createStreakRing(
  current: number,
  longest: number,
  cx: number,
  cy: number,
  radius: number,
): string {
  const circumference = 2 * Math.PI * radius;
  const progress = longest > 0 ? Math.min(current / longest, 1) : 0;
  const dashOffset = circumference * (1 - progress);

  return `
  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${THEME.slate}" stroke-width="5"/>
  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${THEME.gold}" stroke-width="5" stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}" stroke-linecap="round" transform="rotate(-90, ${cx}, ${cy})"/>
  <text x="${cx}" y="${cy - 4}" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="22" fill="${THEME.goldLight}" text-anchor="middle" font-weight="700">${current}</text>
  <text x="${cx}" y="${cy + 14}" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="9" fill="${THEME.silver}" text-anchor="middle">day streak</text>`;
}

/**
 * Render the contributions/streak SVG card.
 *
 * Layout: 3-column card
 * - Column 1: Total Contributions + date range
 * - Column 2: Current Streak as circular flame ring + date range
 * - Column 3: Longest Streak + date range
 *
 * Streak ring progress formula: current / longest (capped at 1.0).
 * This shows how far the current streak has progressed relative to
 * the user's personal best. If longest is 0 (no contributions),
 * the ring is empty. This is a design choice, not a GitHub metric —
 * documented here for clarity.
 */
export function renderContributionsCard(
  _username: string,
  contributions: ContributionStats,
): string {
  const totalCol = CARD_PADDING;
  const streakCol = CARD_PADDING + COLUMN_WIDTH;
  const longestCol = CARD_PADDING + COLUMN_WIDTH * 2;

  const currentRangeStr =
    contributions.currentStreak > 0
      ? `${formatDate(contributions.currentStreakRange.start)} - ${formatDate(contributions.currentStreakRange.end)}`
      : 'No active streak';

  const longestRangeStr =
    contributions.longestStreak > 0
      ? `${formatDate(contributions.longestStreakRange.start)} - ${formatDate(contributions.longestStreakRange.end)}`
      : 'N/A';

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}">
  <rect width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="${THEME.cream}" rx="12"/>
  <rect width="${SVG_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>

  <text x="${SVG_WIDTH / 2}" y="28" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="12" fill="${THEME.silver}" text-anchor="middle">CONTRIBUTIONS</text>

  <line x1="${streakCol}" y1="40" x2="${streakCol}" y2="${SVG_HEIGHT - 20}" stroke="${THEME.slate}" stroke-width="0.5"/>
  <line x1="${longestCol}" y1="40" x2="${longestCol}" y2="${SVG_HEIGHT - 20}" stroke="${THEME.slate}" stroke-width="0.5"/>

  ${createStatColumn('Total Contributions', contributions.totalContributions, `${formatDate(contributions.rangeStart)} - ${formatDate(contributions.rangeEnd)}`, totalCol)}

  ${createStreakRing(contributions.currentStreak, contributions.longestStreak, streakCol + COLUMN_WIDTH / 2, 85, 28)}
  <text x="${streakCol + COLUMN_WIDTH / 2}" y="130" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="9" fill="${THEME.silver}" text-anchor="middle">${escapeHtml(currentRangeStr)}</text>

  ${createStatColumn('Longest Streak', contributions.longestStreak, longestRangeStr, longestCol)}

  <rect y="${SVG_HEIGHT - 2}" width="${SVG_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
</svg>`;
}

export function renderContributionsErrorSvg(username: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="120" viewBox="0 0 ${SVG_WIDTH} 120">
  <rect width="${SVG_WIDTH}" height="120" fill="${THEME.cream}" rx="12"/>
  <rect width="${SVG_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
  <text x="${SVG_WIDTH / 2}" y="45" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="14" fill="${THEME.silver}" text-anchor="middle">Contributions Unavailable</text>
  <text x="${SVG_WIDTH / 2}" y="70" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="12" fill="${THEME.goldLight}" text-anchor="middle">@${escapeHtml(username)}</text>
  <text x="${SVG_WIDTH / 2}" y="95" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="10" fill="${THEME_DERIVED.textMuted}" text-anchor="middle">Check the username and try again</text>
  <rect y="118" width="${SVG_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
</svg>`;
}
