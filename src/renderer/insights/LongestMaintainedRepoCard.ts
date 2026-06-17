import { THEME } from '../../theme/tokens.js';
import { escapeHtml } from '../../utils/escapeHtml.js';

const CARD_WIDTH = 320;
const CARD_HEIGHT = 80;

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
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${THEME.cream}" rx="8"/>
  <rect width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
  <rect x="0" y="0" width="3" height="${CARD_HEIGHT}" fill="${THEME.gold}" rx="0"/>

  <text x="16" y="28" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="11" fill="${THEME.silver}">Longest maintained repo</text>

  <text x="16" y="50" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="16" fill="${THEME.goldLight}" font-weight="600">
    <a href="${escapeHtml(repoUrl)}" style="text-decoration:none;fill:inherit">${escapeHtml(displayName)}</a>
  </text>

  <text x="16" y="68" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="12" fill="${THEME.silver}">${spanText} (since ${startedYear})</text>

  <rect y="${CARD_HEIGHT - 2}" width="${CARD_WIDTH}" height="2" fill="${THEME.gold}" rx="0"/>
</svg>`;
}
