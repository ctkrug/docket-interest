import { test } from "node:test";
import assert from "node:assert/strict";
import {
  daysBetween,
  simpleInterest,
  compoundInterest,
  calculateJudgmentInterest,
  perDiemAmount,
} from "../src/interest.js";

test("daysBetween counts whole days regardless of time-of-day", () => {
  assert.equal(daysBetween("2026-01-01", "2026-01-02"), 1);
  assert.equal(daysBetween("2026-01-01", "2027-01-01"), 365);
  assert.equal(daysBetween("2026-01-01", "2026-01-01"), 0);
});

test("daysBetween accepts Date instances as well as ISO strings", () => {
  const start = new Date("2026-01-01T15:30:00Z");
  const end = new Date("2026-01-05T02:00:00Z");
  assert.equal(daysBetween(start, end), 4);
  // A Date-instance start mixed with a string end still works, and the
  // time-of-day on the Date instance is ignored just like a string is.
  assert.equal(daysBetween(start, "2026-01-02"), 1);
});

test("daysBetween counts a leap-day span correctly", () => {
  assert.equal(daysBetween("2028-02-28", "2028-03-01"), 2); // 2028 is a leap year
  assert.equal(daysBetween("2027-02-28", "2027-03-01"), 1); // 2027 is not
});

test("simpleInterest accrues on principal only, not on prior interest", () => {
  const { days, interest, total } = simpleInterest({
    principal: 10000,
    rate: 9,
    startDate: "2025-01-01",
    endDate: "2026-01-01",
  });
  assert.equal(days, 365);
  assert.ok(Math.abs(interest - 900) < 0.01, `expected ~900, got ${interest}`);
  assert.ok(Math.abs(total - 10900) < 0.01);
});

test("simpleInterest doubles over double the time", () => {
  const oneYear = simpleInterest({
    principal: 5000,
    rate: 8,
    startDate: "2026-01-01",
    endDate: "2027-01-01",
  });
  const twoYears = simpleInterest({
    principal: 5000,
    rate: 8,
    startDate: "2026-01-01",
    endDate: "2028-01-01",
  });
  assert.ok(Math.abs(twoYears.interest - 2 * oneYear.interest) < 0.5);
});

test("compoundInterest has no discontinuity at the annual anniversary", () => {
  // The docstring promises the trailing partial year is continuous with the
  // compounded balance — the day-over-day delta shouldn't jump at the
  // anniversary the way it would if compounding were applied a day early/late.
  const params = { principal: 10000, rate: 6, startDate: "2020-01-01" };
  const day365 = compoundInterest({ ...params, endDate: "2020-12-31" }).total;
  const day366 = compoundInterest({ ...params, endDate: "2021-01-01" }).total; // anniversary
  const day367 = compoundInterest({ ...params, endDate: "2021-01-02" }).total;
  const deltaBefore = day366 - day365;
  const deltaAfter = day367 - day366;
  assert.ok(Math.abs(deltaAfter - deltaBefore) < 0.01, `expected no jump, got ${deltaBefore} vs ${deltaAfter}`);
});

test("compoundInterest compounds annually on whole-year anniversaries", () => {
  // 2025 and 2026 are both non-leap years, so this spans exactly 730 days
  // (two whole 365-day cycles) with no leap-day remainder to account for.
  const { interest, total } = compoundInterest({
    principal: 10000,
    rate: 6,
    startDate: "2025-01-01",
    endDate: "2027-01-01",
  });
  // 10000 * 1.06^2 = 11236
  assert.ok(Math.abs(total - 11236) < 1, `expected ~11236, got ${total}`);
  assert.ok(Math.abs(interest - 1236) < 1);
});

test("compoundInterest earns more than simpleInterest at the same rate past year one", () => {
  const params = {
    principal: 10000,
    rate: 6,
    startDate: "2024-01-01",
    endDate: "2026-06-01",
  };
  const compound = compoundInterest(params);
  const simple = simpleInterest(params);
  assert.ok(compound.interest > simple.interest);
});

