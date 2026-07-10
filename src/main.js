import { calculateJudgmentInterest } from "./interest.js";
import { formatCurrency, formatDays } from "./format.js";
import { getState } from "./data/states.js";

// Scaffold placeholder: proves the interest engine, formatting helpers, and
// state data table are wired together end to end. The real state picker,
// live inputs, and PDF export land in BUILD per docs/BACKLOG.md — this just
// renders one worked example (a compounding state) on load.
function renderScaffold() {
  const kentucky = getState("KY");
  const example = calculateJudgmentInterest({
    principal: 10000,
    rate: kentucky.rate,
    method: kentucky.method,
    startDate: "2025-01-01",
    endDate: "2027-01-01",
  });

  const app = document.getElementById("app");
  app.innerHTML = `
    <main class="scaffold-card">
      <h1>Docket Interest</h1>
      <p>
        A free, all-50-state judgment interest calculator with correct
        simple/compound rules and a one-click printable demand letter.
        The calculator UI is scaffolded next &mdash; see
        <code>docs/BACKLOG.md</code>.
      </p>
      <p class="scaffold-ledger">
        Example: $10,000 in ${kentucky.name} (${kentucky.method}, ${kentucky.rateDescription})
        over ${formatDays(example.days)} &rarr; ${formatCurrency(example.total)}
      </p>
    </main>
  `;
}

renderScaffold();
