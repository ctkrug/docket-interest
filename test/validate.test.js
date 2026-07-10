import { test } from "node:test";
import assert from "node:assert/strict";
import { validateInputs } from "../src/validate.js";

const VALID = {
  stateCode: "KY",
  principal: "10000",
  judgmentDate: "2025-01-01",
  asOfDate: "2026-01-01",
};

test("accepts a fully filled, well-ordered set of inputs", () => {
  const result = validateInputs(VALID);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test("accepts a judgment date equal to the as-of date (zero days)", () => {
  const result = validateInputs({ ...VALID, asOfDate: VALID.judgmentDate });
  assert.equal(result.valid, true);
});

test("rejects a missing state", () => {
  const result = validateInputs({ ...VALID, stateCode: "" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.stateCode);
});

test("rejects a zero judgment amount", () => {
  const result = validateInputs({ ...VALID, principal: "0" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.principal);
});

test("rejects a negative judgment amount", () => {
  const result = validateInputs({ ...VALID, principal: "-500" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.principal);
});

test("rejects a non-numeric judgment amount", () => {
  const result = validateInputs({ ...VALID, principal: "not-a-number" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.principal);
});

test("rejects an empty judgment amount", () => {
  const result = validateInputs({ ...VALID, principal: "" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.principal);
});

test("rejects a missing judgment date", () => {
  const result = validateInputs({ ...VALID, judgmentDate: "" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.judgmentDate);
});

test("rejects a missing as-of date", () => {
  const result = validateInputs({ ...VALID, asOfDate: "" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.asOfDate);
});

test("rejects an as-of date before the judgment date", () => {
  const result = validateInputs({
    ...VALID,
    judgmentDate: "2026-06-01",
    asOfDate: "2026-01-01",
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.asOfDate);
});

test("reports every violated field at once, not just the first", () => {
  const result = validateInputs({
    stateCode: "",
    principal: "",
    judgmentDate: "",
    asOfDate: "",
  });
  assert.equal(Object.keys(result.errors).length, 4);
});
