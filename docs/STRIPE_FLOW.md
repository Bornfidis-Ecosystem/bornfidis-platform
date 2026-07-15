# Stripe Money Flow — Bornfidis Platform

**Date:** 2026-07-14 (Phase 6)
**Mode:** Stripe keys are currently **test-mode** (`sk_test_` / `pk_test_`) on Vercel Production.
**Webhook endpoint:** `https://bornfidis.com/api/stripe/webhook`
**Academy webhook:** `https://bornfidis.com/api/webhooks/academy`

---

## 1. Checkout Session Entry Points

### Provisions Deposits (dynamic `price_data`)

| Path | Auth | Amount Source | Used By |
|------|------|--------------|---------|
| `POST /api/checkout` (mode=`deposit`) | Admin user | `createDepositCheckoutSessionForBooking()` reads DB | Admin UI |
| `POST /api/portal/[token]/pay-deposit` | Portal token | `deposit_amount_cents` / `quote_deposit_cents` from DB | Customer portal |
| `POST /api/stripe/create-deposit-session` | Admin user | **Deprecated** — delegates to canonical helper | Legacy admin |

All deposit sessions use `price_data` (dynamic). `STRIPE_DEPOSIT_PRICE_ID` is **deprecated and unused**.

### Balance Payments (dynamic `price_data`)

| Path | Auth | Amount Source | Used By |
|------|------|--------------|---------|
| `POST /api/checkout` (mode=`balance`) | None (booking UUID) | Server-calculated from DB fields | Admin / invoice |
| `POST /api/portal/[token]/pay-balance` | Portal token | `balance_amount_cents` from DB | Customer portal |
| `POST /api/stripe/create-balance-session` | Admin user | Server-calculated from DB fields | `BookingInvoiceClient` |

### Consulting (fixed Price)

| Path | Auth | Amount Source |
|------|------|--------------|
| `POST /api/checkout` (mode=`consulting`) | None (public) | `STRIPE_CONSULT_PRICE_ID` env var |

### Passive Income (fixed Price, allowlisted)

| Path | Auth | Amount Source |
|------|------|--------------|
| `POST /api/checkout` (priceId, no mode) | None (public) | Client-sent `priceId` — validated against `NEXT_PUBLIC_STRIPE_PRICE_PRICING_CALCULATOR` and `NEXT_PUBLIC_STRIPE_PRICE_ORDER_AGREEMENT` |

### Academy (fixed Price per product)

| Path | Auth | Amount Source |
|------|------|--------------|
| `POST /api/academy/checkout` | Supabase user | `stripePriceId` from product catalog |

---

## 2. Metadata Contract

All Provisions checkout sessions include at minimum:

```
booking_id      — UUID
bookingId       — UUID (same, redundant for compat)
payment_type    — 'deposit' | 'balance' | 'consulting' | 'passive'
checkout_mode   — same as payment_type (added Phase 6)
```

Deposit sessions also include: `deposit_amount_cents`, `guest_name`, `event_date`, `type: 'deposit'`.
Balance sessions also include: `balance_amount_cents`, `guest_name`, `event_date`.

Academy sessions use: `productSlug`, `productTitle`, `client_reference_id` (Supabase user ID).

---

## 3. Webhook: `POST /api/stripe/webhook`

**Signing secret:** `STRIPE_WEBHOOK_SECRET`
**Events handled:** `checkout.session.completed`, `payment_intent.succeeded`, `account.updated`

### Dispatch logic

1. Extract `bookingId` from metadata (`bookingId` → `booking_id` fallback)
2. Resolve `checkoutMode` from metadata (`checkout_mode` → `payment_type` → `kind` → `type`)
3. Check idempotency via `stripe_webhook_events` table (event ID as PK)
4. Dispatch to handler:

| Mode | DB Update | Side Effects |
|------|-----------|--------------|
| `deposit` | `status → confirmed`, `paid_at`, `stripe_payment_status → deposit_paid`, `quote_status → accepted` | Confirmation email, booking activity |
| `balance` / `full` | `balance_paid_at`, `fully_paid_at`, `stripe_payment_status → paid_in_full` | Chef payout, farmer payouts, ingredient payouts, impact recording, invoice email |
| `consulting` | None (no booking row) | Admin notification email |
| Unknown | None | Logged as unmatched |

### Guards

- If `paid_at` already set → skip deposit update (no double-pay)
- If `balance_paid_at` already set → skip balance update
- `createBookingActivityDeduped` catches P2002 for activity-level idempotency

---

## 4. Webhook: `POST /api/webhooks/academy`

**Signing secret:** `STRIPE_ACADEMY_WEBHOOK_SECRET`
**Events handled:** `checkout.session.completed`

| Step | Action |
|------|--------|
| 1 | Verify signature |
| 2 | Check `academyPurchase.stripeSessionId` for idempotency |
| 3 | Check `stripe_webhook_events` for global idempotency |
| 4 | Create `academyPurchase` row |
| 5 | Log activity |
| 6 | Send confirmation email (with upsell suggestion) |
| 7 | Write `stripe_webhook_log` for reconciliation |

---

## 5. Reconciliation

| Table | Purpose |
|-------|---------|
| `stripe_webhook_events` | Idempotency — one row per processed event (PK = Stripe event ID) |
| `stripe_webhook_log` | Full audit trail — event type, object ID, booking match, status, raw payload |

**Admin UI:** `/admin/payments` shows logs with matched/unmatched/error status.

---

## 6. Required Environment Variables

| Variable | Required | Notes |
|----------|----------|-------|
| `STRIPE_SECRET_KEY` | Yes | `sk_test_` (current) or `sk_live_` |
| `STRIPE_WEBHOOK_SECRET` | Yes | From Stripe Dashboard → Webhooks |
| `STRIPE_ACADEMY_WEBHOOK_SECRET` | Yes (if academy live) | Separate endpoint signing secret |
| `STRIPE_CONSULT_PRICE_ID` | If consulting checkout used | Fixed Stripe Price ID |
| `NEXT_PUBLIC_STRIPE_PRICE_PRICING_CALCULATOR` | If passive income used | Fixed Price ID |
| `NEXT_PUBLIC_STRIPE_PRICE_ORDER_AGREEMENT` | If passive income used | Fixed Price ID |
| `NEXT_PUBLIC_STRIPE_ACADEMY_*` | Per academy product | 8+ Price IDs in catalog |

**Deprecated:** `STRIPE_DEPOSIT_PRICE_ID` — no longer used; deposits are dynamic.

---

## 7. Go-Live Checklist (switch test → live)

- [ ] Create Live webhook endpoint at `https://bornfidis.com/api/stripe/webhook` with events: `checkout.session.completed`, `payment_intent.succeeded`, `account.updated`
- [ ] Create Live academy webhook at `https://bornfidis.com/api/webhooks/academy` with event: `checkout.session.completed`
- [ ] Set `STRIPE_SECRET_KEY` = `sk_live_...` on the Vercel project that serves `bornfidis.com`
- [ ] Set `STRIPE_WEBHOOK_SECRET` = signing secret from the Live webhook
- [ ] Set `STRIPE_ACADEMY_WEBHOOK_SECRET` = signing secret from the Live academy webhook
- [ ] Create Live Stripe Price IDs for consulting, passive products, and academy products; update env vars
- [ ] Delete or disable any old/test webhook endpoints
- [ ] Run one real test booking: save quote → portal pay → confirm webhook fires → check `stripe_webhook_log`
- [ ] Confirm `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set to `pk_live_...` (not currently used in code but may be added for client-side Stripe.js)
