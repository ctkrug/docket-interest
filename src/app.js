import { calculateJudgmentInterest, perDiemAmount } from "./interest.js";
import { formatCurrency, formatDays, formatDateLong } from "./format.js";
import { STATES, getState } from "./data/states.js";
import { validateInputs } from "./validate.js";

function todayIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const FIELD_IDS = ["state", "principal", "judgment-date", "as-of-date"];

const ERROR_KEY_BY_FIELD = {
  state: "stateCode",
  principal: "principal",
  "judgment-date": "judgmentDate",
  "as-of-date": "asOfDate",
};

/**
 * Mounts the whole app (intake card, ledger panel, demand-letter section)
 * into `root`. DOM-only glue: all the math and copy come from the pure
 * modules in src/ so this file's job is reading inputs, calling them, and
 * painting the result.
 */
export function mountApp(root) {
  root.innerHTML = renderShell();

  const els = {};
  for (const id of FIELD_IDS) {
    els[id] = document.getElementById(id);
  }
  els.ledgerEmpty = document.getElementById("ledger-empty");
  els.ledgerResult = document.getElementById("ledger-result");
  els.ledgerTotal = document.getElementById("ledger-total");
  els.ledgerDays = document.getElementById("ledger-days");
  els.ledgerPerDiem = document.getElementById("ledger-perdiem");
  els.ledgerMethod = document.getElementById("ledger-method");
  els.ledgerCitation = document.getElementById("ledger-citation");
  els.ledgerVerified = document.getElementById("ledger-verified");
  els.ledgerFormula = document.getElementById("ledger-formula");

  populateStateOptions(els.state);
  els["as-of-date"].value = todayIso();

  let latestResult = null;
  let onResultChange = () => {};

  function currentInputs() {
    return {
      stateCode: els.state.value,
      principal: els.principal.value,
      judgmentDate: els["judgment-date"].value,
      asOfDate: els["as-of-date"].value,
    };
  }

  const touched = new Set();

  function paintErrors(errors) {
    for (const id of FIELD_IDS) {
      const key = ERROR_KEY_BY_FIELD[id];
      const message = touched.has(id) ? errors[key] || "" : "";
      const errorEl = document.getElementById(`${id}-error`);
      const fieldEl = document.getElementById(`field-${id}`);
      errorEl.textContent = message;
      fieldEl.classList.toggle("field--invalid", Boolean(message));
    }
  }

  function recalculate() {
    const inputs = currentInputs();
    const { valid, errors } = validateInputs(inputs);
    paintErrors(errors);

    if (!inputs.stateCode) {
      showEmpty("Select a state to begin.");
      latestResult = null;
      onResultChange(null);
      return;
    }

    if (!valid) {
      showEmpty("Fix the highlighted field to see the running total.");
      latestResult = null;
      onResultChange(null);
      return;
    }

    const state = getState(inputs.stateCode);

    if (state.rate === null) {
      showEmpty(
        `${state.name}'s rate isn't a single fixed number (${state.rateDescription}). ` +
          `Consult the statute (${state.citation}) directly for this judgment.`,
      );
      latestResult = null;
      onResultChange(null);
      return;
    }

    const principal = Number(inputs.principal);
    const result = calculateJudgmentInterest({
      principal,
      rate: state.rate,
      method: state.method,
      startDate: inputs.judgmentDate,
      endDate: inputs.asOfDate,
    });

    showResult(state, principal, result);
    latestResult = { state, principal, inputs, result };
    onResultChange(latestResult);
  }

  function showEmpty(message) {
    els.ledgerEmpty.textContent = message;
    els.ledgerEmpty.hidden = false;
    els.ledgerResult.hidden = true;
  }

  function showResult(state, principal, result) {
    els.ledgerEmpty.hidden = true;
    els.ledgerResult.hidden = false;

    setTotalText(els.ledgerTotal, formatCurrency(result.total));
    els.ledgerDays.textContent = formatDays(result.days);
    const perDiem = perDiemAmount({ principal, rate: state.rate });
    els.ledgerPerDiem.textContent = `${formatCurrency(perDiem)}/day`;
    els.ledgerMethod.textContent =
      state.method === "compound" ? "Compound (annual)" : "Simple";
    els.ledgerCitation.textContent = state.citation;
    els.ledgerFormula.textContent = state.rateDescription;
    els.ledgerVerified.textContent = `Rate last verified ${formatDateLong(state.lastVerified)}.`;
  }

  function setTotalText(container, text) {
    const previous = Array.from(container.children).map((s) => s.textContent);
    container.innerHTML = "";
    const chars = text.split("");
    const shouldFlash = previous.length > 0 && !prefersReducedMotion();
    const samePositionCount =
      previous.length === chars.length ? chars.length : 0;

    chars.forEach((ch, i) => {
      const span = document.createElement("span");
      span.textContent = ch;
      span.className = "ledger-digit";
      const changed = samePositionCount === 0 || previous[i] !== ch;
      if (shouldFlash && changed) {
        span.classList.add("flash");
      }
      container.appendChild(span);
    });
  }

  for (const id of FIELD_IDS) {
    els[id].addEventListener("input", () => {
      if (els[id].value.trim() !== "") touched.add(id);
      recalculate();
    });
    els[id].addEventListener("blur", () => {
      touched.add(id);
      recalculate();
    });
  }

  recalculate();

  return {
    getLatestResult: () => latestResult,
    subscribe: (listener) => {
      onResultChange = listener;
    },
  };
}

