// The demand-letter PDF is rendered with jsPDF's standard Helvetica font, which
// only supports the WinAnsi (Windows-1252) character set. A character outside
// it doesn't throw or vanish — jsPDF silently maps it to a different, unrelated
// glyph, corrupting a name on a legal document. This is the standard Windows-1252
// code-page table, not a jsPDF-specific quirk, so it's safe to hardcode.
const WIN_ANSI_EXTRA_CODEPOINTS = new Set([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160,
  0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014,
  0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178,
]);

function isWinAnsiCodePoint(codePoint) {
  if (codePoint === 0x09 || codePoint === 0x0a || codePoint === 0x0d) return true; // tab/LF/CR
  if (codePoint >= 0x20 && codePoint <= 0x7e) return true; // ASCII printable
  if (codePoint >= 0xa0 && codePoint <= 0xff) return true; // Latin-1 Supplement
  return WIN_ANSI_EXTRA_CODEPOINTS.has(codePoint);
}

/**
 * True if `text` contains a character the demand-letter PDF can't render
 * faithfully (see WIN_ANSI_EXTRA_CODEPOINTS above).
 */
export function hasUnsupportedPdfCharacters(text) {
  return Array.from(text).some((ch) => !isWinAnsiCodePoint(ch.codePointAt(0)));
}

/**
 * Validates the calculator's intake fields. Pure and DOM-free so the rules
 * (what counts as a usable judgment amount, what date ordering is legal)
 * are unit-testable independent of how the form renders them.
 */
export function validateInputs({ stateCode, principal, judgmentDate, asOfDate }) {
  const errors = {};

  if (!stateCode) {
    errors.stateCode = "Select a state to calculate interest.";
  }

  if (principal === "" || principal === null || principal === undefined) {
    errors.principal = "Enter the judgment amount.";
  } else if (!Number.isFinite(Number(principal)) || Number(principal) <= 0) {
    errors.principal = "Judgment amount must be a number greater than zero.";
  }

  if (!judgmentDate) {
    errors.judgmentDate = "Enter the judgment date.";
  }

  if (!asOfDate) {
    errors.asOfDate = "Enter the as-of date.";
  }

  if (judgmentDate && asOfDate && judgmentDate > asOfDate) {
    errors.asOfDate = "As-of date must be on or after the judgment date.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validates the demand-letter form's two required identity fields.
 * Case number, court, and address are optional per BACKLOG 2.2 and are
 * not checked here.
 */
export function validateLetterFields({ creditorName, debtorName }) {
  const errors = {};

  if (!creditorName || !creditorName.trim()) {
    errors.creditorName = "Enter the creditor's name.";
  }

  if (!debtorName || !debtorName.trim()) {
    errors.debtorName = "Enter the debtor's name.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
