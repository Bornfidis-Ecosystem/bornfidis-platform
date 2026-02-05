# Booking Detail Page – Refactored Structure

## Current vs Target

**Current problem:** The booking detail page has many flat sections; Quote Builder content appears in two places (inline in `BookingDetailClient` and again via `QuoteSection` on the page). Admin workflow is cluttered.

**Target:** Four clear sections in `BookingDetailClient`, with Sections 3 and 4 collapsible (closed by default). Single source for quote/payment (no duplicate Quote Builder).

---

## Refactored Structure (BookingDetailClient only)

### Section 1: BOOKING OVERVIEW (read-only)
- **Purpose:** At-a-glance customer and event info.
- **Content:** Same data the page already shows above the client (customer info, event details, preferences/notes). For consistency and a single “top of detail” view, we can either:
  - **Option A:** Keep Section 1 in **page.tsx** (Customer Information, Event Details, Preferences) and have `BookingDetailClient` start at Section 2, or
  - **Option B:** Move that read-only block into `BookingDetailClient` as Section 1 so the client owns the whole layout.
- **Recommendation:** Option A – leave Section 1 in page.tsx to avoid duplicating server-rendered content. `BookingDetailClient` starts with Section 2.
- **Header:** e.g. “Booking overview” (if we ever move it into client). No icon needed if it stays on the page.

### Section 2: ADMIN ACTIONS (editable)
- **Purpose:** Status and internal notes; primary admin controls.
- **Content:**
  - Status dropdown (NEW / pending / reviewed / quoted / booked / declined – align with existing `BookingStatus`).
  - Admin notes textarea (internal only).
  - Save Changes button.
- **Header:** “Admin actions” with icon (e.g. pencil or slider).
- **Tooltips:** Status = “Booking lifecycle state”; Admin notes = “Internal only; not visible to customer.”

### Section 3: QUOTE & PAYMENT (collapsible, closed by default)
- **Purpose:** Single place for quote line items, totals, and payment.
- **Content:**
  - Line items table (add/remove/edit).
  - Tax, service fee, deposit percentage.
  - Total calculations (subtotal, tax, fee, total, deposit, balance).
  - Payment status (deposit paid, balance paid, fully paid).
  - Save Quote button.
  - If Stripe configured: Send Deposit, Send Balance, Deposit modal, Generate Customer Portal Link, Copy portal URL, Rotate link. Download Invoice when fully paid.
  - If Stripe not configured: hide payment actions and show “Stripe not configured” (or hide entire payment subsection).
- **Header:** “Quote & payment” with icon (e.g. document/currency). Collapsible; default closed.
- **Tooltips:** e.g. Deposit % = “Percentage of total due as deposit”; Portal link = “Customer-facing link to view booking and pay.”

### Section 4: TEAM ASSIGNMENT (collapsible, closed by default)
- **Purpose:** Chef, farmers, and staff notes in one place.
- **Content:**
  - Chef assignment dropdown + payout split + assign/update/remove + payout status and Run Payout (existing `ChefAssignmentSection` logic).
  - Farmer assignment (existing inline `FarmerAssignmentSection` – booking_farmers API).
  - Ingredient sourcing (existing `IngredientSourcingSection`).
  - Staff notes / assignment notes (already inside chef and farmer blocks; no extra “staff notes” unless we add one field).
- **Header:** “Team assignment” with icon (e.g. users). Collapsible; default closed.
- **Tooltips:** e.g. Chef = “Primary chef for this booking”; Payout % = “Chef share of booking total.”

---

## Duplicate Quote Builder

- **Current:** (1) Full Quote Builder inside `BookingDetailClient` (line items, tax, deposit %, Save Quote, payment actions). (2) `QuoteSection` rendered in `page.tsx` below (legacy quote-actions, different quote model).
- **Change:** Keep the single Quote Builder inside `BookingDetailClient` as Section 3. Remove the legacy `QuoteSection` from `page.tsx` so the booking detail page has only one quote/payment area (Section 3).

---

## Requirements Checklist

| Requirement | Approach |
|-------------|----------|
| Remove duplicate Quote Builder | One quote UI in Section 3; remove `<QuoteSection>` from page.tsx. |
| Sections 3 and 4 collapsible, closed by default | Use a small accordion/chevron state; Section 3 and 4 start with `open = false`. |
| Clear section headers with icons | Section 2: e.g. pencil; Section 3: document/currency; Section 4: users. |
| Group related actions | Section 2 = status + notes + save; Section 3 = quote + payment + portal; Section 4 = chef + farmers + ingredients. |
| Hide payment sections if Stripe not configured | Wrap Stripe-dependent UI (Send Deposit, Balance, Portal link, etc.) in `isStripeConfigured()`; optionally hide “Payment status” subsection or show a short message. |
| Tooltips on key fields | Add `title` or a small tooltip component for status, admin notes, deposit %, portal link, chef payout %. |

---

## File Changes

1. **`app/admin/bookings/[id]/BookingDetailClient.tsx`**
   - Restructure JSX into Section 2 → Section 3 (collapsible) → Section 4 (collapsible).
   - Add collapsible state for Section 3 and Section 4 (e.g. `quoteOpen`, `teamOpen`), default false.
   - Add section headers with icons and chevron toggle.
   - Add tooltips (`title` or tooltip component) for the listed fields.
   - Keep all existing logic (handlers, state, Stripe checks); only reorder and wrap in the new layout.
   - Remove the separate “Deposit Payment” heading block (merge into Section 3); keep Deposit modal as is.
   - Keep Customer Portal block inside Section 3.

2. **`app/admin/bookings/[id]/page.tsx`**
   - Remove the legacy “Quote & Deposit Section - Phase 3A” that renders `<QuoteSection booking={booking} />` so the only quote/payment UI is in `BookingDetailClient` Section 3.

---

## Component / State Reuse

- **BookingDetailClient:** All current state and handlers stay (status, adminNotes, lineItems, quote, portal, deposit modal, etc.). No new server calls.
- **ChefAssignmentSection:** Remain as inline component (or keep as function inside same file) with same props.
- **FarmerAssignmentSection (inline):** Same; lives inside Section 4.
- **IngredientSourcingSection:** Same; lives inside Section 4.
- **TimelineSection, PrepSection, PayoutSection, FarmerAssignmentSection (file):** Unchanged in page.tsx; still rendered by page when status === 'Confirmed'. (Optional later: move Timeline/Prep/Payout into Section 4 or another collapsible; not in this refactor.)

---

## Status Values

- Use existing `BookingStatus`: `pending` | `reviewed` | `quoted` | `booked` | `declined` (and legacy `New` | `Contacted` | `Confirmed` | `Closed` if still in use). Status dropdown in Section 2 should list the same options as today.

---

If this structure matches what you want, next step is implementing it in `BookingDetailClient.tsx` and removing `QuoteSection` from `page.tsx`.
