import { escapeHtml } from '../../utils/escapeHtml.js';
import { renderFromTemplate } from '../shared/templateLoader.js';

function truncateName(name: string, maxLen: number): string {
  if (name.length <= maxLen) return name;
  return name.slice(0, maxLen - 1) + '\u2026';
}

export function renderMostActiveRepoCard(
  repoName: string,
  commitCount: number,
  repoUrl: string,
): string {
  const displayName = truncateName(repoName, 22);

  return renderFromTemplate('05-insight-most-active-repo', {
    repo_url: escapeHtml(repoUrl),
    repo_name: escapeHtml(displayName),
    commit_count: `${commitCount.toLocaleString()} commits`,
  });
}

export function renderMostActiveRepoEmptySvg(): string {
  return renderFromTemplate('05-insight-most-active-repo', {
    repo_url: '#',
    repo_name: 'No public repos found',
    commit_count: '',
  });
}
