const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatCurrency(amount) {
  return currencyFormatter.format(amount);
}

export function formatDays(days) {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/**
 * Renders an ISO date string ("2026-01-01") as "January 1, 2026" for use
 * in the demand letter. Parsed at UTC midnight so the date shown never
 * shifts a day depending on the host machine's timezone.
 */
export function formatDateLong(isoDate) {
  return longDateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}
