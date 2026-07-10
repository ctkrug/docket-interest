import { jsPDF } from "jspdf";

const PAGE_WIDTH_IN = 8.5;
const PAGE_HEIGHT_IN = 11;
const MARGIN_IN = 1;
const CANDIDATE_FONT_SIZES = [11, 10, 9, 8];
const LINE_HEIGHT_FACTOR = 1.5; // relative to font size, converted pt -> in

function measure(doc, paragraphs, fontSize, usableWidthIn) {
  doc.setFontSize(fontSize);
  const lineHeightIn = (fontSize * LINE_HEIGHT_FACTOR) / 72;
  let lineCount = 0;
  for (const paragraph of paragraphs) {
    for (const line of paragraph) {
      lineCount += line === "" ? 1 : doc.splitTextToSize(line, usableWidthIn).length;
    }
    lineCount += 1; // spacing after each paragraph
  }
  return { lineCount, lineHeightIn };
}

/**
 * Renders demand-letter paragraphs (see src/letter.js) onto a US Letter
 * page, shrinking the font within a readable range if the content would
 * otherwise overflow (BACKLOG 2.3). Realistic letters always fit on one
 * page; pathologically long input (e.g. a pasted-in essay as a name) still
 * paginates rather than drawing text past the bottom margin, so nothing is
 * ever silently lost off the printable page.
 */
export function generateDemandLetterPdf(paragraphs) {
  const doc = new jsPDF({ unit: "in", format: "letter" });
  doc.setFont("helvetica", "normal");
  const usableWidthIn = PAGE_WIDTH_IN - MARGIN_IN * 2;
  const usableHeightIn = PAGE_HEIGHT_IN - MARGIN_IN * 2;

  let chosenFontSize = CANDIDATE_FONT_SIZES[CANDIDATE_FONT_SIZES.length - 1];
  let chosenLineHeightIn = 0;
  for (const fontSize of CANDIDATE_FONT_SIZES) {
    const { lineCount, lineHeightIn } = measure(doc, paragraphs, fontSize, usableWidthIn);
    chosenLineHeightIn = lineHeightIn;
    if (lineCount * lineHeightIn <= usableHeightIn) {
      chosenFontSize = fontSize;
      break;
    }
  }

  doc.setFontSize(chosenFontSize);
  const pageBottomIn = MARGIN_IN + usableHeightIn;
  let y = MARGIN_IN + chosenLineHeightIn;

  function writeLine(text) {
    if (y > pageBottomIn) {
      doc.addPage();
      y = MARGIN_IN + chosenLineHeightIn;
    }
    doc.text(text, MARGIN_IN, y);
    y += chosenLineHeightIn;
  }

  for (const paragraph of paragraphs) {
    for (const line of paragraph) {
      if (line === "") {
        y += chosenLineHeightIn;
        continue;
      }
      for (const wrapped of doc.splitTextToSize(line, usableWidthIn)) {
        writeLine(wrapped);
      }
    }
    y += chosenLineHeightIn;
  }

  return doc;
}
