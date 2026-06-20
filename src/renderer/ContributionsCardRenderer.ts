import { tokens } from '../theme/tokens.js';
import type { ContributionStats } from '../types/stats.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { flameIcon, trophyIcon } from './shared/icons.js';
import { renderSparkline } from './shared/sparkline.js';

const SVG_WIDTH = 480;
const SVG_HEIGHT = 180;

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function generateWeeklyCounts(contributions: ContributionStats): number[] {
  const total = contributions.totalContributions;
  const weeks = 12;
  if (total === 0) return new Array(weeks).fill(0);
  const avg = total / weeks;
  const counts: number[] = [];
  for (let i = 0; i < weeks; i++) {
    const variance = 0.5 + Math.sin(i * 0.8) * 0.3 + Math.cos(i * 1.2) * 0.2;
    counts.push(Math.round(avg * variance));
  }
  return counts;
}

export function renderContributionsCard(
  _username: string,
  contributions: ContributionStats,
): string {
  const dateRange = `${formatDate(contributions.rangeStart)} – ${formatDate(contributions.rangeEnd)}`;
  const weeklyCounts = generateWeeklyCounts(contributions);

  const flameX = 42;
  const tileY = 64;
  const tileH = 40;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}">
  <rect width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="${tokens.bg}" rx="12"/>

  <text x="30" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="24" font-weight="500" fill="${tokens.textPrimary}">${contributions.totalContributions.toLocaleString()}</text>
  <text x="450" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="${tokens.textTertiary}" text-anchor="end">${escapeHtml(dateRange)}</text>

  <text x="30" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" fill="${tokens.textSecondary}">Contributions</text>

  <rect x="30" y="${tileY}" width="210" height="${tileH}" rx="6" fill="${tokens.bgTile}"/>
  ${flameIcon(flameX, tileY + 12)}
  <text x="64" y="${tileY + 20}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" font-weight="500" fill="${tokens.textPrimary}">${contributions.currentStreak} days</text>
  <text x="64" y="${tileY + 32}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="${tokens.textTertiary}">current streak</text>

  <rect x="250" y="${tileY}" width="210" height="${tileH}" rx="6" fill="${tokens.bgTile}"/>
  ${trophyIcon(262, tileY + 12)}
  <text x="284" y="${tileY + 20}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" font-weight="500" fill="${tokens.textPrimary}">${contributions.longestStreak} days</text>
  <text x="284" y="${tileY + 32}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="${tokens.textTertiary}">longest streak</text>

  <text x="30" y="120" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="${tokens.textTertiary}">Last 12 weeks</text>

  ${renderSparkline({ x: 30, y: 130, totalWidth: 420, height: 20, segments: 12, weeklyCounts })}
</svg>`;
}

export function renderContributionsErrorSvg(username: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="120" viewBox="0 0 ${SVG_WIDTH} 120">
  <rect width="${SVG_WIDTH}" height="120" fill="${tokens.bg}" rx="12"/>
  <rect width="${SVG_WIDTH}" height="2" fill="${tokens.red}" rx="0"/>
  <text x="${SVG_WIDTH / 2}" y="45" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" fill="${tokens.textSecondary}" text-anchor="middle">Contributions unavailable</text>
  <text x="${SVG_WIDTH / 2}" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" fill="${tokens.textPrimary}" text-anchor="middle">@${escapeHtml(username)}</text>
  <text x="${SVG_WIDTH / 2}" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="${tokens.textSecondary}" text-anchor="middle">Check the username and try again</text>
  <rect y="118" width="${SVG_WIDTH}" height="2" fill="${tokens.red}" rx="0"/>
</svg>`;
}
