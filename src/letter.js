import { formatCurrency, formatDateLong, formatDays } from "./format.js";

/**
 * Builds the demand letter as an ordered array of paragraphs, each itself
 * an array of lines. Kept DOM- and PDF-free so the "which optional fields
 * show up, and how" logic is unit-testable without rendering anything.
 * An empty-string element inside a paragraph array is a soft line break.
 */
export function buildDemandLetter({
  creditorName,
  debtorName,
  caseNumber,
  courtName,
  addressBlock,
  stateName,
  citation,
  principal,
  judgmentDate,
  asOfDate,
  method,
  days,
  interest,
  total,
}) {
  const paragraphs = [];

  const heading = [formatDateLong(asOfDate)];
  if (courtName) heading.push(courtName);
  if (addressBlock) {
    for (const line of addressBlock.split("\n")) {
      const trimmed = line.trim();
      if (trimmed) heading.push(trimmed);
    }
  }
  paragraphs.push(heading);

  const reLine = caseNumber
    ? `Re: Demand for Payment of Judgment — Case No. ${caseNumber}`
    : "Re: Demand for Payment of Judgment";
  paragraphs.push([reLine]);

  const salutation = debtorName ? `Dear ${debtorName}:` : "Dear Judgment Debtor:";
  paragraphs.push([salutation]);

  const creditorLabel = creditorName || "the undersigned creditor";
  paragraphs.push([
    `This letter serves as formal demand for payment of the money judgment entered ` +
      `in favor of ${creditorLabel} on ${formatDateLong(judgmentDate)} in the ` +
      `principal amount of ${formatCurrency(principal)}.`,
  ]);

  paragraphs.push([
    `Under ${stateName}'s governing statute (${citation}), post-judgment interest accrues ` +
      `on ${method === "compound" ? "a compound" : "a simple"} basis. As of ` +
      `${formatDateLong(asOfDate)}, ${formatDays(days)} have elapsed since entry of ` +
      `judgment, producing accrued interest of ${formatCurrency(interest)}.`,
  ]);

  paragraphs.push([
    `Principal: ${formatCurrency(principal)}`,
    `Accrued interest: ${formatCurrency(interest)}`,
    `Total due as of ${formatDateLong(asOfDate)}: ${formatCurrency(total)}`,
  ]);

  paragraphs.push([
    `Demand is hereby made for payment in full of ${formatCurrency(total)} within ` +
      `fourteen (14) days of the date of this letter. Interest will continue to accrue ` +
      `on the unpaid balance until paid in full. Failure to remit payment may result in ` +
      `further collection action.`,
  ]);

  paragraphs.push(["Sincerely,", "", creditorLabel]);

  return paragraphs;
}
