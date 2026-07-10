import { test } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import { simpleInterest, compoundInterest } from "../src/interest.js";

const BASE = "2020-01-01";

function addDaysIso(baseIso, days) {
  const d = new Date(`${baseIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const principalArb = fc.double({ min: 0.01, max: 1e7, noNaN: true });
const rateArb = fc.double({ min: 0, max: 50, noNaN: true });
const daysArb = fc.integer({ min: 0, max: 20000 });

test("simpleInterest never accrues negative interest and total always equals principal + interest", () => {
  fc.assert(
    fc.property(principalArb, rateArb, daysArb, (principal, rate, days) => {
      const { interest, total } = simpleInterest({
        principal,
        rate,
        startDate: BASE,
        endDate: addDaysIso(BASE, days),
      });
      assert.ok(interest >= 0);
      assert.ok(Math.abs(total - (principal + interest)) < 1e-6);
    }),
  );
});

test("simpleInterest is monotonically non-decreasing as the elapsed days grow", () => {
  fc.assert(
    fc.property(principalArb, rateArb, daysArb, daysArb, (principal, rate, dA, dB) => {
      const [earlier, later] = dA <= dB ? [dA, dB] : [dB, dA];
      const paramsFor = (days) => ({
        principal,
        rate,
        startDate: BASE,
        endDate: addDaysIso(BASE, days),
      });
      const shorter = simpleInterest(paramsFor(earlier));
      const longer = simpleInterest(paramsFor(later));
      assert.ok(longer.interest >= shorter.interest - 1e-9);
    }),
  );
});

test("simpleInterest scales linearly with principal", () => {
  fc.assert(
    fc.property(principalArb, rateArb, daysArb, (principal, rate, days) => {
      const params = { rate, startDate: BASE, endDate: addDaysIso(BASE, days) };
      const single = simpleInterest({ ...params, principal });
      const doubled = simpleInterest({ ...params, principal: principal * 2 });
      const tolerance = Math.max(1e-6, Math.abs(single.interest) * 1e-9);
      assert.ok(Math.abs(doubled.interest - 2 * single.interest) < tolerance);
    }),
  );
});

test("compoundInterest never earns less than simpleInterest once a full year has elapsed", () => {
  fc.assert(
    fc.property(
      principalArb,
      rateArb,
      fc.integer({ min: 365, max: 20000 }),
      (principal, rate, days) => {
        const params = { principal, rate, startDate: BASE, endDate: addDaysIso(BASE, days) };
        const simple = simpleInterest(params);
        const compound = compoundInterest(params);
        assert.ok(compound.interest >= simple.interest - 1e-6);
      },
    ),
  );
});
