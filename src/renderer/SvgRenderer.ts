import type { ScoreResult } from '../types.js';

const GRADE_RING_COLORS: Record<ScoreResult['grade'], string> = {
  A: '#c9a962',
  B: '#a89050',
  C: '#7d8a96',
  D: '#4a3f3f',
  F: '#4a3f3f',
};

function getBarColor(percentage: number): string {
  if (percentage >= 80) return '#c9a962';
  if (percentage >= 60) return '#a89050';
  if (percentage >= 40) return '#7d8a96';
  return '#3d2e2e';
}

function createDimensionBar(label: string, score: number, max: number, yOffset: number): string {
  const pct = Math.round((score / max) * 100);
  const barWidth = Math.round((score / max) * 408);
  const barColor = getBarColor(pct);

  return `
  <text x="24" y="${yOffset}" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="11" fill="#7d8a96">${label}</text>
  <text x="456" y="${yOffset}" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="11" fill="#e8d5a3" text-anchor="end">${score}/${max}</text>
  <rect x="24" y="${yOffset + 6}" width="408" height="4" rx="2" fill="#1e2229"/>
  <rect x="24" y="${yOffset + 6}" width="${barWidth}" height="4" rx="2" fill="${barColor}"/>`;
}

export function renderSvg(result: ScoreResult): string {
  const gradeColor = GRADE_RING_COLORS[result.grade] || '#c9a962';
  const scoreDate = new Date(result.scored_at).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });

  const circumference = 2 * Math.PI * 30;
  const dashOffset = circumference * (1 - result.total / 100);

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="480" height="260" viewBox="0 0 480 260">
  <defs>
    <clipPath id="avatar-clip">
      <circle cx="50" cy="44" r="22"/>
    </clipPath>
  </defs>

  <rect width="480" height="260" fill="#111315" rx="12"/>
  <rect width="480" height="2" fill="#c9a962" rx="0"/>

  <rect x="28" y="22" width="44" height="44" rx="22" fill="#1e2229" stroke="#c9a962" stroke-width="1"/>
  <image xlink:href="https://github.com/${result.username}.png?size=48" x="28" y="22" width="44" height="44" clip-path="url(#avatar-clip)"/>
  <text x="64" y="34" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="15" fill="#e8d5a3" font-weight="600">@${result.username}</text>
  <text x="64" y="50" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="11" fill="#7d8a96">GitHub Profile Score</text>

  <circle cx="432" cy="44" r="30" fill="none" stroke="#2d3748" stroke-width="1.5"/>
  <circle cx="432" cy="44" r="30" fill="none" stroke="#1e2229" stroke-width="6"/>
  <circle cx="432" cy="44" r="30" fill="none" stroke="${gradeColor}" stroke-width="6" stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}" stroke-linecap="round" transform="rotate(-90, 432, 44)"/>
  <text x="432" y="40" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="18" fill="#e8d5a3" text-anchor="middle" font-weight="700">${result.total}</text>
  <text x="432" y="56" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="11" fill="#c9a962" text-anchor="middle">${result.grade}</text>

  <line x1="24" y1="76" x2="456" y2="76" stroke="#2d3748" stroke-width="0.5"/>

  ${createDimensionBar('Activity', result.dimensions.activity.score, result.dimensions.activity.max, 96)}
  ${createDimensionBar('Project Quality', result.dimensions.quality.score, result.dimensions.quality.max, 118)}
  ${createDimensionBar('Documentation', result.dimensions.documentation.score, result.dimensions.documentation.max, 140)}
  ${createDimensionBar('Tech Diversity', result.dimensions.diversity.score, result.dimensions.diversity.max, 162)}
  ${createDimensionBar('Community', result.dimensions.community.score, result.dimensions.community.max, 184)}

  <line x1="24" y1="208" x2="456" y2="208" stroke="#2d3748" stroke-width="0.5"/>
  <text x="24" y="226" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="10" fill="#4a5568">Scored on ${scoreDate}</text>
  <text x="456" y="226" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="10" fill="#4a5568" text-anchor="end">github-profile-score</text>

  <rect y="258" width="480" height="2" fill="#c9a962" rx="0"/>
</svg>`;
}

export function renderErrorSvg(username: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="120" viewBox="0 0 480 120">
  <rect width="480" height="120" fill="#111315" rx="12"/>
  <rect width="480" height="2" fill="#c9a962" rx="0"/>
  <text x="240" y="45" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="14" fill="#7d8a96" text-anchor="middle">User Not Found</text>
  <text x="240" y="70" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="12" fill="#e8d5a3" text-anchor="middle">@${username}</text>
  <text x="240" y="95" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="10" fill="#4a5568" text-anchor="middle">Check the username and try again</text>
  <rect y="118" width="480" height="2" fill="#c9a962" rx="0"/>
</svg>`;
}

export function renderRateLimitSvg(username: string, resetAt: Date): string {
  const timeStr = resetAt.toISOString().substring(11, 16) + ' UTC';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="120" viewBox="0 0 480 120">
  <rect width="480" height="120" fill="#111315" rx="12"/>
  <rect width="480" height="2" fill="#c9a962" rx="0"/>
  <text x="240" y="45" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="14" fill="#a89050" text-anchor="middle">Rate limited — retry after ${timeStr}</text>
  <text x="240" y="70" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="12" fill="#e8d5a3" text-anchor="middle">@${username}</text>
  <text x="240" y="95" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="10" fill="#4a5568" text-anchor="middle">GitHub API rate limit exceeded</text>
  <rect y="118" width="480" height="2" fill="#c9a962" rx="0"/>
</svg>`;
}
