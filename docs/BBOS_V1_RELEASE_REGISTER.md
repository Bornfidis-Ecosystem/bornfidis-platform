# BBOS Version 1 Release Register

**Version:** 1.0  
**Status:** Phase One complete — Operational Foundation locked  
**Product:** Bornfidis Business Operating System (BBOS)  
**Purpose:** Single source of truth for what belongs in Version 1. Prevents scope creep.

---

## BBOS Phase One Complete

**Milestone date:** 2026-08-02  
**Status:** Operational Foundation Complete  
**Local Git tag:** `bbos-v1-phase1` (do not push until publish)

| Asset | Status |
|---|---|
| ✓ Product Constitution | Locked |
| ✓ Editorial Style Guide | Locked |
| ✓ Release Register | Active (this document) |
| ✓ Module 1 — Business Foundation | Locked |
| ✓ Module 2 — Offer and Sales System | Locked |
| ✓ Module 3 — Pricing With Dignity | Locked |
| ✓ Pricing & Margin Calculator V1.0 | Frozen |
| ✓ Module 4 — Weekly Operating Rhythm | Locked |
| ✓ Weekly Operating Rhythm Workbook V1.0 | Frozen |

**Meaning:** Modules 1–4, governing docs, the pricing calculator, and the Weekly Operating Rhythm workbook form a stable operating foundation. Later modules build on this foundation; they do not reopen it without explicit executive unlock.

**Next phase:** Phase Two — Financial Control (Module 5 — Money and Metrics + financial workbook pages)  
**Process for Module 5+:** Architecture → executive review → blueprint approval → draft → lock → companion workbook after lock.

**Later phases (planning):** Phase Three — Operational Scale (Modules 6–8) · Phase Four — Product Launch (final companions, packaging, Digital Studio, Lite, marketing).

---

## Locked Assets

| Asset | Location / note |
|---|---|
| ✓ Product Constitution | `docs/BBOS_PRODUCT_CONSTITUTION.md` |
| ✓ Editorial Style Guide | `docs/BBOS_EDITORIAL_STYLE_GUIDE.md` |
| ✓ Module 1 — Business Foundation | `content/bbos/module-01-business-foundation.md` |
| ✓ Module 2 — Offer and Sales System | `content/bbos/module-02-offer-and-sales-system.md` |
| ✓ Module 3 — Pricing With Dignity | `content/bbos/module-03-pricing-with-dignity.md` |
| ✓ Module 4 — Weekly Operating Rhythm | `content/bbos/module-04-weekly-operating-rhythm.md` (+ blueprint) |
| ✓ Pricing Formula Standard | `Price = Cost ÷ (1 − Target Margin)`; `Margin = (Price − Cost) ÷ Price` |
| ✓ Target Margin / Margin Guardrail distinction | Defined in Module 3; no universal percentages |
| ✓ Calculator Specification | Frozen in Module 3 + Module 3 blueprint |
| ✓ Proposed-stage definition | Canonical (priced rung awaiting decision) |
| ✓ Maya running example profile | Constitution §11; figures locked in Module 3 |
| ✓ **Pricing & Margin Calculator — Frozen V1.0** | See freeze record below |
| ✓ **Weekly Operating Rhythm Workbook — Frozen V1.0** | See freeze record below |
| ✓ Phase One — Operational Foundation | See milestone above |

---

## Pricing & Margin Calculator — Freeze Record

| Field | Value |
|---|---|
| **Status** | **Frozen V1.0** |
| **Version** | 1.0 |
| **Date locked** | 2026-08-01 |
| **Filename** | `content/bbos/bbos-pricing-margin-calculator-v1.xlsx` |
| **Build script** | `scripts/build-bbos-pricing-calculator.py` |
| **Validation script** | `scripts/validate-bbos-pricing-calculator.py` |
| **Formula standard** | `Price = Cost Stack ÷ (1 − Target Margin)` · `Margin = (Price − Cost Stack) ÷ Price` (margin only; never markup) |
| **Maya example baseline** | Core Cost Stack **$105** → exact price **$150** (30% Target Margin); Guardrail 20% exact floor **$131.25** / practical **$132**; Scenario C exact **$161.54** / quote **$162**; Entry **$70→$100**; Premium **$175→$250**; Optionals **$21→$30**, **$14→$20**, **$7→$10** (illustrative USD) |
| **Manual test** | Opened and tested by product owner — no genuine spreadsheet defect reported |
| **Automated validation** | Maya lock figures + 10 fictional scenarios — ALL CHECKS PASSED |
| **Sheet titles** | Start Here · Inputs · Results · Example · Notes and Disclaimer *(Excel-safe name for Notes/Disclaimer)* |
| **Change control** | Do not alter formulas, Maya baseline, or frozen rules without explicit executive unlock |

---

