# Platform Architecture Overview

Internal reference for how the Bornfidis platform is structured. Export to PDF as needed.

---

## 1. Commerce pipeline (Academy)

End-to-end flow when a customer buys or claims an Academy product:

1. **User action** — Clicks "Buy" or "Get for free" on `/academy` or `/academy/[slug]`.
2. **Paid:** Frontend calls `POST /api/academy/checkout` with `{ productId: slug }`. User must be logged in (Supabase). API creates a Stripe Checkout session with `client_reference_id` (user id) and `metadata.productSlug`, then returns `{ url }`. User is redirected to Stripe Hosted Checkout.
3. **Free:** Frontend calls `POST /api/academy/claim` with `{ productId: slug }`. API creates an `AcademyPurchase` record with `stripeSessionId: free-{uuid}` and returns `{ url: '/dashboard/library' }`. User is redirected to Library.
4. **Stripe (paid only):** After payment, Stripe redirects to `success_url` (`/dashboard/library`) and sends a `checkout.session.completed` event to the Academy webhook.
5. **Webhook:** `POST /api/webhooks/academy` receives the event, verifies signature with `STRIPE_ACADEMY_WEBHOOK_SECRET`, checks idempotency (if `stripeSessionId` already exists, returns 200). Otherwise creates `AcademyPurchase` with product snapshot (title, price in cents), then sends purchase confirmation email to `session.customer_email`.
6. **Library:** `/dashboard/library` is protected; it loads purchases for the current user (`authUserId`) from `academy_purchases` and displays snapshot title, price, and download/course links (resolved from catalog by slug).

No client-side Stripe keys. All payment handling is server-side.

---

## 2. Checkout flow (technical)

- **Academy checkout:** `app/api/academy/checkout/route.ts` — Validates product slug, looks up `stripePriceId` from `lib/academy-products.ts`, creates Stripe session (mode: payment), sets success/cancel URLs via `getBaseUrl()`.
- **Passive income checkout:** `app/api/checkout/route.ts` — Accepts `{ priceId }` directly; creates one-time Stripe session; success to `/passive/success`, cancel to `/passive`.
- **Booking deposits/balance:** Handled by `app/api/stripe/*` and main `app/api/stripe/webhook/route.ts` (metadata: booking_id, payment type).

---

## 3. Webhook behavior

- **Academy:** `app/api/webhooks/academy/route.ts` — Separate endpoint and secret (`STRIPE_ACADEMY_WEBHOOK_SECRET`). Listens for `checkout.session.completed`; reads `metadata.productSlug` and `client_reference_id`; idempotent by `stripeSessionId`; writes to `academy_purchases`; sends confirmation email.
- **Main Stripe webhook:** `app/api/stripe/webhook/route.ts` — Used for booking-related payments (deposit, balance). Uses `STRIPE_WEBHOOK_SECRET`.

---

## 4. Database (relevant models)

- **academy_purchases** — id, auth_user_id (Supabase user id), product_slug, product_title, product_price (cents), stripe_session_id (unique), purchased_at, created_at. Snapshot at purchase time so catalog changes do not alter history.
- **booking_inquiries** — Core booking and payment fields; linked to Stripe sessions via metadata.
- **users** — Prisma User (openId, email, role); admin area uses role (ADMIN, STAFF, COORDINATOR).

Schema: `prisma/schema.prisma`. Migrations: `prisma/migrations/`.

---

## 5. Admin structure

- **Protection:** All `/admin/*` routes are wrapped by `app/admin/layout.tsx`, which calls `checkAdminAccess()`. If not authenticated or not in allowed roles (ADMIN, STAFF, COORDINATOR), user is redirected to login or shown Access Denied.
- **API:** Admin API routes use `requireAdmin(request)` from `lib/requireAdmin.ts` and return 401 if not authorized.
- **Nav:** Admin nav items are defined in `lib/nav-config.ts` and filtered by role in `lib/filter-nav.ts`; rendered in `components/AppNav.tsx`.
- **Academy analytics:** `/admin/academy` shows revenue, paid sales, free claims, free-to-paid conversion rate, average order value, and revenue-by-product table. Data from `lib/academy-stats.ts` (Prisma groupBy on academy_purchases). API: `GET /api/admin/academy/stats` (optional `?period=30` for lifetime vs last 30 days).

---

## 6. Auth

- **Supabase** — Session via cookies; `createServerSupabaseClient()` in `lib/auth.ts`.
- **Admin:** `getServerAuthUser()` returns user only if email is in `ADMIN_EMAILS` allowlist.
- **Academy / Library:** `getCurrentSupabaseUser()` returns any authenticated Supabase user (no allowlist). Used for checkout, claim, and library access.

---

## 7. Key files

| Area            | Path |
|-----------------|------|
| Academy catalog | lib/academy-products.ts |
| Academy stats   | lib/academy-stats.ts |
| Academy checkout | app/api/academy/checkout/route.ts |
| Academy claim   | app/api/academy/claim/route.ts |
| Academy webhook | app/api/webhooks/academy/route.ts |
| Library page    | app/dashboard/library/page.tsx |
| Admin Academy   | app/admin/academy/page.tsx |
| Format currency | lib/formatCurrency.ts |
| Auth            | lib/auth.ts, lib/requireAdmin.ts |
