# Vision — Docket Interest

## The problem

Winning a money judgment is the easy part; collecting it is where most self-represented
litigants and small creditors get stuck. Interest keeps accruing on an unpaid judgment from the
day it's entered until the day it's paid, at a rate and method (simple or compound) fixed by the
statute of the state where the judgment was entered — and that statute varies by state in ways
that are easy to get wrong:

- Rates range from a flat percentage (e.g. Rhode Island's 12%) to a formula pegged to a Treasury
  yield or prime rate reset annually or quarterly (e.g. Idaho, Nebraska).
- Most states accrue **simple** interest on the original principal only — but a meaningful
  minority (Kentucky, Michigan, Colorado's default rate, Oklahoma, South Carolina's judgment
  rate) **compound annually**, and using the wrong method understates or overstates the amount
  owed by a real amount over a multi-year judgment.
- Getting this number right matters: it's what a creditor demands, what a debtor is asked to pay,
  and potentially what a court is asked to enforce.

Commercial tools that handle this correctly (e.g. Margill) are built for law firms and priced
accordingly. A judgment creditor collecting a few thousand dollars on their own has no equivalent
— usually just a spreadsheet and a guess.

## Who it's for

Self-represented litigants, small landlords, small-claims plaintiffs, and small creditors who
have a judgment in hand and need to know — and eventually demand — what's actually owed today.
Secondarily, paralegals and solo practitioners who want a fast sanity check without opening a
paid product.

## The core idea

Pick a state. Type in the judgment amount and the date it was entered. Watch the correct
simple-or-compound interest accrue in real time, computed against that state's actual statutory
rate. Click one button to get a ready-to-mail demand letter PDF showing the full computation.

Nothing here requires a login, a server, or payment — it's a static page that ships the interest
rules for all 50 states + DC as data, and does every calculation in the browser.

## Key design decisions

- **Static and serverless.** The state interest-rate table ships as a data module in the JS
  bundle; there's no backend, no database, and no user data ever leaves the browser. This keeps
  the tool free to run forever and trivially deployable to a static host or subpath.
- **Simple vs. compound is first-class, not an edge case.** Every state entry in the data table
  carries an explicit `method` ("simple" or "compound") and the governing statute citation, and
  the calculation engine (`src/interest.js`) dispatches on it rather than assuming simple
  interest everywhere, which is the mistake a naive calculator would make.
- **Rates are marked with their volatility, not hidden behind a false precision.** Some states'
  rates are fixed by statute for years; others reset annually, semi-annually, or quarterly off a
  Treasury/prime-rate formula. The data model records which kind of rate each state has (and the
  date it was last verified) so the UI can be honest about a formula-based rate needing a refresh,
  instead of presenting every number as equally current forever.
- **The demand letter is a first-class output, not an afterthought.** The wow moment is reaching
  a mailable PDF in one click — jsPDF renders the creditor/debtor names, judgment details, and
  the interest computation onto a formatted letter, because a number on a screen is much less
  useful to someone chasing a debt than a letter they can print and send.
- **Legal-accuracy posture: sourced, not authoritative.** Every rate ships with its statute
  citation so a user (or their attorney) can verify it against current law; the tool is
  explicit that it's a calculation aid, not legal advice, since rates change and some states'
  rules turn on judgment type (contract vs. tort vs. consumer debt) in ways a general calculator
  can't fully resolve on its own.

## What "v1 done" looks like

- A user can pick any of the 50 states + DC, enter a principal and judgment date, and see a
  live, correctly-computed running total (simple or compound per that state's rule) with the
  day count, per-diem rate, and statute citation displayed alongside it.
- Clicking "Generate demand letter" produces a formatted PDF with the creditor/debtor names,
  case details, judgment amount, judgment date, computed interest, and total due — ready to
  print and mail.
- The state interest-rate data table covers all 50 states + DC with a rate (or rate formula
  description), simple/compound method, and statute citation for each, matching the sourced
  research in `docs/BACKLOG.md`'s data epic.
- The app is a single static build (`npm run build` → `dist/`) with relative asset paths,
  deployable to `apps.charliekrug.com/docket-interest` or any static host with no configuration.
- The page follows `docs/DESIGN.md`'s paper-and-ink direction end to end — this is a calculator
  that looks and feels like a legal instrument, not a generic form.
