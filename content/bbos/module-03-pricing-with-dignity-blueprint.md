# Module 3 — Pricing With Dignity · Production Blueprint (Approved)

**Status:** Architecture approved. This is a design/production blueprint only — **not** Module 3 prose.
**Canonical title:** **Pricing With Dignity**
**Design authority:** Product Constitution §7 (M3 outcome), §8 (journey Weeks 5–6), §9 (Pricing & Margin calculator), §11 (Maya). **Editorial authority:** BBOS Editorial & Design Style Guide.

---

## 1. Purpose

Module 2 defined *what* the owner sells. Module 3 puts a defensible number on it. It replaces guessing, gut-feel discounts, and apologetic quoting with a repeatable method: **Cost Stack → Target Margin → Price**. The owner builds the true cost of delivering an offer, chooses a deliberate Target Margin and a separate Margin Guardrail, calculates prices for every Offer Ladder rung and Optional item, and learns to present and hold those prices calmly.

The promise is a **method and the confidence to use it** — never a guaranteed profit, income, or revenue result.

## 2. Customer transformation

- **Starting condition:** prices guessed from memory or copied from competitors; discounts under pressure; suspicion that some jobs lose money.
- **Exit condition:** a written Cost Stack for the core offer, a chosen Target Margin and Margin Guardrail, calculated prices for Entry / Core / Premium and every Optional item, a Price-Hold Script, Discount Guardrails, and an Exception Approval rule.
- **Behavioral shift:** from "What can I get away with charging?" to "Here is my price, and I know exactly why."
- **Visible outputs:** Cost Stack, Target Margin, Margin Guardrail, priced Offer Ladder, priced Optional items, Price-Hold Script, Discount Guardrails, Exception Approval rule.

## 3. Learning objectives

1. Identify the full Cost Stack for an offer.
2. Separate direct costs, labor, overhead allocation, and contingency.
3. Count the owner's own labor as a real cost.
4. Choose a Target Margin deliberately (no universal percentage prescribed).
5. Set a separate Margin Guardrail (lowest planned margin without Exception Approval).
6. Calculate a sustainable price using Cost Stack → Target Margin → Price.
7. Distinguish **margin** from **markup**.
8. Compare pricing scenarios and choose confidently.
9. Apply prices to Entry / Core / Premium and Optional items.
10. Present and hold the price professionally.
11. Respond to discount requests without panic, using guardrails and conscious exceptions.

## 4. Chapter architecture

| # | Chapter | Visible output |
|---|---------|----------------|
| 3.1 | Why Owners Under-Price | Written under-pricing pattern + commitment |
| 3.2 | Build the Cost Stack | Completed Cost Stack (4 layers) for core offer |
| 3.3 | Choose a Target Margin | Written Target Margin + Margin Guardrail + reasons |
| 3.4 | Calculate the Price | Calculated core price + scenario comparison |
| 3.5 | Price the Offer Ladder and Optional Items | Fully priced ladder + Optional prices |
| 3.6 | Present, Hold, and Protect the Price | Price-Hold Script, Discount Guardrails, Exception Approval rule |

Split 3.6 only if clarity requires it within the 6,000–7,000-word range.

## 5. Core frameworks

1. **Cost Stack** — Direct costs · Labor · Overhead allocation · Contingency. Owner's labor counts. Overhead kept deliberately simple (not cost accounting).
2. **Target Margin** — the planned margin the offer should achieve. Chosen deliberately; no universal percentage.
3. **Margin Guardrail** — the lowest planned margin the owner will accept without a documented Exception Approval. Distinct from Target Margin.
4. **Cost Stack → Target Margin → Price** — canonical calculation.
5. **Pricing scenario comparison** — 2–3 side-by-side scenarios (different margins or cost assumptions).
6. **Price-Hold Script** — short, plain way to state a price and stay calm.
7. **Discount Guardrails** — pre-decided rules so discounts are never reflexive.
8. **Exception Approval** — conscious, bounded, logged exception with reason and end date.

## 6. Required formulas

```text
Price = Cost Stack ÷ (1 − Target Margin)
```

```text
Margin = (Price − Cost Stack) ÷ Price
```

