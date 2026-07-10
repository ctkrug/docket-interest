import { test } from "node:test";
import assert from "node:assert/strict";
import { STATES, getState } from "../src/data/states.js";

const REQUIRED_FIELDS = [
  "code",
  "name",
  "rate",
  "rateDescription",
  "method",
  "rateType",
  "citation",
  "notes",
  "lastVerified",
];

test("covers exactly the 50 states plus DC", () => {
  assert.equal(STATES.length, 51);
});

test("every state code is unique", () => {
  const codes = STATES.map((s) => s.code);
  assert.equal(new Set(codes).size, codes.length);
});

test("every entry has all required fields populated", () => {
  for (const state of STATES) {
    for (const field of REQUIRED_FIELDS) {
      assert.ok(
        field in state,
        `${state.code ?? "<unknown>"} is missing field "${field}"`,
      );
    }
    assert.ok(state.citation.length > 0, `${state.code} has an empty citation`);
    assert.ok(
      state.rateDescription.length > 0,
      `${state.code} has an empty rateDescription`,
    );
  }
});

test("method is always simple or compound", () => {
  for (const state of STATES) {
    assert.ok(
      ["simple", "compound"].includes(state.method),
      `${state.code} has an invalid method "${state.method}"`,
    );
  }
});

test("rateType is always fixed, variable, or discretionary", () => {
  for (const state of STATES) {
    assert.ok(
      ["fixed", "variable", "discretionary"].includes(state.rateType),
      `${state.code} has an invalid rateType "${state.rateType}"`,
    );
  }
});

test("rate is either a positive number or null", () => {
  for (const state of STATES) {
    if (state.rate !== null) {
      assert.ok(
        typeof state.rate === "number" && state.rate > 0,
        `${state.code} has a non-positive rate ${state.rate}`,
      );
    }
  }
});

test("at least one state compounds annually (the differentiating research)", () => {
  const compoundStates = STATES.filter((s) => s.method === "compound");
  assert.ok(compoundStates.length > 0);
});

test("getState looks up by code case-insensitively", () => {
  assert.equal(getState("ky").name, "Kentucky");
  assert.equal(getState("KY").name, "Kentucky");
  assert.equal(getState("zz"), undefined);
});
