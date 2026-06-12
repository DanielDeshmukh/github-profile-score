import type { ScoreResult } from '../types.js';

const GRADE_COLORS: Record<ScoreResult['grade'], string> = {
  A: '#22c55e',
  B: '#84cc16',
  C: '#eab308',
  D: '#f97316',
  F: '#ef4444',
};

function createBar(score: number, max: number, color: string, label: string): string {
  const width = Math.round((score / max) * 180);
  return `
    <g transform="translate(0, 0)">
      <text x="0" y="12" font-family="Arial, sans-serif" font-size="11" fill="#9ca3af">${label}</text>
      <rect x="80" y="2" width="180" height="14" rx="7" fill="#1f2937"/>
      <rect x="80" y="2" width="${width}" height="14" rx="7" fill="${color}"/>
      <text x="270" y="13" font-family="Arial, sans-serif" font-size="11" fill="#e5e7eb" text-anchor="end">${score}/${max}</text>
    </g>`;
}

export function renderSvg(result: ScoreResult): string {
  const gradeColor = GRADE_COLORS[result.grade];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="400" height="280" rx="12" fill="url(#bg)"/>
  <rect x="1" y="1" width="398" height="278" rx="11" fill="none" stroke="#334155" stroke-width="1"/>

  <text x="20" y="35" font-family="Arial, sans-serif" font-size="14" fill="#94a3b8" font-weight="bold">GitHub Profile Score</text>
  <text x="380" y="35" font-family="Arial, sans-serif" font-size="12" fill="#64748b" text-anchor="end">@${result.username}</text>

  <circle cx="60" cy="90" r="35" fill="none" stroke="${gradeColor}" stroke-width="4"/>
  <text x="60" y="85" font-family="Arial, sans-serif" font-size="28" fill="${gradeColor}" text-anchor="middle" font-weight="bold">${result.total}</text>
  <text x="60" y="105" font-family="Arial, sans-serif" font-size="14" fill="${gradeColor}" text-anchor="middle">${result.grade}</text>

  <g transform="translate(120, 55)">
    ${createBar(result.dimensions.activity.score, result.dimensions.activity.max, gradeColor, 'Activity')}
    ${createBar(result.dimensions.quality.score, result.dimensions.quality.max, gradeColor, 'Quality')}
    ${createBar(result.dimensions.documentation.score, result.dimensions.documentation.max, gradeColor, 'Docs')}
    ${createBar(result.dimensions.diversity.score, result.dimensions.diversity.max, gradeColor, 'Diversity')}
    ${createBar(result.dimensions.community.score, result.dimensions.community.max, gradeColor, 'Community')}
  </g>

  ${result.dimensions.activity.callout || result.dimensions.quality.callout || result.dimensions.documentation.callout || result.dimensions.diversity.callout || result.dimensions.community.callout
    ? `<text x="20" y="250" font-family="Arial, sans-serif" font-size="10" fill="#64748b">Click for detailed breakdown and improvement tips</text>`
    : ''
  }

  <text x="20" y="270" font-family="Arial, sans-serif" font-size="9" fill="#475569">Scored ${new Date(result.scored_at).toLocaleDateString()}</text>
</svg>`;
}

export function renderErrorSvg(username: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120">
  <rect width="400" height="120" rx="12" fill="#0f172a"/>
  <rect x="1" y="1" width="398" height="118" rx="11" fill="none" stroke="#334155" stroke-width="1"/>
  <text x="200" y="45" font-family="Arial, sans-serif" font-size="14" fill="#ef4444" text-anchor="middle">User Not Found</text>
  <text x="200" y="70" font-family="Arial, sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">@${username}</text>
  <text x="200" y="95" font-family="Arial, sans-serif" font-size="10" fill="#64748b" text-anchor="middle">Check the username and try again</text>
</svg>`;
}

export function renderRateLimitSvg(username: string, resetAt: Date): string {
  const timeStr = resetAt.toISOString().substring(11, 16) + ' UTC';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120">
  <rect width="400" height="120" rx="12" fill="#0f172a"/>
  <rect x="1" y="1" width="398" height="118" rx="11" fill="none" stroke="#334155" stroke-width="1"/>
  <text x="200" y="45" font-family="Arial, sans-serif" font-size="14" fill="#f59e0b" text-anchor="middle">Rate limited — retry after ${timeStr}</text>
  <text x="200" y="70" font-family="Arial, sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">@${username}</text>
  <text x="200" y="95" font-family="Arial, sans-serif" font-size="10" fill="#64748b" text-anchor="middle">GitHub API rate limit exceeded</text>
</svg>`;
}
