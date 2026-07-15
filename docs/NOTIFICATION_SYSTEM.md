# Notification System — Bornfidis Platform

**Date:** 2026-07-14 (Phase 7)

---

## Channels

| Channel | Implementation | Status |
|---------|---------------|--------|
| Email (Resend) | `lib/email.ts` — 20+ template functions | LIVE |
| Web Push | `components/push/AdminPushWrap.tsx`, `lib/web-push-helper.ts` | PARTIAL — requires VAPID keys |
| SMS Fallback | `lib/sms-fallback.ts` | PARTIAL — requires `SMS_FALLBACK_ENABLED=true` |
| In-app Action Queue | `lib/admin-action-needed.ts` | LIVE |
| In-app Prep Attention | `lib/admin-prep-attention.ts` | LIVE |
| Booking Activities | `booking_activities` table | LIVE (audit log, not notification) |

---

## Notification Triggers

### Automated (Cron)

| Trigger | Channel | Cron | Dedup |
|---------|---------|------|-------|
| Stale inquiry (3+ days) | Email | `/api/cron/inquiry-reminders` daily 10 AM | `inquiryReminderSentAt` (one-time) |
| Balance due (event in 3 days) | Email | `/api/cron/balance-reminders` daily 9 AM | `lastBalanceReminderSentAt` (7-day cooldown) |
| Chef prep (event tomorrow) | Push + SMS | `/api/cron/prep-reminders` daily 8 AM | Event-date-based |
| SLA breach | Email + Push + SMS | `/api/cron/sla` daily 6 AM | `slaAlertedAt`, quiet-hours filter |

### Event-Driven

| Trigger | Channel | Dedup |
|---------|---------|-------|
| New booking inquiry | Email (admin + guest) | One per DB insert |
| Quote sent | Email (guest) | Sets `quoteSentAt` |
| Deposit paid (webhook) | Email (guest) | Stripe event idempotency |
| Balance paid (webhook) | Email (guest) | Stripe event idempotency |
| DS application submitted | Email (admin + applicant) | One per DB insert |
| Academy purchase | Email (purchaser) | Stripe session idempotency |

### Manual (Admin-Triggered)

| Action | Channel |
|--------|---------|
| Send Quote Email | Email |
| Send Deposit Request | Email |
| Resend Balance Link | Email (via `resendBalanceLink`) |
| Copy WhatsApp Message | Clipboard (not email) |

---

## Hardening Rules

### 1. Email failure never reverses a booking or payment
All DB writes (booking confirmation, payment status) happen **before** email attempts. Email send failures are caught and logged but never throw or roll back.

### 2. Duplicate prevention
- Cron jobs use timestamp columns (`inquiryReminderSentAt`, `lastBalanceReminderSentAt`) with cooldowns
- Stripe webhooks use dual idempotency: `stripe_webhook_events` table + `booking_activities.stripeEventId` unique constraint
- Admin-triggered emails create `booking_activities` entries for audit trail

### 3. Retry safety
- Cron-based reminders are inherently idempotent (re-run checks timestamps)
- Webhook-driven emails are idempotent (re-delivery checks `paid_at` / `balance_paid_at`)
- Manual resend is always safe (admin clicks button; activity logged)

### 4. Portal security
- Portal links use `customer_portal_token` (UUID)
- Tokens can be revoked (`customer_portal_token_revoked_at`)
- Portal API checks `is('customer_portal_token_revoked_at', null)` on every request
- Clients cannot access other clients' data (token-scoped queries)

### 5. Service-role usage
- `supabaseAdmin` (service role key) is only used server-side (API routes, server actions, cron)
- Never exposed to client components
- Validated by middleware and route-level auth checks

### 6. Secrets in logs
- Email templates escape HTML inputs via `escapeHtmlForEmail()`
- Stripe webhook raw payloads are stored in `stripe_webhook_log` (admin-only access)
- No secrets (API keys, webhook secrets) appear in console logs

---

## Failed Notification Visibility

| Type | Where Visible |
|------|--------------|
| Failed email (cron) | Cron response JSON `errors` array; console logs |
| Failed email (webhook) | Console log; webhook still returns 200 |
| Failed SMS | `failed_sms` table |
| SLA breaches unresolved | Admin Action Queue (via SLA cron) |

**Recommendation:** Add an `email_send_log` table for production auditing when email volume grows. Current approach (console + activity log) is adequate for single-digit-per-day volumes.

---

## Push Notification Setup

Web Push requires VAPID keys:
```
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```
Generate with `npx web-push generate-vapid-keys`. Without these, push notifications silently skip.

---

## Production Configuration

| Variable | Purpose | Required |
|----------|---------|----------|
| `RESEND_API_KEY` | Email sending | Yes |
| `RESEND_FROM_EMAIL` | Sender address | Yes (domain-verified) |
| `RESEND_REPLY_TO` | Reply-to | Optional (default `hello@bornfidis.com`) |
| `ADMIN_EMAIL` | Admin notification inbox | Yes |
| `VAPID_PUBLIC_KEY` | Web Push | Optional |
| `VAPID_PRIVATE_KEY` | Web Push | Optional |
| `SMS_FALLBACK_ENABLED` | SMS alerts | Optional |
| `CRON_SECRET` | Cron auth | Yes (for Vercel cron) |
