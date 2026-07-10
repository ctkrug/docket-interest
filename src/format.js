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
