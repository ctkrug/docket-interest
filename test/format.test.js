import { test } from "node:test";
import assert from "node:assert/strict";
import { formatCurrency, formatDays } from "../src/format.js";

test("formatCurrency renders USD with cents and thousands separators", () => {
  assert.equal(formatCurrency(10900), "$10,900.00");
  assert.equal(formatCurrency(0), "$0.00");
  assert.equal(formatCurrency(1234.5), "$1,234.50");
});

test("formatDays pluralizes correctly", () => {
  assert.equal(formatDays(1), "1 day");
  assert.equal(formatDays(0), "0 days");
  assert.equal(formatDays(365), "365 days");
});
