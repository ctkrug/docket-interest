import { test } from "node:test";
import assert from "node:assert/strict";
import {
  daysBetween,
  simpleInterest,
  compoundInterest,
  calculateJudgmentInterest,
} from "../src/interest.js";

test("daysBetween counts whole days regardless of time-of-day", () => {
  assert.equal(daysBetween("2026-01-01", "2026-01-02"), 1);
  assert.equal(daysBetween("2026-01-01", "2027-01-01"), 365);
  assert.equal(daysBetween("2026-01-01", "2026-01-01"), 0);
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
