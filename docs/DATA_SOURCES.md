# Data sources — state post-judgment interest rates

`src/data/states.js` ships a sourced table of post-judgment interest rules for all 50 states
and DC. This document records where each entry came from and the methodology used, so the data
can be audited and refreshed rather than trusted blindly.

**Last research pass:** 2026-07-10. **This is a calculation aid, not legal advice** — rates
change (some jurisdictions reset annually, semi-annually, quarterly, or even monthly), and a
handful of states turn on facts (contract vs. tort, consumer debt, judgment size) that a general
calculator can't fully resolve. Always confirm the applicable rate against current law, ideally
with an attorney, before relying on a number for a real filing.

## Methodology

For each jurisdiction: the statutory or court-rule rate (or formula) was identified from primary
source text (state statute sites, Justia, FindLaw) where reachable, then cross-checked against
at least one secondary source (a law firm's rate summary, a state courts' published rate table,
or case law addressing simple-vs-compound treatment). Where a primary source could not be
fetched directly (several state legislature/courts sites block automated fetches), the entry
relies on convergent secondary sources instead and that fact is noted below.

Every entry in `states.js` carries a `rateType`:

- **`fixed`** — set by statute/rule and stable; no periodic recalculation.
- **`variable`** — tied to a formula (a Treasury yield, the Fed prime/discount rate, etc.) that
  resets on a published schedule (monthly, quarterly, semi-annually, or annually). These are the
  entries most likely to drift out of date and need a refresh pass.
- **`discretionary`** — no statutory default; a judge sets the rate case by case (Mississippi's
  non-contract track).

## Simple vs. compound — the key differentiator

Most states accrue **simple** interest post-judgment (on the original principal only). Six
jurisdictions in this table compound annually instead, confirmed against statutory text or
controlling case law:

