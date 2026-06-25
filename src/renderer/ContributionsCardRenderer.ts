import type { ContributionStats } from '../types/stats.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { renderSparkline } from './shared/sparkline.js';
import { renderFromTemplate } from './shared/templateLoader.js';

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function renderContributionsCard(
  _username: string,
  contributions: ContributionStats,
): string {
  const dateRange = `${formatDate(contributions.rangeStart)} \u2013 ${formatDate(contributions.rangeEnd)}`;
  const weeklyCounts = contributions.weeklyCounts;

  const sparkline = renderSparkline({ x: 30, y: 145, totalWidth: 420, height: 20, segments: weeklyCounts.length, weeklyCounts });

  return renderFromTemplate('02-contributions-card', {
    total_contributions: contributions.totalContributions.toLocaleString(),
    date_range: escapeHtml(dateRange),
    current_streak_days: `${contributions.currentStreak} days`,
    longest_streak_days: `${contributions.longestStreak} days`,
    sparkline,
  });
}

export function renderContributionsErrorSvg(username: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="120" viewBox="0 0 480 120">
  <rect width="480" height="120" fill="#0d1117" rx="12"/>
  <rect width="480" height="2" fill="#f85149" rx="0"/>
  <text x="240" y="45" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" fill="#8b949e" text-anchor="middle">Contributions unavailable</text>
  <text x="240" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" fill="#e6edf3" text-anchor="middle">@${escapeHtml(username)}</text>
  <text x="240" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="#8b949e" text-anchor="middle">Check the username and try again</text>
  <rect y="118" width="480" height="2" fill="#f85149" rx="0"/>
</svg>`;
}
