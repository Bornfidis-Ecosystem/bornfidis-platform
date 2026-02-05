# Quote Sections Audit – BookingDetailClient.tsx

## Summary

**There is only ONE Quote section in `BookingDetailClient.tsx`.** No duplicate Quote Builder was found in this file. The page already has a single collapsible "Quote & Payment" section.

---

## What Exists in BookingDetailClient.tsx

### 1. Quote & Payment – Collapsible (lines 564–831) — THE ONLY QUOTE SECTION

- **Header (always visible):** "Quote & Payment", summary: "No quote created yet" or "Total: $X.XX", ▼/▲ Expand.
- **Collapse state:** `quoteExpanded` (useState false, persisted in localStorage).
- **When expanded:**
  - **Line Items table** – Title, Description, Qty, Unit Price, Line Total, remove; + Add Item; min-w-[600px], overflow-x-auto.
  - **Quote Notes** – textarea (for customer).
  - **Tax, Service Fee, Deposit %** – three inputs (USD / percentage).
  - **Totals box** – Subtotal, Tax, Service Fee, Total, Deposit (%).
  - **Payment Status** – Deposit Paid / Balance Paid / Fully Paid (Yes/No).
  - **Save Quote** button.
  - **Download Invoice** (when fully paid, PDF).
  - **Stripe note** – "Stripe not configured. Track payments manually in Payment Status above."

**Functions used:** `addLineItem`, `updateLineItem`, `removeLineItem`, `handleSaveQuote`. Totals use `subtotalCents`, `taxCents`, `serviceFeeCents`, `totalCents`, `depositCents` (no separate `calculateTotal()`; header uses `formatUSD(totalCents)`).

---

### 2. Customer Portal (lines 828–897) — NOT A QUOTE SECTION

- **Title:** "Customer Portal".
- **Content:** Portal link input, Copy, Rotate Link, Generate Portal Link (or revoked state). No line items, no quote builder. This is portal link management only.

---

### 3. Team Assignment – Collapsible (lines 899+)

- Chef/farmer assignment. Not quote-related.

---

## Other Files (cleanup done)

- **`QuoteBuilder.tsx`** – **Removed.** Was a standalone component not used on the booking detail page; single source of truth is the "Quote & Payment" block in `BookingDetailClient.tsx`.
- **`QuoteSection.tsx`** – **Removed.** Was a wrapper component not used in `page.tsx`; duplicate quote UI eliminated.

---

## Conclusion

- **In `BookingDetailClient.tsx`:** One Quote section only ("Quote & Payment - Collapsible"). No second Quote Builder to merge or remove.
- **On the booking detail page:** Only `BookingDetailClient` is used for quote/payment UI; `QuoteSection` and `QuoteBuilder` are not rendered.
- **Cleanup applied:** `QuoteBuilder.tsx` and `QuoteSection.tsx` have been removed. The single source of truth for quote UI is the "Quote & Payment" block in `BookingDetailClient.tsx`. Helper functions `calculateSubtotal()` and `calculateTotal()` were added; the section header uses `Total: $${calculateTotal().toFixed(2)}` when a quote exists.

No structural merge is required; the single section already has the desired content (line items, tax/deposit, totals, payment status, Save Quote, Stripe note).
