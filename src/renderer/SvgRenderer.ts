import { tokens } from '../theme/tokens.js';
import type { ScoreResult } from '../types.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { renderInitialsAvatar } from './shared/avatar.js';
import { renderMetricTile } from './shared/tile.js';

function truncateUsername(username: string): string {
  if (username.length <= 20) return username;
  return username.slice(0, 19) + '\u2026';
}

function getScoreColor(score: number): string {
  if (score >= 70) return tokens.green;
  if (score >= 40) return tokens.textPrimary;
  return tokens.amber;
}

interface DimensionEntry {
  name: string;
  score: number;
  max: number;
}

function getTop4Dimensions(dims: ScoreResult['dimensions']): DimensionEntry[] {
  const entries: DimensionEntry[] = [
    { name: 'Activity', score: dims.activity.score, max: dims.activity.max },
    { name: 'Project quality', score: dims.quality.score, max: dims.quality.max },
    { name: 'Documentation', score: dims.documentation.score, max: dims.documentation.max },
    { name: 'Tech diversity', score: dims.diversity.score, max: dims.diversity.max },
    { name: 'Community', score: dims.community.score, max: dims.community.max },
  ];
  entries.sort((a, b) => b.score - a.score);
  return entries;
}

export function renderSvg(result: ScoreResult): string {
  const scoreDate = new Date(result.scored_at).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });

  const sorted = getTop4Dimensions(result.dimensions);
  const weakest = sorted[4]!;

  const top4 = sorted.slice(0, 4);
  const tilePositions = [
    { x: 30, y: 80 },
    { x: 250, y: 80 },
    { x: 30, y: 142 },
    { x: 250, y: 142 },
  ];

  const metricTiles = top4.map((dim, i) => {
    const pos = tilePositions[i]!;
    return renderMetricTile({
      x: pos.x,
      y: pos.y,
      width: 210,
      height: 52,
      label: dim.name,
      value: `${dim.score}/${dim.max}`,
    });
  }).join('\n  ');

  const weakestFill = weakest.score < 10 ? tokens.amber : tokens.textTertiary;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="200" viewBox="0 0 480 200">
  <rect width="480" height="200" fill="${tokens.bg}" rx="12"/>

  ${renderInitialsAvatar(result.username, 38, 38, 18)}
  <text x="66" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" font-weight="500" fill="${tokens.textPrimary}">@${escapeHtml(truncateUsername(result.username))}</text>
  <text x="66" y="50" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="${tokens.textTertiary}">Job readiness score</text>

  <text x="440" y="40" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="28" font-weight="500" fill="${getScoreColor(result.total)}" text-anchor="end">${result.total}</text>
  <text x="440" y="56" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="${tokens.textTertiary}" text-anchor="end">grade ${result.grade}</text>

  ${metricTiles}

  <text x="30" y="176" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="${weakestFill}">Lowest: ${escapeHtml(weakest.name)}, ${weakest.score}/20</text>
  <text x="450" y="176" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="${tokens.textTertiary}" text-anchor="end">Scored on ${scoreDate}</text>
</svg>`;
}

export function renderErrorSvg(username: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="120" viewBox="0 0 480 120">
  <rect width="480" height="120" fill="${tokens.bg}" rx="12"/>
  <rect width="480" height="2" fill="${tokens.red}" rx="0"/>
  <circle cx="240" cy="40" r="16" fill="none" stroke="${tokens.red}" stroke-width="2"/>
  <line x1="240" y1="32" x2="240" y2="42" stroke="${tokens.red}" stroke-width="2" stroke-linecap="round"/>
  <circle cx="240" cy="48" r="1.5" fill="${tokens.red}"/>
  <text x="240" y="76" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" fill="${tokens.textPrimary}" text-anchor="middle" font-weight="500">@${escapeHtml(username)} not found</text>
  <text x="240" y="96" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="${tokens.textSecondary}" text-anchor="middle">Check the username and retry</text>
  <rect y="118" width="480" height="2" fill="${tokens.red}" rx="0"/>
</svg>`;
}

export function renderRateLimitSvg(_username: string, resetAt: Date): string {
  const timeStr = resetAt.toISOString().substring(11, 16) + ' UTC';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="120" viewBox="0 0 480 120">
  <rect width="480" height="120" fill="${tokens.bg}" rx="12"/>
  <rect width="480" height="2" fill="${tokens.orange}" rx="0"/>
  <path d="M240 24 L252 48 L228 48 Z" fill="none" stroke="${tokens.orange}" stroke-width="2" stroke-linejoin="round"/>
  <line x1="240" y1="32" x2="240" y2="40" stroke="${tokens.orange}" stroke-width="2" stroke-linecap="round"/>
  <circle cx="240" cy="44" r="1.5" fill="${tokens.orange}"/>
  <text x="240" y="76" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" fill="${tokens.textPrimary}" text-anchor="middle" font-weight="500">Rate limit reached</text>
  <text x="240" y="96" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="${tokens.textSecondary}" text-anchor="middle">Try again after ${timeStr}</text>
  <rect y="118" width="480" height="2" fill="${tokens.orange}" rx="0"/>
</svg>`;
}
