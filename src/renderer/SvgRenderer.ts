import type { ScoreResult } from '../types.js';

const GRADE_COLORS: Record<ScoreResult['grade'], string> = {
  A: '#3fb950',
  B: '#58a6ff',
  C: '#d29922',
  D: '#f85149',
  F: '#f85149',
};

function getBarColor(percentage: number): string {
  if (percentage <= 40) return '#f85149';
  if (percentage <= 60) return '#d29922';
  if (percentage <= 80) return '#58a6ff';
  return '#3fb950';
}

function createDimensionBar(label: string, score: number, max: number, yOffset: number): string {
  const pct = Math.round((score / max) * 100);
  const barWidth = Math.round((score / max) * 280);
  const barColor = getBarColor(pct);

  return `
  <text x="24" y="${yOffset}" font-family="'Segoe UI', system-ui, sans-serif" font-size="12" fill="#e6edf3" font-weight="500">${label}</text>
  <text x="456" y="${yOffset}" font-family="'Segoe UI', system-ui, sans-serif" font-size="12" fill="#8b949e" text-anchor="end">${score}/${max}</text>
  <rect x="24" y="${yOffset + 6}" width="432" height="6" rx="3" fill="#21262d"/>
  <rect x="24" y="${yOffset + 6}" width="${barWidth}" height="6" rx="3" fill="${barColor}"/>`;
}

export function renderSvg(result: ScoreResult): string {
  const gradeColor = GRADE_COLORS[result.grade];
  const scoreDate = new Date(result.scored_at).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="480" height="280" viewBox="0 0 480 280">
  <defs>
    <clipPath id="avatar-clip">
      <circle cx="44" cy="40" r="18"/>
    </clipPath>
  </defs>

  <rect width="480" height="280" rx="12" fill="#0d1117"/>
  <rect x="1" y="1" width="478" height="278" rx="11" fill="none" stroke="#30363d" stroke-width="1"/>

  <image xlink:href="https://github.com/${result.username}.png?size=36" x="26" y="22" width="36" height="36" clip-path="url(#avatar-clip)"/>
  <text x="72" y="36" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" fill="#e6edf3" font-weight="600">@${result.username}</text>
  <text x="72" y="52" font-family="'Segoe UI', system-ui, sans-serif" font-size="11" fill="#8b949e">GitHub Profile Score</text>

  <circle cx="428" cy="40" r="32" fill="none" stroke="${gradeColor}" stroke-width="3"/>
  <text x="428" y="36" font-family="'Segoe UI', system-ui, sans-serif" font-size="20" fill="${gradeColor}" text-anchor="middle" font-weight="bold">${result.total}</text>
  <text x="428" y="54" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" fill="${gradeColor}" text-anchor="middle" font-weight="600">${result.grade}</text>

  <line x1="24" y1="72" x2="456" y2="72" stroke="#30363d" stroke-width="1"/>

  ${createDimensionBar('Activity', result.dimensions.activity.score, result.dimensions.activity.max, 92)}
  ${createDimensionBar('Project Quality', result.dimensions.quality.score, result.dimensions.quality.max, 122)}
  ${createDimensionBar('Documentation', result.dimensions.documentation.score, result.dimensions.documentation.max, 152)}
  ${createDimensionBar('Tech Diversity', result.dimensions.diversity.score, result.dimensions.diversity.max, 182)}
  ${createDimensionBar('Community', result.dimensions.community.score, result.dimensions.community.max, 212)}

  <line x1="24" y1="240" x2="456" y2="240" stroke="#30363d" stroke-width="1"/>

  <text x="24" y="260" font-family="'Segoe UI', system-ui, sans-serif" font-size="10" fill="#8b949e">Scored on ${scoreDate}</text>
</svg>`;
}

export function renderErrorSvg(username: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="120" viewBox="0 0 480 120">
  <rect width="480" height="120" rx="12" fill="#0d1117"/>
  <rect x="1" y="1" width="478" height="118" rx="11" fill="none" stroke="#30363d" stroke-width="1"/>
  <text x="240" y="45" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" fill="#f85149" text-anchor="middle">User Not Found</text>
  <text x="240" y="70" font-family="'Segoe UI', system-ui, sans-serif" font-size="12" fill="#8b949e" text-anchor="middle">@${username}</text>
  <text x="240" y="95" font-family="'Segoe UI', system-ui, sans-serif" font-size="10" fill="#8b949e" text-anchor="middle">Check the username and try again</text>
</svg>`;
}

export function renderRateLimitSvg(username: string, resetAt: Date): string {
  const timeStr = resetAt.toISOString().substring(11, 16) + ' UTC';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="120" viewBox="0 0 480 120">
  <rect width="480" height="120" rx="12" fill="#0d1117"/>
  <rect x="1" y="1" width="478" height="118" rx="11" fill="none" stroke="#30363d" stroke-width="1"/>
  <text x="240" y="45" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" fill="#d29922" text-anchor="middle">Rate limited — retry after ${timeStr}</text>
  <text x="240" y="70" font-family="'Segoe UI', system-ui, sans-serif" font-size="12" fill="#8b949e" text-anchor="middle">@${username}</text>
  <text x="240" y="95" font-family="'Segoe UI', system-ui, sans-serif" font-size="10" fill="#8b949e" text-anchor="middle">GitHub API rate limit exceeded</text>
</svg>`;
}
