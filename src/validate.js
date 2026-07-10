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
