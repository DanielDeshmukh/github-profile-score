import { tokens } from '../theme/tokens.js';
import type { ScoreResult } from '../types.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { renderInitialsAvatar } from './shared/avatar.js';
import { renderMetricTile } from './shared/tile.js';
import { renderFromTemplate } from './shared/templateLoader.js';

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
  });

  const weakestFill = weakest.score < 10 ? tokens.amber : tokens.textTertiary;

  return renderFromTemplate('01-score-badge', {
    initials_avatar: renderInitialsAvatar(result.username, 38, 38, 18),
    username: escapeHtml(truncateUsername(result.username)),
    score: String(result.total),
    score_color: getScoreColor(result.total),
    grade: result.grade,
    tile_1: metricTiles[0]!,
    tile_2: metricTiles[1]!,
    tile_3: metricTiles[2]!,
    tile_4: metricTiles[3]!,
    weakest_name: escapeHtml(weakest.name),
    weakest_score: String(weakest.score),
    weakest_fill: weakestFill,
    score_date: scoreDate,
  });
}

export function renderErrorSvg(username: string): string {
  return renderFromTemplate('14-error-user-not-found', {
    username: escapeHtml(username),
  });
}

export function renderRateLimitSvg(_username: string, resetAt: Date): string {
  const timeStr = resetAt.toISOString().substring(11, 16) + ' UTC';
  return renderFromTemplate('13-error-rate-limit', {
    reset_time: timeStr,
  });
}
