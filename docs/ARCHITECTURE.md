# Architecture — Docket Interest

A static, client-only web app: Vite bundles vanilla ES modules, there's no backend, and every
calculation happens in the browser. This map is for orienting quickly in a fresh session — see
`docs/VISION.md` for why, `docs/BACKLOG.md` for what's left, and `docs/DESIGN.md` for the visual
direction.

## Module map

```
index.html            Entry HTML: fonts, favicon, mounts <div id="app"> and loads src/main.js
src/
  main.js             Bootstrap only: mountApp() then mountLetterSection()
  app.js               Intake card + ledger panel: renders the shell, wires the state/amount/
                       date inputs to validate.js + interest.js, paints the running total with
                       its digit ink-flash, and exposes { getLatestResult, subscribe } so other
                       modules can react to the current calculation
  letter-section.js    Demand-letter form + live text preview + PDF download button; subscribes
                       to app.js's result stream so the letter always mirrors the ledger
  interest.js          Pure math: daysBetween, simpleInterest, compoundInterest,
                       calculateJudgmentInterest (dispatches on method)
  validate.js          Pure validation: validateInputs (intake fields), validateLetterFields
                       (creditor/debtor names)
  letter.js            Pure content builder: buildDemandLetter() turns calculator state into an
                       array of letter paragraphs, cleanly omitting blank optional fields
  pdf.js               Wraps jsPDF: generateDemandLetterPdf(paragraphs) measures line count at a
                       few candidate font sizes and picks the largest that fits one US Letter page
  format.js            formatCurrency, formatDays, formatDateLong
  data/states.js       The 51-entry (50 states + DC) sourced interest-rate table + getState()
  styles.css           All styling; tokens match docs/DESIGN.md's paper-and-ink direction
```

## Data flow

1. `app.js` reads the four intake fields on every `input`/`blur`, runs `validateInputs`, and
   (if valid) calls `getState()` + `calculateJudgmentInterest()` to get `{ days, interest, total }`.
2. The result is painted into the ledger panel and stored as `latestResult`; a subscribed
   listener (set by `letter-section.js`) is notified via `onResultChange`.
3. `letter-section.js` pulls `app.getLatestResult()` on every notification and on every letter-
   field keystroke, rebuilding the preview from `buildDemandLetter()`.
4. Clicking "Generate demand letter" validates the two required names, builds the same
   paragraphs, and hands them to `generateDemandLetterPdf()`, which triggers a browser download.

Pure logic (`interest.js`, `validate.js`, `letter.js`, `pdf.js`, `format.js`, `data/states.js`)
is unit-tested with `node:test` and has no DOM dependency. `app.js`/`letter-section.js`/`main.js`
are DOM glue and are instead covered by manual/Playwright verification (see the design
self-review note in `docs/BACKLOG.md` 3.4) rather than unit tests.

## Gotchas

- **`hidden` + a `display` override on the same class cancels the hidden attribute.** The browser's
  `[hidden] { display: none }` UA rule has the same specificity as an author class selector, so
  `.letter-body { display: grid }` silently defeated `element.hidden = true` until a
  `.letter-body[hidden] { display: none }` override was added. Any future `hidden`-toggled element
  that also sets its own `display` needs the same override.
- **Four states have `rate: null`** (IA, ME, MS, WA) — their rate is formula/discretion-based with
  no single deterministic number. `app.js` detects `state.rate === null` and shows an explanatory
  message instead of computing (avoids `NaN` on screen).
- **`as-of-date` defaults to the local "today"**, computed manually from `Date` getters rather than
  `toISOString()`, so the default doesn't shift a day for users west of UTC near midnight.

## Run / test / build

```
npm run dev       # Vite dev server
npm test          # node --test test/  (pure-logic unit tests)
npm run lint      # eslint .
npm run build     # → dist/, relative-path static build for a subpath deploy
npm run preview   # serve dist/ locally
```
