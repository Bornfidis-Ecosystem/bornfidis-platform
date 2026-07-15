# Email Flow — Bornfidis Platform

**Date:** 2026-07-14 (Phase 7)
**Provider:** Resend (`RESEND_API_KEY`)
**Sender domain:** Configured via `RESEND_FROM_EMAIL` (default `provisions@bornfidis.com`)
**All links:** `https://bornfidis.com` (enforced by `lib/site-url.ts`)

---

## Division-Aware Sender Identity

| Division | `from` Display Name | Notes |
|----------|---------------------|-------|
| Provisions | Bornfidis Provisions | Default for all booking/event emails |
| Digital Studio | Bornfidis Digital Studio | DS applications and project comms |
| Admin | Bornfidis | Internal notifications, magic links |
| Academy | Bornfidis Academy | Purchase confirmations |

All use the same `RESEND_FROM_EMAIL` address (domain-verified in Resend).

---

## Email Template Inventory

| Template | Function | Trigger | Sender | Recipient | Dedup Mechanism | Delivery Logged |
|----------|----------|---------|--------|-----------|-----------------|-----------------|
| Inquiry received (guest) | `sendBookingConfirmationEmail` | `/api/submit-booking` after DB write | Provisions | Guest email | One per booking create | No (console only) |
| Admin lead notification | `sendAdminNotificationEmail` | `/api/submit-booking` after DB write | Provisions | `ADMIN_EMAIL` / `bookings@bornfidis.com` | One per booking create | No |
| Quote offer | `sendQuoteOfferEmail` | Admin action: `sendBookingQuoteOfferEmail` | Provisions | Guest email | Sets `quoteSentAt` + activity log | Activity log |
| Deposit request | `sendDepositRequestEmail` | Admin action: `sendBookingDepositRequestEmail` | Provisions | Guest email | Activity log | Activity log |
| Deposit received (guest) | `sendDepositReceivedEmail` | Stripe webhook (deposit_paid) | Provisions | Guest email | Webhook idempotency | No |
| Booking confirmed | `sendPrivateDiningBookingConfirmedEmail` | Stripe webhook (deposit_paid) | Provisions | Guest email | Webhook idempotency | No |
| Balance reminder | `sendEmail` (generic) | Cron: `/api/cron/balance-reminders` | Provisions | Guest email | `lastBalanceReminderSentAt` + 7-day cooldown | Activity log |
| Inquiry nudge | `sendInquiryStalenessReminderEmail` | Cron: `/api/cron/inquiry-reminders` | Provisions | Guest email | `inquiryReminderSentAt` (one-time) | Activity log |
| Invoice | `sendInvoiceEmail` | Admin action: `sendBalanceInvoice` | Provisions | Guest email | Activity log | Activity log |
| DS application (admin) | `sendDigitalStudioApplicationEmails` | `/api/digital-studio/apply` | Admin | `ADMIN_EMAIL` | One per application create | No |
| DS application (guest) | `sendDigitalStudioApplicationEmails` | `/api/digital-studio/apply` | Digital Studio | Applicant email | One per application create | No |
| Academy purchase | `sendAcademyPurchaseConfirmationEmail` | Academy webhook | Academy | Purchaser email | Webhook idempotency | No |
| Booking approved | `sendBookingApprovedEmail` | Admin status change | Provisions | Guest email | Per admin action | No |
| Booking declined | `sendBookingDeclinedEmail` | Admin status change | Provisions | Guest email | Per admin action | No |
| Chef onboarding | `sendChefOnboardingEmail` | Admin invite | Provisions | Chef email | Per invite action | No |
| Admin magic link | `sendAdminMagicLinkEmail` | Login flow | Admin | Admin email | Per login request | No |
| Team invite | `sendInviteEmail` | Admin action | Admin | Invitee email | Per invite | No |
| Chef monthly statement | `sendChefMonthlyStatementEmail` | Cron: monthly | Provisions | Chef email | Cron dedup | No |
| Chef tax summary | `sendChefTaxSummaryEmail` | Cron: annual | Provisions | Chef email | Cron dedup | No |
| SLA alert | `sendSlaAlertEmail` | Cron: `/api/cron/sla` | Admin | Admin emails | `slaAlertedAt` | No |
| SLA escalation | `sendSlaEscalationEmail` | Cron: `/api/cron/sla` | Admin | Ops lead | `slaEscalatedAt` | No |
| Lead magnet | `sendLeadMagnetDeliveryEmail` | Lead magnet download | Provisions | Subscriber email | Per download | No |
| Submission notification | `sendSubmissionNotificationEmail` | Contact/submission form | Provisions | Admin | Per submission | No |

---

## Failure Handling

All email send functions follow this pattern:
1. Check `resend` client exists (returns `{ success: false }` if not)
2. Validate `to` address (returns error if invalid)
3. Try `resend.emails.send()`
4. On catch: log to console, return `{ success: false, error }`
5. **Email failure never rolls back the booking or payment action** — DB writes happen before email attempts

**Critical safety rule:** A failed email must never reverse a successful booking confirmation or payment. The webhook handler confirms the booking in DB, then attempts email — failure is logged but non-fatal.

---

## Deduplication

| Mechanism | Where Used |
|-----------|-----------|
| `inquiryReminderSentAt` | Inquiry nudge cron (one-time per booking) |
| `lastBalanceReminderSentAt` | Balance reminder cron (7-day cooldown) |
| `quoteSentAt` | Quote email (admin-triggered, sets timestamp) |
| `testimonialRequestedAt` | Testimonial request (one-time) |
| Stripe webhook idempotency | Deposit/balance confirmation emails |
| BookingActivity `stripeEventId` unique | Prevents duplicate activity rows |

---

## Manual Resend

Admins can resend emails from the booking detail page:
- **Send Quote Email** — `BookingDetailClient` → `sendBookingQuoteOfferEmail`
- **Send Deposit Request** — `BookingDetailClient` → `sendBookingDepositRequestEmail`
- **Send Balance Invoice** — `BookingDetailClient` → `resendBalanceLink`
- **Copy WhatsApp message** — clipboard (not email, but manual outreach)

---

## Legal Footer

All guest-facing emails include:
> © 2026 Bornfidis. Bornfidis Provisions and Bornfidis Digital Studio are assumed names of Bornfidis Sportswear LLC.

---

## Email Send Log (Phase 8)

All email send attempts are now logged to the `email_send_log` table via `logEmailSend()` in `lib/email-send-log.ts`:

| Field | Purpose |
|-------|---------|
| `division` | provisions / digital-studio / admin / academy |
| `template_type` | Template identifier (e.g., `booking_confirmed`) |
| `recipient` | Email address |
| `subject` | Email subject line |
| `booking_id` | Linked booking (nullable) |
| `project_id` | Linked DS project (nullable) |
| `status` | sent / failed / pending |
| `error_message` | Error details on failure |
| `attempt_count` | Number of attempts |
| `actor_name` | Who triggered (System / Admin / Cron) |
| `sent_at` | Timestamp |

**Admin UI:** `/admin/email-log` — view all sends, filter by status, see failed emails.

**Dashboard integration:** Failed emails surface in the Action Queue when count > 0.

**Manual resend:** Planned for next phase — admin can trigger resend from email log, creating a new log entry.

---

## Production Configuration

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Sender address (domain-verified) |
| `RESEND_REPLY_TO` | Reply-to address (default `hello@bornfidis.com`) |
| `ADMIN_EMAIL` | Admin notification recipient |
| `NEXT_PUBLIC_SITE_URL` | Base URL for all email links |