## Weekly Operating Rhythm Workbook — Freeze Record

| Field | Value |
|---|---|
| **Status** | **Frozen V1.0** |
| **Version** | 1.0 |
| **Date locked** | 2026-08-02 |
| **Filename** | `content/bbos/bbos-weekly-operating-rhythm-workbook-v1.xlsx` |
| **Build script** | `scripts/build-bbos-weekly-rhythm-workbook.py` |
| **Validation script** | `scripts/validate-bbos-weekly-rhythm-workbook.py` |
| **Scope** | Phase One companion spanning Modules 1, 2, and 4 (Snapshot, disorder audit, time map, offer/pipeline tools, weekly rhythm) |
| **Pricing boundary** | References Pricing & Margin Calculator V1.0; does not duplicate Cost Stack → price formulas |
| **Financial boundary** | Module 4 notices; Module 5 analyzes — no runway / cash-flow / Core Number Set analysis in this workbook |
| **Automated validation** | Required sheets + Priority-1 section mapping + boundary checks — ALL CHECKS PASSED |
| **Change control** | Do not alter frozen structure, duration governance, or notice-only money rules without explicit executive unlock |

---

## Pending (V1 required)

| Asset | Status |
|---|---|
| □ Module 5 — Money and Metrics | **Next** — Phase Two; architecture first (do not draft until blueprint approved) |
| □ Module 5 financial workbook pages | After Module 5 lock |
| □ Module 6 — Systems and Delegation | Phase Three |
| □ Module 7 — Reputation and Customer Retention | Phase Three |
| □ Module 8 — The 90-Day Implementation Plan | Phase Three |
| □ Start Here guide | Required V1 companion |
| □ Offer One-Pager (designed asset) | Required V1 companion (draft content lives in rhythm workbook) |
| □ SOP template | Required V1 companion |
| □ Client proposal template | Required V1 companion |
| □ Weekly Close checklist | Optional extract; Close lives in rhythm workbook V1.0 |
| □ Cash-Flow & Runway calculator | Required V1 companion (ties to Module 5) |
| □ Quarterly Planning workbook | Required V1 companion |
| □ BBOS AI Prompt Pack | Required V1 companion |

---

## Future Enhancements (explicitly out of V1 unless re-scoped)

| Idea | Notes |
|---|---|
| □ Video lessons | Excluded from V1 (not LMS / video course) |
| □ AI assistant subscription | Excluded — Prompt Pack is offline files only |
| □ Case studies beyond Maya | Post-launch valuable |
| □ Community edition / membership | Excluded from V1 |
| □ Mobile companion / app | Excluded from V1 |
| □ Industry-specific packs | Post-launch |
| □ BBOS Lite (lead magnet) | Product packaging track — content distilled from locked modules |
| □ BBOS Professional tier extras | SOP Builder UX, dashboard, etc. — after Standard V1 |

---

## Suggested product packaging (not V1 build scope)

Planning only — does not expand V1 content requirements:

1. **BBOS Lite (Lead Magnet)** — 20–30 pages; Snapshot; Offer Builder; mini Cost Stack; email capture.
2. **BBOS Standard** — Full Main Guide + calculators + worksheets + templates.
3. **BBOS Professional** — Standard + deeper SOP/proposal/dashboard/prompt/quarterly assets + future updates.

---

## Production sequence (current)

1. ~~Build and freeze Pricing & Margin Calculator V1.~~ **Done — Frozen V1.0 (2026-08-01).**  
2. ~~Module 4 — Weekly Operating Rhythm.~~ **Done — Locked.**  
3. ~~Weekly Operating Rhythm Workbook V1.~~ **Done — Frozen V1.0 (2026-08-02).**  
4. ~~**BBOS Phase One — Operational Foundation.**~~ **Complete — tag `bbos-v1-phase1`.**  
5. **Next:** Owner self-test (Snapshot → Offer Builder → Pricing Calculator → Rhythm Workbook); then Module 5 architecture.  
6. **Then:** Phase Two (Module 5 + financial pages) → Phase Three (Modules 6–8) → Phase Four (launch package) per Constitution §9.

---

## Change control

- Locked assets are not rewritten without an explicit executive unlock.
- Phase One foundation (Constitution, Style Guide, Modules 1–4, Pricing Calculator, Rhythm Workbook) is stable; later modules must not reopen it without unlock.
- Narrow factual reconciliations (terminology, Proposed-stage) require written authorization.
- New features move to Future Enhancements unless Constitution §9 is amended first.
- The Pricing & Margin Calculator Frozen V1.0 must not invent behavior beyond Module 3.
- The Weekly Operating Rhythm Workbook Frozen V1.0 must not invent Module 5 financial analysis.

**Last updated:** 2026-08-02 · BBOS Phase One frozen — tag `bbos-v1-phase1`
