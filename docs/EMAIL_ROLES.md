# Bornfidis platform — email roles

Source of truth for **who receives what** and **how outbound mail is branded**. Server config uses environment variables (see `.env.example` and `VERCEL_ENV.md`).

## Environment variables (production pattern)

| Variable | Example | Role |
|----------|---------|------|
| `ADMIN_EMAIL` | `bookings@bornfidis.com` | **Booking & ops notifications** — new inquiries, submission alerts, consulting checkout alerts. First address used if comma-separated. |
| `ADMIN_EMAILS` | `brian@bornfidis.com,bornfidisprovisions@gmail.com` | **Admin login allowlist** — who may open `/admin` via Supabase magic link (see `lib/auth.ts`). Not the same as `ADMIN_EMAIL`. |
| `RESEND_FROM_EMAIL` | `provisions@bornfidis.com` | **Customer-facing From** — transactional mail is sent as `Bornfidis Provisions <RESEND_FROM_EMAIL>` when set. Must be verified in Resend. |
| `RESEND_REPLY_TO` | `hello@bornfidis.com` | **Reply-To** — where customer replies land for booking confirmation, admin notification copy, generic `sendEmail`, and submission notifications. |
| `RESEND_API_KEY` | `re_…` | **Resend API** — required for any send. |

If `ADMIN_EMAIL` is unset at runtime, **`bookings@bornfidis.com`** is still used as the notification inbox (see `lib/platform-email.ts`). If `RESEND_REPLY_TO` is unset, **`hello@bornfidis.com`** is used as Reply-To.

## People & inboxes (policy)

| Purpose | Address | Notes |
|---------|---------|--------|
| Founder / owner | `brian@bornfidis.com` | Primary founder; include on `ADMIN_EMAILS` for dashboard access. |
| Founder (shared admin) | `admin@bornfidis.com` | Full founder permissions when seeded as `founder_admin` + Prisma `ADMIN`. |
| Backup admin login | `bornfidisprovisions@gmail.com` | Gmail backup; keep on `ADMIN_EMAILS` if this account should reach `/admin`. |
| Booking notifications | `bookings@bornfidis.com` | **`ADMIN_EMAIL`** — queue for new inquiries and related system mail. |
| Customer-facing sender | `provisions@bornfidis.com` | **`RESEND_FROM_EMAIL`** — culinary / luxury brand line. |
| Public / replies | `hello@bornfidis.com` | **`RESEND_REPLY_TO`** and public `mailto:` patterns on marketing pages where applicable. |
| System / backend | `tech@bornfidis.com` | Engineering, migrations, infrastructure; not wired as a default recipient in app code—add to `admin_user_roles` or ops lists as needed. |
| Internal admin (alias) | `admin@bornfidis.com` | Shared founder login alias — keep on `ADMIN_EMAILS` and `admin_user_roles` as `founder_admin` for full Culinary OS access. |

## Operations & hospitality (Caryll)

| Purpose | Address |
|---------|---------|
| Operations, client communication, scheduling, approvals, hospitality coordination; WordPress/admin access (later) | **`caryll@bornfidis.com`** |

Add this address to **`ADMIN_EMAILS`** (and/or `admin_user_roles`) when that person should access the platform admin. **Do not** confuse with `ADMIN_EMAIL`: booking notifications remain on `bookings@bornfidis.com` unless product explicitly changes that policy.

## Code references

- **Notification recipient:** `bookingNotificationRecipient()` in `lib/platform-email.ts`
- **Reply-To helper:** `transactionalReplyToPayload()` in `lib/platform-email.ts`
- **Booking submit (API):** `app/api/submit-booking/route.ts`
- **Booking submit (server action):** `app/actions.ts`
- **Stripe consulting alert:** `app/api/stripe/webhook/route.ts`
- **Submission notifications:** `lib/email-utils.ts`
- **Core Resend sends:** `lib/email.ts` (booking confirmation, admin notification, `sendEmail`)
- **Quote emails:** `lib/quote-email.ts` (uses `RESEND_REPLY_TO`, default `hello@bornfidis.com`)
