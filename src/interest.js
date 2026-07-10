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
 * The compounded balance as of the most recent annual anniversary — the base
 * the current year's daily interest accrues on. For a simple-interest judgment
 * (or a compound one still in its first year) this is just the principal.
 */
function balanceAtLastAnniversary(principal, rate, totalDays) {
  const fullYears = Math.floor(totalDays / DAYS_PER_YEAR);
  return principal * (1 + rate / 100) ** fullYears;
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
  const remainderDays = totalDays - Math.floor(totalDays / DAYS_PER_YEAR) * DAYS_PER_YEAR;
  const balance = balanceAtLastAnniversary(principal, rate, totalDays);
  const dailyRate = rate / 100 / DAYS_PER_YEAR;
  const total = balance + balance * dailyRate * remainderDays;

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

/**
 * The current day's accrual in dollars, shown next to the running total so a
 * reader can see how fast it's moving. For a compounding judgment this is the
 * daily rate applied to the balance at the last anniversary (not the original
 * principal), so it stays accurate as the balance grows year over year; for a
 * simple judgment the balance is always the principal, so dates are optional.
 */
export function perDiemAmount({ principal, rate, method, startDate, endDate }) {
  const dailyRate = rate / 100 / DAYS_PER_YEAR;
  if (method === "compound" && startDate && endDate) {
    const totalDays = Math.max(0, daysBetween(startDate, endDate));
    return balanceAtLastAnniversary(principal, rate, totalDays) * dailyRate;
  }
  return principal * dailyRate;
}
