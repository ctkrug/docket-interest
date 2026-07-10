---
title: "Building a judgment interest calculator that gets compound interest right"
published: false
tags: javascript, webdev, sideproject, legaltech
---

I built [Docket Interest](https://apps.charliekrug.com/docket-interest/), a free judgment interest
calculator for all 50 states and DC. You pick a state, enter the judgment amount and the date it
was entered, and it shows the accrued post-judgment interest updating as you type, then generates a
printable demand letter. It runs entirely in the browser with no backend.

The idea came from a simple gap: when you win a small money judgment and have to collect it
yourself, the balance keeps earning interest at a rate your state sets by statute, and the tools
that compute this correctly are built for law firms. A spreadsheet and a guess is what most people
are left with. Here are the three problems that turned out to be more interesting than I expected.

## Simple vs compound is not an edge case

The naive version of this app multiplies principal by a rate by a fraction of a year. That is
correct for most states, but six of them (Colorado, Kentucky, Michigan, Oklahoma, South Carolina,
and Texas) compound the interest annually. Using the wrong method on a multi-year judgment is off
by real money.

I wanted the compounding to be continuous, with no jump at each anniversary. So full elapsed years
compound, and the trailing partial year accrues simple interest on the balance as of the last
anniversary:

```js
const balance = principal * (1 + rate / 100) ** fullYears;
const total = balance + balance * dailyRate * remainderDays;
```

A subtlety I missed on the first pass: the per-diem figure I show next to the total. I was dividing
the original principal by 365, but for a compounding judgment the current day's interest runs on
the compounded balance, not the principal. After two years at 6% that understates the daily accrual
by more than 10%. The fix was sharing one `balanceAtLastAnniversary` helper between the total and
the per-diem so they can never disagree.

## jsPDF silently corrupts non-Latin names

The demand letter is generated client-side with jsPDF using its standard Helvetica font. That font
only supports the WinAnsi (Windows-1252) character set. The trap is that an unsupported character
does not throw and does not vanish. jsPDF maps it to a different, unrelated glyph. A creditor named
"北京有限公司" quietly becomes mojibake on a document you are about to mail to a court.

Since this is a legal document, silently wrong is the worst outcome. So every field that flows into
the PDF is checked against the WinAnsi code page before generation, and anything outside it is
rejected with a clear message rather than rendered as garbage. Latin-1 accents and curly quotes are
fine; emoji, CJK, and Cyrillic are refused. The real fix for full Unicode support is embedding a
font with `doc.addFont()`, but rejecting cleanly beats corrupting a name.

## Never lose text off the bottom of the page

Real letters fit on one page, and the layout shrinks the font within a readable range to keep them
there. But if someone pastes an essay into the name field, the font-shrink loop alone will happily
draw text past the bottom margin, where it is silently lost. jsPDF's single-page render never
increments the page count on its own. The fix was a `writeLine` that starts a new page whenever the
next line would fall past the margin, so pathological input paginates instead of disappearing.

## What I would do differently

Washington's rate depends on the judgment type across six tracks, not just the state, so it (along
with Iowa, Maine, and Mississippi) ships without a single number and shows the formula instead. A
judgment-type selector would let me compute those too. I would also add prejudgment interest, which
several states set differently from post-judgment.

The whole thing is vanilla JavaScript, bundled with Vite, tested with `node:test` and fast-check
property tests, and jsPDF is loaded lazily so the calculator stays light until you actually
generate a letter. Source is on [GitHub](https://github.com/ctkrug/docket-interest).
