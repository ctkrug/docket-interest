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

test("covers every state and DC by name, not just by count", () => {
  // A count of 51 alone wouldn't catch a duplicate crowding out a real
  // jurisdiction (e.g. two "Georgia" entries with Guam never added).
  const CANONICAL_NAMES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia",
    "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
    "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
    "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
    "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
    "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
  ];
  const names = STATES.map((s) => s.name).sort();
  assert.deepEqual(names, [...CANONICAL_NAMES].sort());
});

test("every state code is unique", () => {
  const codes = STATES.map((s) => s.code);
  assert.equal(new Set(codes).size, codes.length);
});

test("every USPS code matches its state name (catches a transposed typo)", () => {
  const CANONICAL_CODE_BY_NAME = {
    Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
    Colorado: "CO", Connecticut: "CT", Delaware: "DE", "District of Columbia": "DC",
    Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID", Illinois: "IL",
    Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY", Louisiana: "LA",
    Maine: "ME", Maryland: "MD", Massachusetts: "MA", Michigan: "MI",
    Minnesota: "MN", Mississippi: "MS", Missouri: "MO", Montana: "MT",
    Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH", "New Jersey": "NJ",
    "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
    "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK", Oregon: "OR",
    Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
    "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT",
    Vermont: "VT", Virginia: "VA", Washington: "WA", "West Virginia": "WV",
    Wisconsin: "WI", Wyoming: "WY",
  };
  for (const state of STATES) {
    assert.equal(
      state.code,
      CANONICAL_CODE_BY_NAME[state.name],
      `${state.name} has code ${state.code}, expected ${CANONICAL_CODE_BY_NAME[state.name]}`,
    );
  }
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
