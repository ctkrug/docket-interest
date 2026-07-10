import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateInputs,
  validateLetterFields,
  hasUnsupportedPdfCharacters,
} from "../src/validate.js";

test("hasUnsupportedPdfCharacters accepts plain ASCII", () => {
  assert.equal(hasUnsupportedPdfCharacters("Jane Creditor LLC"), false);
});

test("hasUnsupportedPdfCharacters accepts Latin-1 diacritics common in US legal names", () => {
  assert.equal(hasUnsupportedPdfCharacters("Müller & Søren Ñoño"), false);
});

test("hasUnsupportedPdfCharacters accepts WinAnsi typographic punctuation", () => {
  // Smart quotes and an em dash both map to defined Windows-1252 bytes.
  assert.equal(hasUnsupportedPdfCharacters("O’Connor — Café"), false);
});

test("hasUnsupportedPdfCharacters rejects CJK text", () => {
  assert.equal(hasUnsupportedPdfCharacters("北京有限公司"), true);
});

test("hasUnsupportedPdfCharacters rejects Cyrillic and emoji", () => {
  assert.equal(hasUnsupportedPdfCharacters("Петров"), true);
  assert.equal(hasUnsupportedPdfCharacters("Jane 😀"), true);
});

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

test("accepts a very large judgment amount", () => {
  const result = validateInputs({ ...VALID, principal: "999999999" });
  assert.equal(result.valid, true);
});

test("rejects an infinite judgment amount", () => {
  const result = validateInputs({ ...VALID, principal: "Infinity" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.principal);
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

test("validateLetterFields accepts both names filled", () => {
  const result = validateLetterFields({
    creditorName: "Jane Creditor",
    debtorName: "John Debtor",
  });
  assert.equal(result.valid, true);
});

test("validateLetterFields rejects a missing creditor name", () => {
  const result = validateLetterFields({ creditorName: "", debtorName: "John Debtor" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.creditorName);
});

test("validateLetterFields rejects a missing debtor name", () => {
  const result = validateLetterFields({ creditorName: "Jane Creditor", debtorName: "" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.debtorName);
});

test("validateLetterFields rejects whitespace-only names", () => {
  const result = validateLetterFields({ creditorName: "   ", debtorName: "   " });
  assert.equal(result.valid, false);
  assert.ok(result.errors.creditorName);
  assert.ok(result.errors.debtorName);
});

test("validateLetterFields accepts Latin-1 diacritics in names", () => {
  const result = validateLetterFields({
    creditorName: "Müller & Søren Ñoño Corp",
    debtorName: "José García",
  });
  assert.equal(result.valid, true);
});

test("validateLetterFields rejects a creditor name the PDF font can't render", () => {
  const result = validateLetterFields({
    creditorName: "北京有限公司",
    debtorName: "John Debtor",
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.creditorName);
  assert.equal(result.errors.debtorName, undefined);
});

test("validateLetterFields rejects a debtor name the PDF font can't render", () => {
  const result = validateLetterFields({
    creditorName: "Jane Creditor",
    debtorName: "Петров",
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.debtorName);
});

test("validateLetterFields rejects unsupported characters in optional fields", () => {
  const result = validateLetterFields({
    creditorName: "Jane Creditor",
    debtorName: "John Debtor",
    caseNumber: "案件 2026",
    courtName: "東京地方裁判所",
    addressBlock: "123 Main St\n北京",
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.caseNumber);
  assert.ok(result.errors.courtName);
  assert.ok(result.errors.addressBlock);
});

test("validateLetterFields leaves optional fields unchecked when empty", () => {
  const result = validateLetterFields({
    creditorName: "Jane Creditor",
    debtorName: "John Debtor",
    caseNumber: "",
    courtName: "",
    addressBlock: "",
  });
  assert.equal(result.valid, true);
});

test("validateLetterFields reports every violated field at once, not just the first", () => {
  const result = validateLetterFields({
    creditorName: "",
    debtorName: "北京",
    caseNumber: "案件",
    courtName: "",
    addressBlock: "",
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.creditorName); // missing
  assert.ok(result.errors.debtorName); // unsupported characters
  assert.ok(result.errors.caseNumber); // unsupported characters
});
