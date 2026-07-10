# Design direction — Docket Interest

## 1. Aesthetic direction

**Paper-and-ink.** Docket Interest is a legal instrument, not a SaaS dashboard — it should read
like a filled-in court form on cream paper: warm off-white sheets, near-black ink type, a single
oxblood-red "stamp" accent for anything actionable, and a ledger-style monospace for every
number that accrues. The feeling is "a clerk's desk," not "a fintech app."

This deliberately breaks from the dark-surface-plus-neon-accent default (already used twice in
sibling projects for a blueprint/technical direction) and from the warm-cream-editorial-serif
look already used for Six Words Live — Docket Interest's cream is paper-textured and ledger-lined
rather than lit-mag, its accent is oxblood rather than coral, and its numerals live in a
monospace ledger face rather than serif body text.

## 2. Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#f4ede0` | page background — warm paper |
| `--surface-1` | `#faf5ea` | card / sheet surface (the "page" sitting on the desk) |
| `--surface-2` | `#ece3d1` | recessed surface (input wells, footnotes, table zebra) |
| `--text` | `#211d16` | primary ink |
| `--text-muted` | `#6f6553` | secondary ink (captions, statute citations) |
| `--accent` | `#8a1f2b` | oxblood — primary actions, the seal, the live-total flash |
| `--accent-support` | `#9c7a2e` | brass/gold — secondary accents, dividers, focus rings |
| `--success` | `#2f6f4e` | ledger green — confirmations, "paid" states |
| `--danger` | `#b3272c` | validation errors |
| `--font-display` | Playfair Display | wordmark, headings — cut like engraved letterhead |
| `--font-ui` | IBM Plex Sans | body copy, labels, buttons |
| `--font-mono` | IBM Plex Mono | every number: amounts, dates, the accruing total |
| `--space` | 8px base scale (8/16/24/32/48/64) | all spacing |
| `--radius` | 3px | inputs/buttons (a document's corners are square, not bubbly) |
| `--shadow` | `0 2px 8px rgba(33, 29, 22, 0.12), 0 1px 2px rgba(33, 29, 22, 0.08)` | warm, low-contrast — a sheet of paper lifted slightly off the desk |
| `--motion-ui` | 160ms ease-out | hover/focus/active transitions |
| `--motion-ledger` | 90ms ease-out per digit | the running-total tick |

Google Fonts: Playfair Display (display), IBM Plex Sans + IBM Plex Mono (UI/numerals), all with
system-serif/system-sans/monospace fallbacks.

## 3. Layout intent

The hero **is the calculator**: a two-column "desk" at 1440×900 — a ~40% left "intake card"
(state dropdown, judgment amount, judgment date, as-of date, all styled like fields on a filled
court form) and a ~60% right "ledger panel" where the accruing total lives in large monospace
digits above the day count, the per-diem rate, and the governing statute citation, with the
"Generate demand letter" button styled as a wax-seal circle button beneath it. At 390×844 the
intake card stacks above the ledger panel, both full-width with generous (24px+) padding so nothing
feels cramped; the ledger total stays large enough to read at a glance.

## 4. Signature detail

The ledger panel's total renders in `--font-mono` with a thin rule under each digit group like a
paper ledger line. Every time the computed total changes (typing, or the live per-second tick),
the digits that changed get a brief oxblood ink-flash (~150ms) before settling — the number
looks freshly stamped rather than silently re-rendered. The demand-letter preview card has a
CSS `clip-path` dog-eared corner fold, reinforcing "this is a physical page."

## 5. Interaction notes (not a game — no SFX/juice plan required)

- Inputs get a themed focus ring in `--accent-support`, a recessed `--surface-2` well at rest,
  and a subtle inward shadow on focus (like pressing a pen into paper).
- The primary CTA (generate PDF) is the wax-seal circle: scales down 4% on press, springs back
  over 160ms.
- `prefers-reduced-motion` disables the digit ink-flash and seal press animation but keeps the
  total updating instantly.
- Favicon: an inline SVG monogram — a serif "§" (section mark) in oxblood on the cream bg,
  doubling as the page's document/legal cue instead of a generic globe.
