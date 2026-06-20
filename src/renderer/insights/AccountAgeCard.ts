import { renderFromTemplate } from '../shared/templateLoader.js';

export function renderAccountAgeCard(years: number, months: number): string {
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
  const ageText = parts.length > 0 ? parts.join(', ') : '< 1 month';

  return renderFromTemplate('06-insight-account-age', {
    age_text: ageText,
  });
}
