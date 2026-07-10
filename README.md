# Docket Interest

A free, all-50-state judgment interest calculator with correct simple/compound rules and a
one-click printable demand letter.

## Why

Winning a judgment is only step one — collecting it is step two, and step two runs on interest
that keeps accruing until the debtor pays. Commercial tools like Margill exist for law firms with
budgets; a self-represented litigant or a small creditor chasing a few thousand dollars usually
has nothing but a calculator and a guess. Every US state sets its own post-judgment interest rate
by statute, and a meaningful number of them compound annually instead of accruing simple interest
— get that distinction wrong and the number you hand a debtor (or a court) is wrong.

Docket Interest is the free alternative: pick a state, enter the judgment amount and date, and
get a statute-correct running total — plus a demand letter ready to print and mail.

## The wow moment

1. Pick your state from a dropdown.
2. Type in the judgment amount and the date it was entered.
3. Watch the accrued interest tick up in real time, computed with that state's actual
   simple-or-compound rule and statutory rate.
4. Click one button. Get a formatted, ready-to-mail demand letter PDF with the full accrual
   shown on the page.

## Features

- A sourced data table of post-judgment interest rules for all 50 states + DC: rate (or rate
  formula), simple vs. compound, and the governing statute citation.
- A live calculator: state, principal, judgment date (and optional as-of date) in; running
  total interest and grand total out, updating as you type.
- One-click demand letter generation as a PDF (via jsPDF) — creditor/debtor names, case
  number, judgment details, and the interest computation laid out for a court or collections
  recipient.
- A static, self-contained build with no server and no backend — everything runs in the
  browser, deployable to a static host.

## Stack

- Vanilla JavaScript (ES modules), bundled with [Vite](https://vitejs.dev/) for a static,
  relative-path build.
- [jsPDF](https://github.com/parallax/jsPDF) for client-side PDF generation.
- No backend, no database, no build-time secrets — the interest data table ships as a static
  JSON/JS module in the bundle.

## Status

The core calculator and demand letter are both functionally complete: pick a state, enter a
judgment amount and date, and the running total, day count, per-diem rate, and statute citation
update live; the "Generate demand letter" button downloads a single-page PDF built from the same
numbers. See [`docs/VISION.md`](docs/VISION.md) for the full plan,
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the build breakdown, [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
for a map of the codebase, and [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) for the citations
behind the state interest-rate table.

## Running locally

```
npm install
npm run dev       # local dev server
npm test          # unit tests
npm run build     # static build → dist/
```

## Legal note

Docket Interest is a calculation tool, not legal advice. Statutory interest rates and rules are
sourced from public state statutes but change over time and can vary by judgment type
(contract, tort, consumer debt); always confirm the applicable rate against the current statute
or with an attorney before relying on a number for a real filing.

## License

MIT — see [`LICENSE`](LICENSE).
