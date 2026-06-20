import { renderFromTemplate } from '../shared/templateLoader.js';

export function renderAvgCommitsPerRepoCard(
  average: number,
  activeRepos: number,
  totalCommits: number,
): string {
  const avgText = average.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const detailText = `${totalCommits.toLocaleString()} commits across ${activeRepos} repo${activeRepos !== 1 ? 's' : ''}`;

  return renderFromTemplate('09-insight-avg-commits-per-repo', {
    average: avgText,
    detail_text: detailText,
  });
}
