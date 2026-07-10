import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDemandLetter } from "../src/letter.js";
import { generateDemandLetterPdf } from "../src/pdf.js";

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

test("renders a fully-filled letter onto exactly one page", () => {
  const doc = generateDemandLetterPdf(buildDemandLetter(BASE));
  assert.equal(doc.internal.getNumberOfPages(), 1);
});

test("renders a minimal letter (no optional fields) onto exactly one page", () => {
  const doc = generateDemandLetterPdf(
    buildDemandLetter({ ...BASE, caseNumber: "", courtName: "", addressBlock: "" }),
  );
  assert.equal(doc.internal.getNumberOfPages(), 1);
});

test("stays on one page even with an unusually long address block", () => {
  const longAddress = Array.from(
    { length: 8 },
    (_, i) => `Attention: Department ${i + 1} of Accounts Receivable Processing`,
  ).join("\n");
  const doc = generateDemandLetterPdf(
    buildDemandLetter({ ...BASE, addressBlock: longAddress }),
  );
  assert.equal(doc.internal.getNumberOfPages(), 1);
});

test("produces a non-empty PDF byte stream", () => {
  const doc = generateDemandLetterPdf(buildDemandLetter(BASE));
  const bytes = doc.output();
  assert.ok(bytes.length > 100);
  assert.match(bytes, /^%PDF-/);
});

test("spills onto additional pages instead of losing content when input is pathologically long", () => {
  // Even the smallest candidate font can't shrink a name this long onto one page.
  // The letter must paginate rather than silently draw text past the bottom margin.
  const longName = "Extremely Long Judgment Creditor Name ".repeat(60);
  const longAddress = Array.from(
    { length: 40 },
    (_, i) => `Suite ${i} Accounts Receivable Processing Department `.repeat(4),
  ).join("\n");
  const doc = generateDemandLetterPdf(
    buildDemandLetter({
      ...BASE,
      creditorName: longName,
      debtorName: longName,
      courtName: "Y".repeat(500),
      addressBlock: longAddress,
    }),
  );
  assert.ok(
    doc.internal.getNumberOfPages() > 1,
    "expected pagination for content that cannot fit on one page at any candidate font size",
  );
});

test("breaks to a second page as soon as content exceeds one page, not only for extreme overflow", () => {
  // Calibrated to land just past the one-page budget at the smallest candidate
  // font, so a page-break threshold that's merely shifted (not just removed)
  // is still caught.
  const longName = "Very Long Creditor Name Segment ".repeat(70);
  const doc = generateDemandLetterPdf(
    buildDemandLetter({
      ...BASE,
      creditorName: longName,
      caseNumber: "",
      courtName: "",
      addressBlock: "",
    }),
  );
  assert.equal(doc.internal.getNumberOfPages(), 2);
});
