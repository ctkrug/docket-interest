# Docket Interest

**▶ Live demo — [apps.charliekrug.com/docket-interest](https://apps.charliekrug.com/docket-interest/)**

[![CI](https://github.com/ctkrug/docket-interest/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/docket-interest/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-8a1f2b.svg)](LICENSE)

Judgment interest, calculated right for every state. A free judgment interest calculator for all
50 states and DC that uses each state's real statutory rate and its correct simple-or-compound
rule, then turns the result into a printable demand letter.

## Who it's for

You won a money judgment and now you have to collect it. Maybe you're a small landlord, a
small-claims plaintiff, or a creditor chasing a few thousand dollars on your own. The balance
keeps earning interest from the day the judgment was entered, at a rate your state fixes by
statute, and a handful of states compound that interest every year. Get the rate or the method
wrong and the number you hand a court or a debtor is wrong. The commercial tools that get it right
are built and priced for law firms. Docket Interest is the free alternative.

## How it works

1. Pick your state.
2. Enter the judgment amount and the date it was entered.
3. Watch the accrued interest and total due update as you type, with the day count, the per-diem
   rate, and the governing statute shown alongside.
4. Click once to download a formatted demand letter built from the same numbers.

Everything runs in your browser. There is no login, no server, and no data leaves the page.

## Sample demand letter

The one-click PDF is a ready-to-mail letter. Filling in a $10,000 Kentucky judgment (a state that
compounds annually) entered March 15, 2023 produces:

```
July 10, 2026
Fayette Circuit Court
455 Industrial Pkwy
Lexington, KY 40511

Re: Demand for Payment of Judgment — Case No. 2023-CV-04817

Dear Northgate Auto LLC:

This letter serves as formal demand for payment of the money judgment entered
in favor of Maria Alvarez on March 15, 2023 in the principal amount of $10,000.00.

Under Kentucky's governing statute (Ky. Rev. Stat. Ann. § 360.040), post-judgment
interest accrues on a compound basis. As of July 10, 2026, 1213 days have elapsed
since entry of judgment, producing accrued interest of $2,141.18.

Principal: $10,000.00
Accrued interest: $2,141.18
Total due as of July 10, 2026: $12,141.18

Demand is hereby made for payment in full of $12,141.18 within fourteen (14) days
of the date of this letter. Interest will continue to accrue on the unpaid balance
until paid in full. Failure to remit payment may result in further collection action.

Sincerely,

Maria Alvarez
```

## What it does

- **Every state's rule, not a one-size guess.** All 50 states and DC ship with their post-judgment
  rate (or rate formula), simple-vs-compound method, and the governing statute citation, sourced
  from primary and secondary references in [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md).
- **Compound interest is handled correctly.** Colorado, Kentucky, Michigan, Oklahoma, South
  Carolina, and Texas compound annually; the calculator applies each state's method automatically
  and the balance compounds year over year instead of accruing flat.
- **A live running total.** Interest, total due, elapsed days, and the daily per-diem update on
  every keystroke, so you can check the figure for any as-of date.
- **A one-click demand letter.** The generated PDF lays out the creditor and debtor names, case
  details, judgment amount, and the full interest computation on a US Letter page, ready to print
  and mail.
- **Honest about volatility.** Rates tied to a Treasury yield or the prime rate are marked variable
  and stamped with the date they were last verified, so you know which numbers to confirm before a
  filing.

## Running locally

```
npm install
npm run dev       # local dev server
npm test          # unit tests (node:test)
npm run lint      # eslint
npm run build     # static build → site/
```

The build is a single static bundle with relative asset paths, so it drops onto any static host or
subpath with no configuration.

## Stack

- Vanilla JavaScript (ES modules), bundled with [Vite](https://vitejs.dev/).
- [jsPDF](https://github.com/parallax/jsPDF) for client-side PDF generation, loaded lazily so the
  calculator itself stays light.
- No backend, no database, no build-time secrets. The interest-rate table ships as a data module in
  the bundle.

See [`docs/VISION.md`](docs/VISION.md) for the why, [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
for a map of the code, and [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) for the statute citations
behind every rate.

## Legal note

Docket Interest is a calculation aid, not legal advice. Statutory interest rates are sourced from
public state law but change over time and can vary by judgment type (contract, tort, consumer
debt). Always confirm the applicable rate against the current statute or with an attorney before
relying on a number for a real filing.

## License

MIT. See [`LICENSE`](LICENSE).

---

More of Charlie's projects → [apps.charliekrug.com](https://apps.charliekrug.com)
