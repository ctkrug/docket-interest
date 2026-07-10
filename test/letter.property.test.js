import { test } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import { buildDemandLetter } from "../src/letter.js";

const BASE = {
  creditorName: "Jane Creditor",
  debtorName: "John Debtor",
  stateName: "Kentucky",
  citation: "KRS § 360.040",
  principal: 10000,
  judgmentDate: "2025-01-01",
  asOfDate: "2026-01-01",
  method: "compound",
  days: 365,
  interest: 1200,
  total: 11200,
};

// caseNumber, courtName, and addressBlock are the fields BACKLOG 2.2 calls
// optional; any combination of filled/blank must omit cleanly, never leak a
// placeholder token onto a document a debtor or a court will actually read.
const optionalFieldArb = fc.oneof(fc.constant(""), fc.string());

test("buildDemandLetter never leaks undefined/null/NaN for any combination of optional fields", () => {
  fc.assert(
    fc.property(
      optionalFieldArb,
      optionalFieldArb,
      optionalFieldArb,
      (caseNumber, courtName, addressBlock) => {
        const text = buildDemandLetter({
          ...BASE,
          caseNumber,
          courtName,
          addressBlock,
        })
          .flat()
          .join("\n");
        assert.doesNotMatch(text, /\bundefined\b/);
        assert.doesNotMatch(text, /\bnull\b/);
        assert.doesNotMatch(text, /\bNaN\b/);
      },
    ),
  );
});

test("buildDemandLetter never produces an empty paragraph for any combination of optional fields", () => {
  fc.assert(
    fc.property(
      optionalFieldArb,
      optionalFieldArb,
      optionalFieldArb,
      (caseNumber, courtName, addressBlock) => {
        const paragraphs = buildDemandLetter({ ...BASE, caseNumber, courtName, addressBlock });
        assert.ok(paragraphs.every((p) => p.length > 0));
      },
    ),
  );
});
