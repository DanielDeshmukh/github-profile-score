import { renderFromTemplate } from '../shared/templateLoader.js';

export function renderCommitsPerTenureCard(
  average: number,
  totalCommits: number,
  tenureYears: number,
): string {
  const tenureText = tenureYears < 1
    ? `${Math.round(tenureYears * 12)} months`
    : `${tenureYears} year${tenureYears !== 1 ? 's' : ''}`;
  const avgText = average.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const detailText = `${totalCommits.toLocaleString()} commits over ${tenureText}`;

  return renderFromTemplate('12-insight-commits-per-tenure', {
    average: avgText,
    detail_text: detailText,
  });
}