| State | Compounding authority |
|---|---|
| Colorado (default/contract rate) | C.R.S. § 5-12-102 ("compounded annually") |
| Kentucky | Ky. Rev. Stat. Ann. § 360.040 ("compounded annually") |
| Michigan | Mich. Comp. Laws § 600.6013 ("compounded annually") |
| Oklahoma | 12 Okla. Stat. § 727.1(C) (applies each year's rate to principal + prior accrued interest) |
| South Carolina (judgment rate) | S.C. Code Ann. § 34-31-20(B) |
| Texas | Tex. Fin. Code § 304.006 ("compounds annually") |

Two entries have lower-confidence method fields, noted individually below (South Dakota, Utah).

## Per-state citations and primary sources

| State | Citation | Primary source |
|---|---|---|
| Alabama | Ala. Code § 8-8-10 | law.justia.com/codes/alabama/title-8/chapter-8/section-8-8-10/ |
| Alaska | AS 09.30.070(a) | law.justia.com/codes/alaska/title-9/chapter-30/article-1/section-09-30-070/ |
| Arizona | A.R.S. § 44-1201(B) | azleg.gov/ars/44/01201.htm |
| Arkansas | Ark. Code Ann. § 16-65-114 | law.justia.com/codes/arkansas/title-16/subtitle-5/chapter-65/subchapter-1/section-16-65-114/ |
| California | Cal. Civ. Proc. Code § 685.010 | leginfo.legislature.ca.gov (CCP § 685.010) |
| Colorado | C.R.S. §§ 5-12-102, 13-21-101 | colorado.public.law/statutes/crs_5-12-102 |
| Connecticut | Conn. Gen. Stat. §§ 37-1, 37-3a, 37-3b | cga.ct.gov/2023/pub/chap_673.htm |
| Delaware | 6 Del. C. § 2301 | delcode.delaware.gov/title6/c023/ |
| District of Columbia | D.C. Code § 28-3302 | code.dccouncil.gov/us/dc/council/code/sections/28-3302 |
| Florida | Fla. Stat. § 55.03 | leg.state.fl.us (Fla. Stat. § 55.03); myfloridacfo.com/division/aa/audits-reports/judgment-interest-rates |
| Georgia | O.C.G.A. § 7-4-12 | law.justia.com/codes/georgia/title-7/chapter-4/article-1/section-7-4-12/ |
| Hawaii | Haw. Rev. Stat. § 478-3 | capitol.hawaii.gov/hrscurrent/Vol11_Ch0476-0490/HRS0478/HRS_0478-0003.htm |
| Idaho | Idaho Code § 28-22-104 | legislature.idaho.gov/statutesrules/idstat/title28/t28ch22/sect28-22-104/; sto.idaho.gov/Banking/Legal-Rate-of-Interest |
| Illinois | 735 ILCS 5/2-1303 | codes.findlaw.com/il/chapter-735-civil-procedure/il-st-sect-735-5-2-1303/ |
| Indiana | Indiana Code § 24-4.6-1-101 | codes.findlaw.com/in/title-24-trade-regulation/in-code-sect-24-4-6-1-101/ |
| Iowa | Iowa Code § 668.13 | legis.iowa.gov/docs/code/668.13.pdf |
| Kansas | Kan. Stat. Ann. § 16-204 | ksrevisor.gov/statutes/chapters/ch16/016_002_0004.html; kssos.org (annual rate notice) |
| Kentucky | Ky. Rev. Stat. Ann. § 360.040 | apps.legislature.ky.gov/law/statutes/statute.aspx?id=45719 |
| Louisiana | La. Rev. Stat. Ann. § 13:4202 | ofi.la.gov/legal/statutes-rules-policies-opinions/judicial-interest-rates/ |
| Maine | 14 M.R.S. § 1602-C | legislature.maine.gov/statutes/14/title14sec1602-C.html |
| Maryland | Md. Code Ann., Cts. & Jud. Proc. § 11-107 | mgaleg.maryland.gov/mgawebsite/laws/StatuteText?article=gcj&section=11-107 |
| Massachusetts | Mass. Gen. Laws ch. 235, § 8; ch. 231 §§ 6B, 6C | malegislature.gov (ch. 235 § 8) |
| Michigan | Mich. Comp. Laws § 600.6013 | legislature.mi.gov/Laws/MCL?objectName=mcl-600-6013 |
| Minnesota | Minn. Stat. §§ 549.09, 549.091 | revisor.mn.gov/statutes/cite/549.09 |
| Mississippi | Miss. Code Ann. § 75-17-7 | law.justia.com/codes/mississippi/title-75/chapter-17/general-provisions/section-75-17-7 |
| Missouri | Mo. Rev. Stat. § 408.040 | revisor.mo.gov/main/OneSection.aspx?section=408.040 |
| Montana | Mont. Code Ann. § 25-9-205 | mca.legmt.gov/bills/mca/title_0250/chapter_0090/part_0020/section_0050/0250-0090-0020-0050.html |
| Nebraska | Neb. Rev. Stat. § 45-103 | nebraskalegislature.gov/laws/statutes.php?statute=45-103 |
| Nevada | Nev. Rev. Stat. § 17.130 (formula via NRS § 99.040(1)) | leg.state.nv.us/nrs/nrs-017.html; fid.nv.gov (rate PDFs) |
| New Hampshire | N.H. Rev. Stat. Ann. § 336:1 | gc.nh.gov/rsa/html/xxxi/336/336-1.htm |
| New Jersey | N.J. Ct. R. 4:42-11(a) | njcourts.gov (annual rate notice) |
| New Mexico | N.M. Stat. Ann. § 56-8-4 | law.justia.com/codes/new-mexico/chapter-56/article-8/section-56-8-4/ |
| New York | N.Y. C.P.L.R. § 5004 | law.justia.com/codes/new-york/cvp/article-50/5004/ |
| North Carolina | N.C. Gen. Stat. §§ 24-1, 24-5 | ncleg.gov/EnactedLegislation/Statutes/PDF/BySection/Chapter_24/GS_24-1.pdf |
| North Dakota | N.D. Cent. Code § 28-20-34 | ndcourts.gov (annual rate notice) |
| Ohio | Ohio Rev. Code § 1343.03(A) | codes.ohio.gov/ohio-revised-code/section-1343.03 |
| Oklahoma | 12 Okla. Stat. § 727.1 | oscn.net (annual AOC certification) |
| Oregon | Or. Rev. Stat. § 82.010 | oregon.public.law/statutes/ors_82.010 |
| Pennsylvania | 42 Pa. Cons. Stat. § 8101; 41 P.S. § 202 | codes.findlaw.com/pa/title-41-...-202/ |
| Rhode Island | R.I. Gen. Laws § 9-21-10 | webserver.rilegislature.gov (§ 9-21-10) |
| South Carolina | S.C. Code Ann. § 34-31-20 | scstatehouse.gov/code/t34c031.php |
| South Dakota | S.D. Codified Laws §§ 54-3-16, 54-3-5.1 | sdlegislature.gov/api/Statutes/54-3-16.html |
| Tennessee | Tenn. Code Ann. § 47-14-121(a) | law.justia.com/codes/tennessee/2021/title-47/chapter-14/section-47-14-121/; tncourts.gov (AOC rate table) |
| Texas | Tex. Fin. Code §§ 304.003, 304.006 | occc.texas.gov/publications/interest-rates; texas.public.law/statutes/tex._fin._code_section_304.006 |
| Utah | Utah Code § 15-1-4 | le.utah.gov/xcode/Title15/Chapter1/15-1-S4.html; utcourts.gov (rate table) |
| Vermont | 9 V.S.A. § 41a; 12 V.S.A. § 2903(c) | legislature.vermont.gov/statutes/section/09/004/00041a |
| Virginia | Va. Code § 6.2-302 | law.lis.virginia.gov/vacode/title6.2/chapter3/section6.2-302/ |
| Washington | RCW 4.56.110 | app.leg.wa.gov/rcw/default.aspx?cite=4.56.110 |
| West Virginia | W. Va. Code § 56-6-31 | code.wvlegislature.gov/56-6-31 |
| Wisconsin | Wis. Stat. § 815.05(8) | docs.legis.wisconsin.gov/statutes/statutes/815/05 |
| Wyoming | Wyo. Stat. Ann. § 1-16-102 | law.justia.com/codes/wyoming/title-1/chapter-16/article-1/section-1-16-102 |

## Flagged for extra caution

A few entries carry lower confidence than the rest and are worth a manual re-check before
treating them as settled:

- **Iowa, Maine, Washington**: no single static 2026 numeric rate exists (Iowa recalculates
  monthly per judgment date; Maine's exact 2026 figure wasn't confirmed against a live source;
  Washington's rate depends on judgment type, not just state, across six distinct tracks). All
  three ship with `rate: null` and a formula description instead of a number.
- **Mississippi**: no statutory default at all — a judge sets a "fair" rate case by case for
  non-contract judgments. Ships with `rateType: "discretionary"`.
- **South Dakota, Utah**: the simple-vs-compound characterization rests on inference (no
  compounding language found, plus practitioner treatment) rather than an explicit statutory
  statement or dispositive case law — flagged in each entry's `notes`.
- **Tennessee's second half of 2026, and any `variable`-rateType entry generally**: these reset
  on a published schedule (annually, semi-annually, quarterly, or monthly depending on the
  state) and will drift out of date; `lastVerified` records when each entry was last checked so
  a future pass knows what to re-verify first.
