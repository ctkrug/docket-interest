import { buildDemandLetter } from "./letter.js";
import { validateLetterFields } from "./validate.js";

const LETTER_FIELD_IDS = ["creditor-name", "debtor-name", "case-number", "court-name", "address-block"];

const ERROR_KEY_BY_FIELD = {
  "creditor-name": "creditorName",
  "debtor-name": "debtorName",
  "case-number": "caseNumber",
  "court-name": "courtName",
  "address-block": "addressBlock",
};

/**
 * Mounts the demand-letter form + live preview + PDF download into `mount`,
 * reacting to the calculator's latest result via `app` (the handle returned
 * by mountApp: { getLatestResult, subscribe }).
 */
export function mountLetterSection(mount, app) {
  mount.innerHTML = renderLetterShell();

  const els = {};
  for (const id of LETTER_FIELD_IDS) {
    els[id] = document.getElementById(id);
  }
  els.hint = document.getElementById("letter-hint");
  els.body = document.getElementById("letter-body");
  els.preview = document.getElementById("letter-preview");
  els.generateBtn = document.getElementById("generate-btn");
  els.downloadStatus = document.getElementById("download-status");

  function letterFieldValues() {
    return {
      creditorName: els["creditor-name"].value,
      debtorName: els["debtor-name"].value,
      caseNumber: els["case-number"].value,
      courtName: els["court-name"].value,
      addressBlock: els["address-block"].value,
    };
  }

  function paintFieldErrors(errors) {
    for (const id of Object.keys(ERROR_KEY_BY_FIELD)) {
      const key = ERROR_KEY_BY_FIELD[id];
      const message = errors[key] || "";
      document.getElementById(`${id}-error`).textContent = message;
      document.getElementById(`field-${id}`).classList.toggle("field--invalid", Boolean(message));
    }
  }

  function currentParagraphs() {
    const result = app.getLatestResult();
    if (!result) return null;
    const fields = letterFieldValues();
    return buildDemandLetter({
      ...fields,
      stateName: result.state.name,
      citation: result.state.citation,
      principal: result.principal,
      judgmentDate: result.inputs.judgmentDate,
      asOfDate: result.inputs.asOfDate,
      method: result.state.method,
      days: result.result.days,
      interest: result.result.interest,
      total: result.result.total,
    });
  }

  function renderPreview() {
    const paragraphs = currentParagraphs();
    if (!paragraphs) {
      els.preview.innerHTML = "";
      return;
    }
    els.preview.innerHTML = paragraphs
      .map(
        (paragraph) =>
          `<p>${paragraph
            .map((line) => (line === "" ? "<br />" : escapeHtml(line)))
            .join("<br />")}</p>`,
      )
      .join("");
  }

  /**
   * Clears/updates only errors already showing, as the user types — never
   * introduces a new error on a field they haven't tried to submit yet
   * (matches app.js's don't-show-until-touched philosophy). Without this, a
   * field the user just fixed stayed marked invalid until the next click.
   */
  function reviseShownErrors() {
    const { errors } = validateLetterFields(letterFieldValues());
    for (const id of Object.keys(ERROR_KEY_BY_FIELD)) {
      const errorEl = document.getElementById(`${id}-error`);
      if (!errorEl.textContent) continue;
      const message = errors[ERROR_KEY_BY_FIELD[id]] || "";
      errorEl.textContent = message;
      document.getElementById(`field-${id}`).classList.toggle("field--invalid", Boolean(message));
    }
  }

  function refresh() {
    const result = app.getLatestResult();
    if (!result) {
      els.hint.hidden = false;
      els.body.hidden = true;
      return;
    }
    els.hint.hidden = true;
    els.body.hidden = false;
    renderPreview();
  }

  for (const id of LETTER_FIELD_IDS) {
    els[id].addEventListener("input", () => {
      renderPreview();
      reviseShownErrors();
    });
  }

  els.generateBtn.addEventListener("click", async () => {
    const result = app.getLatestResult();
    if (!result) return;

    const fields = letterFieldValues();
    const { valid, errors } = validateLetterFields(fields);
    paintFieldErrors(errors);
    if (!valid) {
      // Clear a leftover "downloaded" message from an earlier successful
      // attempt so a failed retry can't be mistaken for a new download.
      els.downloadStatus.textContent = "";
      return;
    }

    const paragraphs = currentParagraphs();
    // jsPDF (and its optional html2canvas/dompurify deps) is heavy and only
    // needed once someone actually generates a letter, so it's split into a
    // lazy chunk here rather than loaded with the calculator on first paint.
    const { generateDemandLetterPdf } = await import("./pdf.js");
    const doc = generateDemandLetterPdf(paragraphs);
    doc.save(`demand-letter-${result.state.code}.pdf`);
    els.downloadStatus.textContent = "Demand letter downloaded.";
  });

  app.subscribe(refresh);
  refresh();
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function letterField(id, label, inputHtml, optional) {
  return `
    <div class="field" id="field-${id}">
      <label for="${id}">${label}${optional ? ' <span class="optional-tag">(optional)</span>' : ""}</label>
      ${inputHtml}
      <p class="field-error" id="${id}-error" role="alert"></p>
    </div>
  `;
}

function renderLetterShell() {
  return `
    <section class="letter-section" aria-labelledby="letter-heading">
      <h2 id="letter-heading">Demand letter</h2>
      <p class="letter-hint" id="letter-hint">
        Fill in a valid judgment above to generate a demand letter.
      </p>
      <div class="letter-body" id="letter-body" hidden>
        <form class="letter-form" id="letter-form">
          ${letterField(
            "creditor-name",
            "Creditor name",
            `<input id="creditor-name" class="control" type="text" autocomplete="off" />`,
          )}
          ${letterField(
            "debtor-name",
            "Debtor name",
            `<input id="debtor-name" class="control" type="text" autocomplete="off" />`,
          )}
          ${letterField(
            "case-number",
            "Case number",
            `<input id="case-number" class="control" type="text" autocomplete="off" />`,
            true,
          )}
          ${letterField(
            "court-name",
            "Court name",
            `<input id="court-name" class="control" type="text" autocomplete="off" />`,
            true,
          )}
          ${letterField(
            "address-block",
            "Debtor mailing address",
            `<textarea id="address-block" class="control" rows="3"></textarea>`,
            true,
          )}
          <button type="button" id="generate-btn" class="seal-btn">
            <span>Generate<br />demand letter</span>
          </button>
          <p id="download-status" class="download-status" role="status"></p>
        </form>
        <div class="letter-preview-wrap">
          <div
            class="letter-preview"
            id="letter-preview"
            aria-live="polite"
            aria-label="Demand letter preview"
          ></div>
        </div>
      </div>
    </section>
  `;
}
