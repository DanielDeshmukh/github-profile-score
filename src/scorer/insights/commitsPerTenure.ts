export interface CommitsPerTenureResult {
  average: number;
  totalCommits: number;
  tenureYears: number;
}

/**
 * Calculate average commits per year of account tenure.
 *
 * This is a pure derivation — zero new API calls. It combines:
 * - Account age (from profile.created_at) → tenure years
 * - Total commits (from contributions calendar) → commit count
 *
 * The denominator is floored at 1 year to avoid divide-by-near-
 * zero for very new accounts. An account that is 3 months old
 * and has 50 commits shows 200.0 (50 / 0.25 → 50 / 1 = 50? No,
 * actually we use the full fractional year for precision).
 *
 * Actually, for precision we use fractional years (months / 12)
 * for accounts less than 1 year old, and floor(years) for
 * accounts >= 1 year. This gives more meaningful results for
 * new accounts while avoiding noise for established ones.
 */
export function calculateCommitsPerTenure(
  totalCommits: number,
  createdAt: string,
): CommitsPerTenureResult {
  const created = new Date(createdAt);
  const now = new Date();

  let years = now.getFullYear() - created.getFullYear();
  let months = now.getMonth() - created.getMonth();

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (months === 0 && now.getDate() < created.getDate()) {
    years -= 1;
    months = 11;
  }

  if (years < 0) {
    return { average: 0, totalCommits, tenureYears: 0 };
  }

  let tenureYears: number;
  if (years === 0) {
    tenureYears = Math.max(0.1, (months + now.getDate() / 30) / 12);
  } else {
    tenureYears = years;
  }

  const average = tenureYears > 0 ? Math.round((totalCommits / tenureYears) * 10) / 10 : 0;

  return { average, totalCommits, tenureYears: Math.round(tenureYears * 10) / 10 };
}
