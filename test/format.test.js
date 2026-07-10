import { test } from "node:test";
import assert from "node:assert/strict";
import { formatCurrency, formatDays, formatDateLong } from "../src/format.js";

test("formatCurrency renders USD with cents and thousands separators", () => {
  assert.equal(formatCurrency(10900), "$10,900.00");
  assert.equal(formatCurrency(0), "$0.00");
  assert.equal(formatCurrency(1234.5), "$1,234.50");
});

test("formatCurrency renders a negative amount with a leading sign, not a stray minus on the digits", () => {
  // calculateJudgmentInterest's own guards keep negative amounts out of the
  // live app, but formatCurrency is an exported, reusable pure utility and
  // its behavior on the input it wasn't designed for should still be pinned.
  assert.equal(formatCurrency(-500), "-$500.00");
  assert.equal(formatCurrency(-1234.5), "-$1,234.50");
});

test("formatDays pluralizes correctly", () => {
  assert.equal(formatDays(1), "1 day");
  assert.equal(formatDays(0), "0 days");
  assert.equal(formatDays(365), "365 days");
});

test("formatDateLong renders an ISO date as a long-form US date", () => {
  assert.equal(formatDateLong("2026-01-01"), "January 1, 2026");
  assert.equal(formatDateLong("2026-12-31"), "December 31, 2026");
});

test("formatDateLong is stable regardless of host timezone (parsed at UTC)", () => {
  // A date that would roll to the previous/next day under a naive local-time parse.
  assert.equal(formatDateLong("2026-03-01"), "March 1, 2026");
});
