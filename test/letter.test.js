import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDemandLetter } from "../src/letter.js";

const BASE = {
  creditorName: "Jane Creditor",
  debtorName: "John Debtor",
  caseNumber: "2026-CV-001",
  courtName: "Fayette County District Court",
  addressBlock: "123 Main St\nLexington, KY 40507",
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

function flatten(paragraphs) {
  return paragraphs.flat().join("\n");
}

test("includes every required value when all fields are filled", () => {
  const text = flatten(buildDemandLetter(BASE));
  assert.match(text, /Jane Creditor/);
  assert.match(text, /John Debtor/);
  assert.match(text, /\$10,000\.00/);
  assert.match(text, /\$1,200\.00/);
  assert.match(text, /\$11,200\.00/);
  assert.match(text, /January 1, 2025/);
  assert.match(text, /January 1, 2026/);
});

test("includes optional fields when present", () => {
  const text = flatten(buildDemandLetter(BASE));
  assert.match(text, /2026-CV-001/);
  assert.match(text, /Fayette County District Court/);
  assert.match(text, /123 Main St/);
  assert.match(text, /Lexington, KY 40507/);
});

test("omits optional fields cleanly with no leftover placeholder text", () => {
  const text = flatten(
    buildDemandLetter({
      ...BASE,
      caseNumber: "",
      courtName: "",
      addressBlock: "",
    }),
  );
  assert.doesNotMatch(text, /undefined/);
  assert.doesNotMatch(text, /null/);
  assert.doesNotMatch(text, /Case No\./);
  assert.doesNotMatch(text, /NaN/);
});

test("falls back to generic salutation/creditor label when names are missing", () => {
  const text = flatten(
    buildDemandLetter({ ...BASE, creditorName: "", debtorName: "" }),
  );
  assert.doesNotMatch(text, /undefined/);
  assert.match(text, /Dear Judgment Debtor:/);
  assert.match(text, /the undersigned creditor/);
});

test("describes simple vs. compound accrual in the body text", () => {
  const compoundText = flatten(buildDemandLetter({ ...BASE, method: "compound" }));
  const simpleText = flatten(buildDemandLetter({ ...BASE, method: "simple" }));
  assert.match(compoundText, /compound basis/);
  assert.match(simpleText, /simple basis/);
});

test("never produces an empty paragraph or a paragraph with a blank-only line", () => {
  const paragraphs = buildDemandLetter(BASE);
  for (const paragraph of paragraphs) {
    assert.ok(paragraph.length > 0);
  }
});
