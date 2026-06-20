import { escapeHtml } from '../../utils/escapeHtml.js';
import { renderFromTemplate } from '../shared/templateLoader.js';

function truncateName(name: string, maxLen: number): string {
  if (name.length <= maxLen) return name;
  return name.slice(0, maxLen - 1) + '\u2026';
}

export function renderMostStarredRepoCard(
  repoName: string,
  stars: number,
  repoUrl: string,
): string {
  const displayName = truncateName(repoName, 22);

  return renderFromTemplate('07-insight-most-starred-repo', {
    repo_url: escapeHtml(repoUrl),
    repo_name: escapeHtml(displayName),
    stars: stars.toLocaleString(),
  });
}

export function renderMostStarredRepoEmptySvg(): string {
  return renderFromTemplate('07-insight-most-starred-repo', {
    repo_url: '#',
    repo_name: 'No public repos found',
    stars: '0',
  });
}