test("calculateJudgmentInterest dispatches on method", () => {
  const params = {
    principal: 1000,
    rate: 10,
    startDate: "2026-01-01",
    endDate: "2027-01-01",
  };
  const simple = calculateJudgmentInterest({ ...params, method: "simple" });
  const compound = calculateJudgmentInterest({ ...params, method: "compound" });
  assert.ok(Math.abs(simple.interest - 100) < 0.01);
  assert.ok(Math.abs(compound.interest - 100) < 0.01); // one year: simple === compound
});

test("calculateJudgmentInterest rejects non-positive principal", () => {
  assert.throws(
    () =>
      calculateJudgmentInterest({
        principal: 0,
        rate: 9,
        method: "simple",
        startDate: "2026-01-01",
        endDate: "2027-01-01",
      }),
    RangeError,
  );
});

test("simpleInterest accrues zero interest when start equals end date", () => {
  const { days, interest, total } = simpleInterest({
    principal: 10000,
    rate: 9,
    startDate: "2026-01-01",
    endDate: "2026-01-01",
  });
  assert.equal(days, 0);
  assert.equal(interest, 0);
  assert.equal(total, 10000);
});

test("compoundInterest accrues zero interest when start equals end date", () => {
  const { days, interest, total } = compoundInterest({
    principal: 10000,
    rate: 6,
    startDate: "2026-01-01",
    endDate: "2026-01-01",
  });
  assert.equal(days, 0);
  assert.equal(interest, 0);
  assert.equal(total, 10000);
});

test("simpleInterest and compoundInterest both accrue nothing at a zero rate", () => {
  const params = { principal: 10000, rate: 0, startDate: "2024-01-01", endDate: "2027-01-01" };
  const simple = simpleInterest(params);
  const compound = compoundInterest(params);
  assert.equal(simple.interest, 0);
  assert.equal(simple.total, 10000);
  assert.equal(compound.interest, 0);
  assert.equal(compound.total, 10000);
});

test("compoundInterest matches simpleInterest within the first year (no anniversary yet)", () => {
  const params = { principal: 10000, rate: 6, startDate: "2026-01-01", endDate: "2026-06-01" };
  const simple = simpleInterest(params);
  const compound = compoundInterest(params);
  assert.ok(Math.abs(simple.total - compound.total) < 0.0001);
});

test("perDiemAmount computes the daily dollar accrual", () => {
  assert.ok(Math.abs(perDiemAmount({ principal: 10000, rate: 7.3 }) - 2) < 0.001);
});

test("perDiemAmount is zero at a zero rate", () => {
  assert.equal(perDiemAmount({ principal: 10000, rate: 0 }), 0);
});

test("perDiemAmount for a compound judgment runs on the compounded balance", () => {
  // After two full years at 6% compounded, $10,000 has grown to $11,236, so the
  // current daily accrual is on that balance, not the original principal.
  const args = {
    principal: 10000,
    rate: 6,
    method: "compound",
    startDate: "2024-01-01",
    endDate: "2026-06-01",
  };
  const expected = (10000 * 1.06 ** 2 * (6 / 100)) / 365;
  assert.ok(Math.abs(perDiemAmount(args) - expected) < 0.001);
  // and it exceeds the naive principal-only figure it used to report
  assert.ok(perDiemAmount(args) > (10000 * (6 / 100)) / 365);
});

test("perDiemAmount within a compound judgment's first year equals the principal figure", () => {
  const args = {
    principal: 10000,
    rate: 6,
    method: "compound",
    startDate: "2026-01-01",
    endDate: "2026-06-01",
  };
  assert.ok(Math.abs(perDiemAmount(args) - (10000 * (6 / 100)) / 365) < 0.001);
});

test("calculateJudgmentInterest rejects negative rate", () => {
  assert.throws(
    () =>
      calculateJudgmentInterest({
        principal: 100,
        rate: -1,
        method: "simple",
        startDate: "2026-01-01",
        endDate: "2027-01-01",
      }),
    RangeError,
  );
});