Margin and markup are **not** the same. No alternate conflicting formula.

## 7. Calculator specification (define in module; build spreadsheet later)

**BBOS Pricing & Margin Calculator** — plain spreadsheet, no macros, offline-usable (Style Guide §11).

**Tabs (fixed order):** `Start Here` → `Inputs` → `Results` → `Example` → `Notes / Disclaimer`

**Inputs (only editable cells):** currency symbol (one parameter — currency-neutral); direct-cost lines; labor hours + labor cost/hour; overhead allocation; contingency %; Target Margin %; Margin Guardrail %; Entry/Premium scope relative to Core; Optional-item cost inputs.

**Outputs (locked):** Cost Stack total; Price at Target Margin; verified Margin; prices at Guardrail (floor reference); Entry / Core / Premium prices; Optional-item prices; scenario columns A/B/C; plain-language status text (never color alone).

**Example tab:** Maya's Property Services with the **same figures** as the Main Guide (illustrative USD labeled).

**Disclaimer:** "For planning only. Not tax, accounting, financial, or legal advice." No client or Bornfidis/VelocityMaid figures.

**Protection:** lock non-input cells; Gold-bordered unlocked inputs; Paper-filled calculated cells.

**Do not create the spreadsheet in this production pass.** The module defines exact requirements; the spreadsheet is built after prose and numbers are locked.

## 8. Currency convention

- **Maya worked examples:** USD only.
- Every numerical block labeled: *"Illustrative example in USD. Replace the currency symbol and figures with your own local inputs."*
- Figures fictional, round, internally consistent; not recommended rates; not real business pricing.
- Calculator remains currency-neutral via one editable currency-symbol field.
- Same Maya figures in Main Guide and future Example tab.

## 9. Dependencies

**From Module 2 (reference, do not re-teach):** Offer Builder; Included / Optional / Not Included; Offer Ladder; Should I Say Yes?; Margin-viable gate. Module 3 fills `[price — set in Module 3]` placeholders.

**Into Module 4:** priced proposals and follow-up run inside the Weekly Operating Rhythm.

**Into Module 5:** planned pricing vs actual margin, cash, and runway. Module 3 does **not** teach actual-margin tracking or cash-flow management.

## 10. Proposed-stage governance

**Final canonical definition (approved):**

> An opportunity officially enters Proposed when the customer has received a specific Offer Ladder rung at a defined price and the owner is awaiting the customer's decision.

Do **not** edit locked Module 2 during this draft pass. When Module 3 is approved for locking, perform a **narrow reference-only reconciliation** in Module 2 as part of the final Module 3 lock pass. No other Module 2 edits authorized.

## 11. Claims and advice boundaries

Must not: guarantee profit; promise revenue growth; prescribe universal margins; give tax/legal/accounting/investment/financial advice; use competitor pricing as the main method; suggest price-fixing or competitor coordination; present false precision; use real business figures.

Competitor awareness may appear only as a **final reality check** after the owner calculates their own price.

## 12. Editorial and repetition risks

Markup vs margin confusion; overcomplicated overhead; false precision; fear-based pricing; treating every exception as failure; sliding into accounting; unrealistic numbers; re-teaching Module 2; drifting into Module 5 measurement; building the Client proposal template here.

## 13. Estimated word count and effort

- Draft: **6,000–7,000 words**
- Calculator build: separate later session after numbers locked
- Reviews: formula consistency, Maya reconciliation, claims, confidentiality, accessibility

## 14. Quality checklist (pre-draft / pre-lock)

- [ ] Formulas consistent; margin ≠ markup
- [ ] Target Margin distinct from Margin Guardrail
- [ ] Maya figures reconcile across all chapters
- [ ] USD illustrative labels on every numerical block
- [ ] No real pricing; no profit/revenue promises; non-advice Notes present
- [ ] Every chapter produces a visible output; one module Completion Milestone + checklist
- [ ] Module 2 referenced, not re-taught; Module 4/5 handoffs clear
- [ ] No spreadsheet created in this pass
- [ ] Proposed-stage reconciliation deferred to Module 3 lock pass

---

**Blueprint version:** Approved · Architecture only.
