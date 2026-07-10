import { test } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import { validateInputs, validateLetterFields, hasUnsupportedPdfCharacters } from "../src/validate.js";

// Real callers only ever pass DOM input .value (always a string) or, for an
// unfilled optional field, undefined/empty string — never arbitrary types.
const fieldArb = fc.oneof(fc.string(), fc.constant(undefined), fc.constant(""));

test("validateInputs never throws and always returns a well-shaped result for arbitrary field text", () => {
  fc.assert(
    fc.property(fieldArb, fieldArb, fieldArb, fieldArb, (stateCode, principal, judgmentDate, asOfDate) => {
      const result = validateInputs({ stateCode, principal, judgmentDate, asOfDate });
      assert.equal(typeof result.valid, "boolean");
      assert.equal(typeof result.errors, "object");
    }),
  );
});

test("validateLetterFields never throws and always returns a well-shaped result for arbitrary field text", () => {
  fc.assert(
    fc.property(
      fieldArb,
      fieldArb,
      fieldArb,
      fieldArb,
      fieldArb,
      (creditorName, debtorName, caseNumber, courtName, addressBlock) => {
        const result = validateLetterFields({
          creditorName,
          debtorName,
          caseNumber,
          courtName,
          addressBlock,
        });
        assert.equal(typeof result.valid, "boolean");
        assert.equal(typeof result.errors, "object");
      },
    ),
  );
});

test("hasUnsupportedPdfCharacters never throws for arbitrary Unicode text", () => {
  fc.assert(
    fc.property(fc.string(), (text) => {
      assert.equal(typeof hasUnsupportedPdfCharacters(text), "boolean");
    }),
  );
});

test("hasUnsupportedPdfCharacters always accepts plain printable ASCII", () => {
  fc.assert(
    fc.property(fc.stringMatching(/^[\x20-\x7e]*$/), (text) => {
      assert.equal(hasUnsupportedPdfCharacters(text), false);
    }),
  );
});
