import { tokens, THEME_DERIVED } from '../theme/tokens.js';
import type { ScoreResult } from '../types.js';
import { escapeHtml } from '../utils/escapeHtml.js';

const GRADE_RING_COLORS: Record<ScoreResult['grade'], string> = {
  A: tokens.green,
  B: tokens.blue,
  C: tokens.gold,
  D: tokens.orange,
  F: tokens.red,
};

function getBarColor(percentage: number, isDocumentation = false): string {
  if (isDocumentation && percentage < 70) return tokens.orange;
  if (percentage >= 80) return tokens.green;
  if (percentage >= 60) return tokens.blue;
  if (percentage >= 40) return tokens.gold;
  return tokens.textMuted;
}

function truncateUsername(username: string): string {
  if (username.length <= 20) return username;
  return username.slice(0, 19) + '\u2026';
}

function createDimensionBar(label: string, score: number, max: number, yOffset: number, isDocumentation = false): string {
  const pct = Math.round((score / max) * 100);
  const barWidth = Math.round((score / max) * 408);
  const barColor = getBarColor(pct, isDocumentation);

  return `
  <text x="24" y="${yOffset}" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="11" fill="${tokens.textMuted}">${escapeHtml(label)}</text>
  <text x="456" y="${yOffset}" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="11" fill="${tokens.textPrimary}" text-anchor="end">${score}/${max}</text>
  <rect x="24" y="${yOffset + 6}" width="408" height="4" rx="3" fill="${THEME_DERIVED.barTrack}"/>
  <rect x="24" y="${yOffset + 6}" width="${barWidth}" height="4" rx="3" fill="${barColor}" class="progress-fill" style="--bar-width: ${barWidth}px"/>`;
}

export function renderSvg(result: ScoreResult): string {
  const gradeColor = GRADE_RING_COLORS[result.grade] || tokens.blue;
  const scoreDate = new Date(result.scored_at).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });

  const circumference = 2 * Math.PI * 30;
  const dashOffset = circumference * (1 - result.total / 100);

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="480" height="260" viewBox="0 0 480 260">
  <style>
    @keyframes ring-fill {
      from { stroke-dashoffset: ${circumference}; }
      to { stroke-dashoffset: ${dashOffset}; }
    }
    .ring-arc {
      animation: ring-fill 0.6s ease-out forwards;
    }
  </style>
  <defs>
    <clipPath id="avatar-clip">
      <circle cx="50" cy="44" r="22"/>
    </clipPath>
  </defs>

  <rect width="480" height="260" fill="${tokens.bg}" rx="12"/>
  <rect width="480" height="2" fill="${tokens.blue}" rx="0"/>

  <rect x="28" y="22" width="44" height="44" rx="22" fill="${tokens.bgTile}" stroke="${tokens.blue}" stroke-width="2"/>
  <image xlink:href="https://github.com/${escapeHtml(result.username)}.png?size=48" x="28" y="22" width="44" height="44" clip-path="url(#avatar-clip)"/>
  <text x="80" y="34" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="15" fill="${tokens.textPrimary}" font-weight="600">@${escapeHtml(truncateUsername(result.username))}</text>
  <text x="80" y="50" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="11" fill="${tokens.textMuted}">GitHub Profile Score</text>

  <circle cx="432" cy="44" r="30" fill="none" stroke="${tokens.border}" stroke-width="1.5"/>
  <circle cx="432" cy="44" r="30" fill="none" stroke="${tokens.bgTile}" stroke-width="6"/>
  <circle cx="432" cy="44" r="30" fill="none" stroke="${gradeColor}" stroke-width="6" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}" stroke-linecap="round" transform="rotate(-90, 432, 44)" class="ring-arc"/>
  <text x="432" y="40" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="18" fill="${tokens.textPrimary}" text-anchor="middle" font-weight="700">${result.total}</text>
  <text x="432" y="56" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="11" fill="${gradeColor}" text-anchor="middle">${result.grade}</text>

  <line x1="24" y1="76" x2="456" y2="76" stroke="${tokens.border}" stroke-width="0.5"/>

  ${createDimensionBar('Activity', result.dimensions.activity.score, result.dimensions.activity.max, 96)}
  ${createDimensionBar('Project Quality', result.dimensions.quality.score, result.dimensions.quality.max, 118)}
  ${createDimensionBar('Documentation', result.dimensions.documentation.score, result.dimensions.documentation.max, 140, true)}
  ${createDimensionBar('Tech Diversity', result.dimensions.diversity.score, result.dimensions.diversity.max, 162)}
  ${createDimensionBar('Community', result.dimensions.community.score, result.dimensions.community.max, 184)}

  <line x1="24" y1="208" x2="456" y2="208" stroke="${tokens.border}" stroke-width="0.5"/>
  <text x="24" y="226" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="10" fill="${tokens.textMuted}">Scored on ${scoreDate}</text>
  <text x="456" y="226" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="10" fill="${tokens.textMuted}" text-anchor="end">github-profile-score</text>

  <rect y="258" width="480" height="2" fill="${tokens.blue}" rx="0"/>
</svg>`;
}

export function renderErrorSvg(username: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="120" viewBox="0 0 480 120">
  <rect width="480" height="120" fill="${tokens.bg}" rx="12"/>
  <rect width="480" height="2" fill="${tokens.red}" rx="0"/>
  <circle cx="240" cy="40" r="16" fill="none" stroke="${tokens.red}" stroke-width="2"/>
  <line x1="240" y1="32" x2="240" y2="42" stroke="${tokens.red}" stroke-width="2" stroke-linecap="round"/>
  <circle cx="240" cy="48" r="1.5" fill="${tokens.red}"/>
  <text x="240" y="76" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="13" fill="${tokens.textPrimary}" text-anchor="middle" font-weight="600">@${escapeHtml(username)} not found</text>
  <text x="240" y="96" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="11" fill="${tokens.textMuted}" text-anchor="middle">Check the username and retry</text>
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
  <text x="240" y="76" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="13" fill="${tokens.textPrimary}" text-anchor="middle" font-weight="600">Rate limit reached</text>
  <text x="240" y="96" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="11" fill="${tokens.textMuted}" text-anchor="middle">Try again after ${timeStr}</text>
  <rect y="118" width="480" height="2" fill="${tokens.orange}" rx="0"/>
</svg>`;
}
