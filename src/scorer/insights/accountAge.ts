export interface AccountAgeResult {
  years: number;
  months: number;
  createdAt: string;
}

/**
 * Calculate the age of a GitHub account from its creation date.
 *
 * Uses calendar months (not approximate 30-day months) to match
 * how humans naturally describe account age: "3 years, 4 months".
 *
 * Rounding: months are truncated (floor), not rounded. An account
 * created 2 years, 11 months ago shows "2 years, 11 months" not
 * "3 years" — this is more precise and avoids confusion when
 * the account is days away from the next full year.
 */
export function calculateAccountAge(createdAt: string): AccountAgeResult {
  const created = new Date(createdAt);
  const now = new Date();

  let years = now.getFullYear() - created.getFullYear();
  let months = now.getMonth() - created.getMonth();

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) {
    return { years: 0, months: 0, createdAt };
  }

  return { years, months, createdAt };
}
