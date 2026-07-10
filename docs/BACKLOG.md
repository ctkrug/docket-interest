# Backlog — Docket Interest

Epics are ordered so the wow moment (a live, correct interest calculation) lands first. All
stories start unchecked; check them off as BUILD runs land them.

## Epic 1 — Core calculator

### [x] 1.1 Live simple/compound judgment interest calculator — **the wow moment**
A state picker plus judgment-amount and judgment-date inputs drive a live running total,
computed with that state's actual simple-or-compound rule via `calculateJudgmentInterest`.

- Selecting a state and entering a principal and judgment date shows a running total that
  updates within 100ms of any input change — no submit button needed to see it move.
- Selecting a compounding state (e.g. Kentucky) and a simple-interest state at the same nominal
  rate, principal, and duration (>1 year) produces two different totals, proving the
  method actually branches rather than defaulting to simple everywhere.
- The selected state's rate (or rate description) and governing statute citation are visibly
  displayed next to the total.

### [x] 1.2 All-50-states + DC sourced interest-rate data table
`src/data/states.js` ships a complete, sourced data table: every state + DC gets a rate (or rate
formula), a `method` of `"simple"` or `"compound"`, and a statute citation.

- The data module exports exactly 51 entries (50 states + DC), each with `rate`, `method`, and
  `citation` fields populated — none left as placeholder/TODO text.
- Every entry whose rate is formula-based or periodically reset (e.g. tied to a Treasury yield
  or prime rate) is flagged with a `rateType` of `"variable"` and a `lastVerified` date, rather
  than being presented as a permanent flat number.

### [x] 1.3 Input validation and edge cases
- Entering a zero or negative judgment amount shows an inline error message and does not throw
  or render `NaN`/`Infinity` anywhere on the page.
- Entering a judgment date after the as-of date shows an inline error instead of computing
  negative interest.
- With no state selected, the total area shows a clear "select a state" prompt instead of
  silently computing $0.

### [x] 1.4 As-of date control
- The as-of date input defaults to the current date on load and the total recalculates
  immediately when the user changes it.
- Choosing an as-of date earlier than the judgment date is blocked with an inline validation
  message (covered by the same guard as 1.3).

### [x] 1.5 Design polish — the intake card and ledger panel
Apply `docs/DESIGN.md`'s paper-and-ink direction to the calculator itself: styled inputs with
themed focus/hover/active states, the monospace ledger total with its digit ink-flash on change,
and the two-column desk layout at 1440px collapsing cleanly to a stacked layout at 390px.

- Every input (state select, amount, date) has a visible custom focus ring and hover state —
  no unstyled native form controls.
- The running total uses `--font-mono` and visibly flashes (or, under
  `prefers-reduced-motion`, updates instantly with no flash) when it changes.

## Epic 2 — Demand letter PDF

### [x] 2.1 One-click demand letter PDF generation
A "Generate demand letter" button renders a jsPDF document with creditor name, debtor name,
judgment amount, judgment date, computed interest, and total due.

- Clicking the button with the required fields filled produces a downloadable PDF containing
  all six of those values, matching the on-screen calculation.
- Leaving optional fields empty (see 2.2) does not prevent generation or throw an error.

### [x] 2.2 Optional letter detail fields
Case number, court name, and a mailing address block are optional inputs that flow into the PDF
when present.

- Filling in case number/court/address populates the corresponding line(s) on the generated PDF.
- Leaving any of these fields blank cleanly omits that line from the PDF layout — no
  "undefined", empty brackets, or stray blank line where the field would have been.

### [x] 2.3 Print-friendly single-page PDF layout
- A demand letter generated with all fields filled renders on exactly one US Letter page.
- Margins and font sizes keep all text within the printable area at 100% print scale — no
  clipped lines at the page edge.

### [x] 2.4 Design polish — the demand letter preview
The on-screen preview of the letter (before download) gets the signature dog-eared paper corner
(`clip-path`) from `docs/DESIGN.md`, and the generate button is styled as the wax-seal circle.

- The preview card visually reads as a physical page (paper texture/shadow, dog-eared corner),
  not a plain white `<div>`.
- The generate button has a distinct pressed/active state (scale-down + spring-back) on click.

## Epic 3 — Trust, responsiveness & accessibility

### [x] 3.1 Statute citations, "last verified" dating, and legal disclaimer
- Every calculation result shows the statute citation and a "rates last verified" date for the
  selected state, sourced from the data in 1.2.
- A persistent, visible disclaimer states the tool is a calculation aid, not legal advice, and
  that rates should be confirmed against current law before relying on them.

### [x] 3.2 Responsive layout at 390 / 768 / 1440
- At 390px width, the intake card and ledger panel stack vertically with no horizontal scroll
  and no overlapping elements.
- At 1440px width, the two-column layout fills at least 60% of the viewport height with the
  calculator as the dominant element, per `docs/DESIGN.md`'s layout intent.

### [x] 3.3 Keyboard and screen-reader accessibility pass
- Every interactive control (select, inputs, buttons) is reachable and operable via keyboard
  alone, in a sensible tab order, with visible focus indicators.
- The live running total is exposed via an ARIA live region so a screen reader announces updates
  as the user types.

### [x] 3.4 Design self-review against docs/DESIGN.md
Run the D3 design self-review checklist (resize/squint/tab-through/click-through) and fix
anything that doesn't match the paper-and-ink direction before calling v1 done.

- The shipped page is checked at 390/768/1440px and against every anti-generic ban in the design
  standard, with any failures fixed before this story is checked off.
- The favicon and wordmark match `docs/DESIGN.md` (the "§" monogram favicon, Playfair Display
  wordmark) rather than a default/generic icon.
