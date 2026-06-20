import { escapeHtml } from '../../utils/escapeHtml.js';
import { renderFromTemplate } from '../shared/templateLoader.js';

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

  return renderFromTemplate('10-insight-longest-maintained-repo', {
    repo_url: escapeHtml(repoUrl),
    repo_name: escapeHtml(displayName),
    span_text: spanText,
    started_year: String(startedYear),
  });
}
