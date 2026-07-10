import { calculateJudgmentInterest } from "./interest.js";

// Scaffold placeholder: proves the interest engine is wired up end to end.
// The real state picker, live inputs, and PDF export land in BUILD per
// docs/BACKLOG.md — this just renders one worked example on load.
function renderScaffold() {
  const example = calculateJudgmentInterest({
    principal: 10000,
    rate: 9,
    method: "simple",
    startDate: "2025-01-01",
    endDate: "2026-01-01",
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
        Example: $10,000 at 9% simple over ${example.days} days &rarr;
        $${example.total.toFixed(2)}
      </p>
    </main>
  `;
}

renderScaffold();
