# Vercel environment variables

Set these in **Vercel → Project → Settings → Environment Variables**. Apply to **Production** (and Preview if you want preview deploys to work the same).

**Email roles (`ADMIN_EMAIL` vs `ADMIN_EMAILS`, From, Reply-To):** see [`docs/EMAIL_ROLES.md`](docs/EMAIL_ROLES.md).

---

## Required for core (app + admin + DB + auth)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Production URL, e.g. `https://platform.bornfidis.com`. Used for auth redirects, links, Stripe callbacks. **No trailing slash.** |
| `NEXT_PUBLIC_PLATFORM_ORIGIN` | Same canonical platform origin as above, e.g. `https://platform.bornfidis.com`. Used by `lib/wp-platform-integration.ts` (`platformBookingUrl()`). **No trailing slash.** Match **Production** (and Preview if previews should generate correct absolute links). |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (`https://xxxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (keep secret) |
| `DATABASE_URL` | Postgres connection string (direct, port 5432), e.g. `postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres?sslmode=require` |
| `DIRECT_URL` | Same as `DATABASE_URL` for Supabase (Prisma migrations) |
| `ADMIN_EMAILS` | Comma-separated **Supabase magic-link allowlist** for `/admin`. Example: `brian@bornfidis.com,bornfidisprovisions@gmail.com`. Does **not** control booking notification inbox — use `ADMIN_EMAIL`. See `docs/EMAIL_ROLES.md`. |
| `ADMIN_EMAIL` | **Booking & ops notification inbox** (e.g. `bookings@bornfidis.com`). Used by booking submit, submissions, Stripe consulting alert. If unset, falls back to `bookings@bornfidis.com` in code. |
| `RESEND_API_KEY` | Resend API key (email) |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Twilio number (E.164), e.g. `+18761234567` |

---

## Optional but recommended

| Variable | Description |
|----------|-------------|
| `RESEND_FROM_EMAIL` | Outbound From address (raw email). Sent as `Bornfidis Provisions <…>`. Example: `provisions@bornfidis.com` — verify domain in Resend. |
| `RESEND_REPLY_TO` | Reply-To for booking + generic transactional mail. Example: `hello@bornfidis.com`. Quotes: `lib/quote-email.ts`. |
| `NEXT_PUBLIC_SITE_NAME` | App name, e.g. `Bornfidis Provisions` |
| `NEXT_PUBLIC_APP_URL` | Fallback for invite links; can match `NEXT_PUBLIC_SITE_URL` |

---

## Required for specific features

| Variable | When to add |
|----------|-------------|
| `CRON_SECRET` | **Required if** you use Vercel Cron (crons in `vercel.json`). Same secret as Bearer token in cron requests. |
| `STRIPE_SECRET_KEY` | **Required if** you take payments (deposits, balance, Stripe Connect). |
| `STRIPE_WEBHOOK_SECRET` | **Required if** you use Stripe webhooks. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Required if** you have client-side Stripe (checkout, Connect). |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | **Required if** you use web push (admin). Generate: `npx web-push generate-vapid-keys`. |
| `EXCHANGE_RATE_API_KEY` | **Required if** you use multi-currency payouts and want live FX (cron). Otherwise fallback rates are used. |

---

## Optional feature flags / overrides

All have defaults in code; set only if you want to override.

| Variable | Example / notes |
|----------|------------------|
| `ADMIN_EMAIL` | Booking/ops notification inbox (see `docs/EMAIL_ROLES.md`). Example: `bookings@bornfidis.com` |
| `ADMIN_EMAILS` | `/admin` magic-link allowlist. Example: `brian@bornfidis.com,bornfidisprovisions@gmail.com` |
| `RESEND_REPLY_TO` | Public reply inbox, e.g. `hello@bornfidis.com` |
| `ADMIN_PASSWORD` | Legacy admin password (if still used by any route) |
| `ENABLE_CHEF_PAYOUT_BONUSES` | `true` / `false` |
| `ENABLE_CHEF_TIERED_RATES` | `true` / `false` |
| `EARNINGS_PROJECTIONS_ENABLED` | `true` / `false` |
| `NON_USD_PAYOUTS_ENABLED` | `true` to allow JMD/EUR/GBP |
| `ENABLE_REGION_PRICING` | `true` / `false` |
| `ENABLE_SURGE_PRICING` | `true` / `false` |
| `SMS_FALLBACK_ENABLED` | `true` / `false` |
| `SMS_FALLBACK_MAX_PER_DAY` | Number, default 5 |
| `SLA_ASSIGNMENT_HOURS` | Default 24 |
| `SLA_CONFIRMATION_HOURS` | Default 48 |
| `SLA_ARRIVAL_GRACE_MINUTES` | Default 15 |
| `SLA_ESCALATION_WINDOW_HOURS` | Default 4 |
| `SLA_QUIET_START_HOUR` | Default 22 |
| `SLA_QUIET_END_HOUR` | Default 7 |
| `OPS_LEAD_EMAIL` | For SLA escalation emails |
| `TWILIO_MESSAGING_SERVICE_SID` | Optional |
| `TWILIO_FROM_NUMBER` | Alternative to `TWILIO_PHONE_NUMBER` |
| `TWILIO_WHATSAPP_NUMBER` / `TWILIO_WHATSAPP_FROM` | For WhatsApp |

---

## Supabase redirect URL (auth)

In **Supabase Dashboard → Authentication → URL Configuration**:

- **Site URL:** set to `NEXT_PUBLIC_SITE_URL` (e.g. `https://platform.bornfidis.com`)
- **Redirect URLs:** add `https://platform.bornfidis.com/**` (or your domain) so magic links and callbacks work.

---

## Quick copy (core only)

```
NEXT_PUBLIC_SITE_URL=https://platform.bornfidis.com
NEXT_PUBLIC_PLATFORM_ORIGIN=https://platform.bornfidis.com
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres?sslmode=require
DIRECT_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres?sslmode=require
RESEND_API_KEY=re_...
ADMIN_EMAIL=bookings@bornfidis.com
ADMIN_EMAILS=brian@bornfidis.com,bornfidisprovisions@gmail.com
RESEND_FROM_EMAIL=provisions@bornfidis.com
RESEND_REPLY_TO=hello@bornfidis.com
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

Replace placeholders with your real values. Add `CRON_SECRET` if you use Vercel Cron; add Stripe and VAPID keys if you use those features.
