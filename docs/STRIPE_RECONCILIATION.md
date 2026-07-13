# Stripe live webhook + reconciliation checklist

## Why Shania’s payment didn’t update the booking

Likely causes (in order):

1. **No Live-mode webhook** on `https://bornfidis.com/api/stripe/webhook` (only Test was configured earlier).
2. Live Payment Link / Dashboard charge **without** `metadata.booking_id` — the old webhook **skipped** those silently.
3. Webhook secret mismatch on the **brian-ms-projects** Vercel Production env (`STRIPE_WEBHOOK_SECRET` must be the Live endpoint’s signing secret).

## Stripe Dashboard (Live mode toggle ON)

1. Developers → Webhooks → **Add endpoint** (or confirm existing Live endpoint):
   - URL: `https://bornfidis.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`, `account.updated`
2. Copy the **Live** signing secret (`whsec_…`) into Vercel Production:
   - `STRIPE_WEBHOOK_SECRET`
   - Confirm `STRIPE_SECRET_KEY` is `sk_live_…` and publishable is `pk_live_…`
3. Open the endpoint’s delivery log for Shania’s charge — look for 200 vs signature failures.

## Branding (Dashboard only, no code)

- Settings → Branding: navy `#002747`, gold `#ffbc00`, Bornfidis logo
- Statement descriptor: `BORNFIDIS` / `BORNFIDIS PROVISIONS`
- Public support email/phone

## Platform features (this deploy)

- `stripe_webhook_log` table — every payment webhook is audited (matched / unmatched / error)
- Admin → **Payments** (`/admin/payments`) — unmatched queue
- Booking Payment card → **Generate deposit/balance Checkout links** (always sets metadata)
- Founder → **Link existing Stripe payment** (paste `pi_…`) for backlog like Shania

## One-time: mark Shania paid today

On her booking detail (founder admin):

1. Paste `pi_3TsRO2FC34nf2Fmp15EaPYxa`
2. Choose **Deposit** (or Balance if that was the full settlement)
3. Click **Link Stripe payment**

Or use Mark deposit paid (manual) with the same PI in the note field.