function populateStateOptions(select) {
  const sorted = [...STATES].sort((a, b) => a.name.localeCompare(b.name));
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a state…";
  select.appendChild(placeholder);

  for (const state of sorted) {
    const option = document.createElement("option");
    option.value = state.code;
    option.textContent = state.name;
    select.appendChild(option);
  }
}

function field(id, label, inputHtml) {
  return `
    <div class="field" id="field-${id}">
      <label for="${id}">${label}</label>
      ${inputHtml}
      <p class="field-error" id="${id}-error" role="alert"></p>
    </div>
  `;
}

function renderShell() {
  return `
    <div class="page">
      <header class="masthead">
        <div class="wordmark"><span class="wordmark-glyph">§</span>Docket Interest</div>
        <p class="tagline">A free, all-50-state judgment interest calculator with a
          one-click printable demand letter.</p>
      </header>

      <main class="desk">
        <section class="intake-card" aria-labelledby="intake-heading">
          <h2 id="intake-heading">Judgment details</h2>
          ${field(
            "state",
            "State",
            `<select id="state" class="control"></select>`,
          )}
          ${field(
            "principal",
            "Judgment amount",
            `<input id="principal" class="control" type="number" inputmode="decimal"
              min="0" step="0.01" placeholder="0.00" autocomplete="off" />`,
          )}
          ${field(
            "judgment-date",
            "Judgment date",
            `<input id="judgment-date" class="control" type="date" />`,
          )}
          ${field(
            "as-of-date",
            "As of",
            `<input id="as-of-date" class="control" type="date" />`,
          )}
        </section>

        <section class="ledger-panel" aria-labelledby="ledger-heading">
          <h2 id="ledger-heading" class="visually-hidden">Running total</h2>
          <div id="ledger-empty" class="ledger-empty" role="status"></div>
          <div id="ledger-result" class="ledger-result" hidden>
            <div class="ledger-total" id="ledger-total" role="status" aria-live="polite"></div>
            <dl class="ledger-meta">
              <div><dt>Days elapsed</dt><dd id="ledger-days"></dd></div>
              <div><dt>Per-diem rate</dt><dd id="ledger-perdiem"></dd></div>
              <div><dt>Method</dt><dd id="ledger-method"></dd></div>
              <div><dt>Statute</dt><dd id="ledger-citation"></dd></div>
            </dl>
            <p class="ledger-formula" id="ledger-formula"></p>
            <p class="ledger-verified" id="ledger-verified"></p>
          </div>
        </section>
      </main>

      <div id="letter-mount"></div>

      <p class="disclaimer">
        Docket Interest is a calculation aid, not legal advice. Statutory interest rates
        change and can vary by judgment type; confirm the applicable rate against current
        law or with an attorney before relying on a number for a real filing.
      </p>
    </div>
  `;
}
