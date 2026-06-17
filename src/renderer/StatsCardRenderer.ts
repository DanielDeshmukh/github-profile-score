import { tokens, THEME_DERIVED } from '../theme/tokens.js';
import type { GitHubProfileStats, LanguageBreakdown } from '../types/stats.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { createGradeRing } from './shared/ring.js';

const CARD_WIDTH = 480;
const CARD_HEIGHT = 200;

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const ICONS = {
  star: `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="${tokens.gold}" stroke-width="1.5" stroke-linejoin="round"/>`,
  commits: `<circle cx="12" cy="12" r="3" fill="${tokens.blue}"/><line x1="12" y1="3" x2="12" y2="9" stroke="${tokens.blue}" stroke-width="1.5" stroke-linecap="round"/><line x1="12" y1="15" x2="12" y2="21" stroke="${tokens.blue}" stroke-width="1.5" stroke-linecap="round"/>`,
  pr: `<circle cx="12" cy="6" r="3" fill="none" stroke="${tokens.purple}" stroke-width="1.5"/><circle cx="12" cy="18" r="3" fill="none" stroke="${tokens.purple}" stroke-width="1.5"/><path d="M12 9v3c0 2 1 3 3 3" fill="none" stroke="${tokens.purple}" stroke-width="1.5" stroke-linecap="round"/>`,
  issues: `<circle cx="12" cy="12" r="9" fill="none" stroke="${tokens.textMuted}" stroke-width="1.5"/><line x1="12" y1="8" x2="12" y2="13" stroke="${tokens.textMuted}" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="16" r="1" fill="${tokens.textMuted}"/>`,
};

function createStatRow(icon: string, label: string, value: number, yOffset: number, iconColor: string): string {
  return `
  <g transform="translate(24, ${yOffset - 10})">${icon}</g>
  <text x="44" y="${yOffset}" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="12" fill="${tokens.textMuted}">${escapeHtml(label)}</text>
  <text x="${CARD_WIDTH - 24}" y="${yOffset}" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="14" fill="${iconColor}" text-anchor="end" font-weight="700">${formatNumber(value)}</text>`;
}

export function renderStatsCard(username: string, stats: GitHubProfileStats): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <style>
    @keyframes ring-fill {
      from { stroke-dashoffset: ${2 * Math.PI * 20}; }
      to { stroke-dashoffset: ${2 * Math.PI * 20 * (1 - Math.min((stats.totalStarsEarned + stats.totalCommitsLastYear + stats.totalPRs + stats.totalIssues) / 1000, 1))}; }
    }
    .ring-arc {
      animation: ring-fill 0.6s ease-out forwards;
    }
  </style>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${tokens.bg}" rx="12"/>
  <rect width="${CARD_WIDTH}" height="2" fill="${tokens.purple}" rx="0"/>

  <text x="24" y="30" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="13" fill="${tokens.textPrimary}" font-weight="600">${escapeHtml(username)}'s GitHub Stats</text>

  ${createGradeRing({ cx: CARD_WIDTH - 40, cy: 36, radius: 20, score: stats.totalStarsEarned + stats.totalCommitsLastYear + stats.totalPRs + stats.totalIssues, maxScore: 1000, grade: stats.grade })}

  <line x1="24" y1="50" x2="${CARD_WIDTH - 24}" y2="50" stroke="${tokens.border}" stroke-width="0.5"/>

  ${createStatRow(ICONS.star, 'Total Stars', stats.totalStarsEarned, 74, tokens.gold)}
  ${createStatRow(ICONS.commits, 'Commits (Last Year)', stats.totalCommitsLastYear, 100, tokens.blue)}
  ${createStatRow(ICONS.pr, 'Total PRs', stats.totalPRs, 126, tokens.purple)}
  ${createStatRow(ICONS.issues, 'Total Issues', stats.totalIssues, 152, tokens.textMuted)}

  <rect y="${CARD_HEIGHT - 2}" width="${CARD_WIDTH}" height="2" fill="${tokens.purple}" rx="0"/>
</svg>`;
}

export function renderLanguagesCard(languages: LanguageBreakdown[]): string {
  const svgHeight = 200;
  const barY = 55;
  const barHeight = 12;
  const maxLegendItems = 5;

  const displayLanguages = languages.slice(0, maxLegendItems);

  let barSegments = '';
  let xOffset = 24;
  const barWidth = CARD_WIDTH - 48;

  for (const lang of displayLanguages) {
    const segWidth = Math.max(2, (lang.percent / 100) * barWidth);
    barSegments += `<rect x="${xOffset}" y="${barY}" width="${segWidth}" height="${barHeight}" rx="4" fill="${lang.color}"/>`;
    xOffset += segWidth;
  }

  const remainingCount = languages.length - maxLegendItems;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${svgHeight}" viewBox="0 0 ${CARD_WIDTH} ${svgHeight}">
  <rect width="${CARD_WIDTH}" height="${svgHeight}" fill="${tokens.bg}" rx="12"/>
  <rect width="${CARD_WIDTH}" height="2" fill="${tokens.purple}" rx="0"/>

  <text x="24" y="30" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="13" fill="${tokens.textPrimary}" font-weight="600">Most Used Languages</text>

  <line x1="24" y1="42" x2="${CARD_WIDTH - 24}" y2="42" stroke="${tokens.border}" stroke-width="0.5"/>

  <rect x="24" y="${barY}" width="${barWidth}" height="${barHeight}" rx="4" fill="${THEME_DERIVED.barTrack}"/>
  ${barSegments}

  ${displayLanguages.map((lang, i) => `
  <circle cx="${32}" cy="${80 + i * 22}" r="4" fill="${lang.color}"/>
  <text x="44" y="${83 + i * 22}" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="11" fill="${tokens.textPrimary}">${escapeHtml(lang.name)}</text>
  <text x="${CARD_WIDTH - 24}" y="${83 + i * 22}" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="11" fill="${tokens.textMuted}" text-anchor="end">${lang.percent}%</text>`).join('')}

  ${remainingCount > 0 ? `<text x="24" y="${83 + displayLanguages.length * 22}" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="10" fill="${tokens.textMuted}">+ ${remainingCount} more</text>` : ''}

  <rect y="${svgHeight - 2}" width="${CARD_WIDTH}" height="2" fill="${tokens.purple}" rx="0"/>
</svg>`;
}

export function renderStatsErrorSvg(username: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="120" viewBox="0 0 ${CARD_WIDTH} 120">
  <rect width="${CARD_WIDTH}" height="120" fill="${tokens.bg}" rx="12"/>
  <rect width="${CARD_WIDTH}" height="2" fill="${tokens.red}" rx="0"/>
  <text x="${CARD_WIDTH / 2}" y="45" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="14" fill="${tokens.textMuted}" text-anchor="middle">Stats Unavailable</text>
  <text x="${CARD_WIDTH / 2}" y="70" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="12" fill="${tokens.textPrimary}" text-anchor="middle">@${escapeHtml(username)}</text>
  <text x="${CARD_WIDTH / 2}" y="95" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="10" fill="${tokens.textMuted}" text-anchor="middle">Check the username and try again</text>
  <rect y="118" width="${CARD_WIDTH}" height="2" fill="${tokens.red}" rx="0"/>
</svg>`;
}
