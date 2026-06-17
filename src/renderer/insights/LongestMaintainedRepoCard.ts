import { tokens } from '../../theme/tokens.js';
import { escapeHtml } from '../../utils/escapeHtml.js';

const CARD_WIDTH = 320;
const CARD_HEIGHT = 80;

const ICON = {
  clock: `<svg x="16" y="28" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="${tokens.blue}" stroke-width="1.5"/><polyline points="12 7 12 12 15 15" stroke="${tokens.blue}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

function truncateName(name: string, maxLen: number): string {
  if (name.length <= maxLen) return name;
  return name.slice(0, maxLen - 1) + '\u2026';
}

function formatSpan(days: number): string {
  if (days >= 365) {
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    if (remainingDays > 30) {
      const months = Math.floor(remainingDays / 30);
      return `${years}y ${months}m`;
    }
    return `${years}y`;
  }
  if (days >= 30) {
    const months = Math.floor(days / 30);
    return `${months}m`;
  }
  return `${days}d`;
}

export function renderLongestMaintainedCard(
  repoName: string,
  spanDays: number,
  repoUrl: string,
  firstCommitDate: string,
): string {
  const displayName = truncateName(repoName, 22);
  const spanText = formatSpan(spanDays);
  const startedYear = new Date(firstCommitDate).getFullYear();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <style>
    .card-bg { transition: background 0.15s ease; }
    .card-bg:hover { background: #1c2128; }
  </style>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${tokens.bg}" rx="8" class="card-bg"/>
  <rect x="0" y="0" width="2" height="${CARD_HEIGHT}" fill="${tokens.blue}" rx="0"/>

  ${ICON.clock}

  <text x="44" y="32" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="10" fill="${tokens.textMuted}" letter-spacing="0.06em">LONGEST MAINTAINED</text>
  <text x="44" y="52" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="14" fill="${tokens.textPrimary}" font-weight="600">
    <a href="${escapeHtml(repoUrl)}" style="text-decoration:none;fill:inherit">${escapeHtml(displayName)}</a>
  </text>
  <text x="44" y="68" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="11" fill="${tokens.textMuted}">${spanText} (since ${startedYear})</text>

  <rect y="${CARD_HEIGHT - 1}" width="${CARD_WIDTH}" height="1" fill="${tokens.border}" rx="0"/>
</svg>`;
}
