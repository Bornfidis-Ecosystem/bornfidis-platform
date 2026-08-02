# BBOS Version 1 Release Register

**Version:** 1.0  
**Status:** Internal Draft (core modules + pricing calculator frozen)  
**Product:** Bornfidis Business Operating System (BBOS)  
**Purpose:** Single source of truth for what belongs in Version 1. Prevents scope creep.

---

## Locked Assets

| Asset | Location / note |
|---|---|
| ✓ Product Constitution | `docs/BBOS_PRODUCT_CONSTITUTION.md` |
| ✓ Editorial Style Guide | `docs/BBOS_EDITORIAL_STYLE_GUIDE.md` |
| ✓ Module 1 — Business Foundation | `content/bbos/module-01-business-foundation.md` |
| ✓ Module 2 — Offer and Sales System | `content/bbos/module-02-offer-and-sales-system.md` |
| ✓ Module 3 — Pricing With Dignity | `content/bbos/module-03-pricing-with-dignity.md` |
| ✓ Pricing Formula Standard | `Price = Cost ÷ (1 − Target Margin)`; `Margin = (Price − Cost) ÷ Price` |
| ✓ Target Margin / Margin Guardrail distinction | Defined in Module 3; no universal percentages |
| ✓ Calculator Specification | Frozen in Module 3 + Module 3 blueprint |
| ✓ Proposed-stage definition | Canonical (priced rung awaiting decision) |
| ✓ Maya running example profile | Constitution §11; figures locked in Module 3 |
| ✓ **Pricing & Margin Calculator — Frozen V1.0** | See freeze record below |

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

## Pending (V1 required)

| Asset | Status |
|---|---|
| □ Worksheet Pack (Snapshot, Offer Builder, Ladder, Pipeline, Cadence, etc.) | After calculator freeze |
| □ Module 4 — Weekly Operating Rhythm | **Next** — architecture may begin |
| □ Module 5 — Money and Metrics | After Module 4 |
| □ Module 6 — Systems and Delegation | After Module 5 |
| □ Module 7 — Reputation and Customer Retention | After Module 6 |
| □ Module 8 — The 90-Day Implementation Plan | After Module 7 |
| □ Start Here guide | Required V1 companion |
| □ Offer One-Pager (designed asset) | Required V1 companion |
| □ Weekly Operating Rhythm workbook | Required V1 companion |
| □ SOP template | Required V1 companion |
| □ Client proposal template | Required V1 companion |
| □ Weekly Close checklist | Required V1 companion |
| □ Cash-Flow & Runway calculator | Required V1 companion |
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
2. **Next:** Module 4 — Weekly Operating Rhythm (architecture).  
3. **Then:** Modules 5–8 and remaining companion assets per Constitution §9.

---

## Change control

- Locked assets are not rewritten without an explicit executive unlock.
- Narrow factual reconciliations (terminology, Proposed-stage) require written authorization.
- New features move to Future Enhancements unless Constitution §9 is amended first.
- The Pricing & Margin Calculator Frozen V1.0 must not invent behavior beyond Module 3.

**Last updated:** 2026-08-01 · Calculator Frozen V1.0
