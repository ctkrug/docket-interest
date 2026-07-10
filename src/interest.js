const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS_PER_YEAR = 365;

/**
 * Whole days between two dates, ignoring time-of-day. Both are parsed as
 * UTC so a date string like "2026-01-01" behaves the same regardless of
 * the host machine's local timezone.
 */
export function daysBetween(startDate, endDate) {
  const start = toUtcMidnight(startDate);
  const end = toUtcMidnight(endDate);
  return Math.round((end - start) / DAY_MS);
}

function toUtcMidnight(date) {
  const d = date instanceof Date ? date : new Date(`${date}T00:00:00Z`);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Simple interest: the statutory default in most states. Interest accrues
 * daily on the original principal only — it never earns interest on
 * itself. rate is an annual percentage, e.g. 9 for 9%.
 */
export function simpleInterest({ principal, rate, startDate, endDate }) {
  const days = Math.max(0, daysBetween(startDate, endDate));
  const dailyRate = rate / 100 / DAYS_PER_YEAR;
  const interest = principal * dailyRate * days;
  return { days, interest, total: principal + interest };
}

/**
 * Annual compound interest, used by the minority of states (e.g. Kentucky,
 * Colorado's default rate) whose statute compounds accrued interest once
 * per year. Full elapsed years compound; the trailing partial year accrues
 * simple interest on the year-end balance so the result is continuous
 * (no jump) at each anniversary.
 */
export function compoundInterest({ principal, rate, startDate, endDate }) {
  const totalDays = Math.max(0, daysBetween(startDate, endDate));
  const fullYears = Math.floor(totalDays / DAYS_PER_YEAR);
  const remainderDays = totalDays - fullYears * DAYS_PER_YEAR;
  const annualMultiplier = 1 + rate / 100;

  const balanceAtLastAnniversary = principal * annualMultiplier ** fullYears;
  const dailyRate = rate / 100 / DAYS_PER_YEAR;
  const trailingInterest = balanceAtLastAnniversary * dailyRate * remainderDays;
  const total = balanceAtLastAnniversary + trailingInterest;

  return { days: totalDays, interest: total - principal, total };
}

/**
 * Dispatches to simple or compound accrual based on the state's rule.
 * `method` is whatever a states-data entry sets: "simple" or "compound".
 */
export function calculateJudgmentInterest({
  principal,
  rate,
  method,
  startDate,
  endDate,
}) {
  if (!(principal > 0)) {
    throw new RangeError("principal must be a positive number");
  }
  if (!(rate >= 0)) {
    throw new RangeError("rate must be a non-negative number");
  }

  const compute = method === "compound" ? compoundInterest : simpleInterest;
  return compute({ principal, rate, startDate, endDate });
}
