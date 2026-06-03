# Operations Manual

Internal guide for running and maintaining the Bornfidis platform.

---

## 1. Adding an Academy product

1. **Stripe (for paid products):** In Stripe Dashboard → Products → Add product. Set name and price; copy the **Price ID** (e.g. `price_xxx`).
2. **Code:** Open `lib/academy-products.ts`. Add an object to the `ACADEMY_PRODUCTS` array with:
   - `slug` (URL-safe, e.g. `my-new-kit`)
   - `title`, `description`, `priceDisplay` (e.g. `$29`), `priceCents` (e.g. `2900`), `category`, `stripePriceId` (from Stripe or `''` for free)
   - Optional: `image`, `downloadUrl`, `courseUrl`
3. **Env (optional):** To keep price IDs out of code, set `NEXT_PUBLIC_STRIPE_ACADEMY_*` in `.env` and reference in the product (see existing products).
4. **Free products:** Use `stripePriceId: ''` and `priceCents: 0`. Customers use "Get for free" which calls `/api/academy/claim` and creates a purchase record.

No database migration needed for new products; catalog is code-based.

---

## 2. Testing Stripe (Academy)

1. **Test keys:** Use `STRIPE_SECRET_KEY=sk_test_...` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...` in `.env.local`.
2. **Webhook locally:** Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/academy`. Copy the webhook signing secret to `STRIPE_ACADEMY_WEBHOOK_SECRET`.
3. **Checkout:** Run app, go to Academy, click Buy on a paid product. Complete payment with test card (e.g. `4242 4242 4242 4242`). You should be redirected to Library and see the purchase; check that `academy_purchases` has a new row and that the confirmation email was sent (Resend dashboard or logs).
4. **Claim:** Click "Get for free" on a free product; you should be redirected to Library and see the item. Check that one row in `academy_purchases` has `stripe_session_id` starting with `free-`.

---

## 3. Deploy

- **Platform:** Vercel (or configured host). Connect repo; set env vars from `.env.example` (production values).
- **Build:** `prisma generate && next build`. Vercel runs this if `package.json` scripts are used.
- **Env:** Ensure `DATABASE_URL`, `DIRECT_URL`, `STRIPE_*`, `NEXT_PUBLIC_BASE_URL` (or `NEXT_PUBLIC_SITE_URL`), `RESEND_API_KEY`, Supabase keys, and admin/auth vars are set in the deployment environment.

---

## 4. Running migrations

- **When:** After pulling schema changes that include new or modified Prisma models (e.g. new tables, new columns).
- **Command:** `npx prisma migrate deploy` (production) or `npx prisma migrate dev` (local development).
- **Where:** Run against the same database the app uses (`DATABASE_URL`). For Vercel, run locally with production `DATABASE_URL` or use a CI step; migrations are not auto-run by Vercel by default.

---

## 5. Monitoring and errors

- **Vercel:** Dashboard → Project → Logs. Check for 500s, failed API routes, and server errors.
- **Stripe:** Dashboard → Developers → Webhooks. Check delivery and response codes for Academy and main webhook endpoints. Failed events show error details.
- **Resend:** Dashboard for email delivery and bounces.
- **Database:** Use your DB provider’s dashboard or `prisma studio` for spot-checks (e.g. `academy_purchases` after a test purchase).

---

## 6. Common operations

- **Refund (Academy):** Process refund in Stripe Dashboard. The platform does not auto-update `academy_purchases`; access is effectively revoked by not exposing a “refunded” state in Library if you add that later. For now, handle refunds and access outside the app or via support.
- **Changing product price:** Update Stripe price or create a new price and update `lib/academy-products.ts`. New purchases use the new snapshot; existing rows are unchanged.
- **Disabling a product:** Remove or comment out the product in `ACADEMY_PRODUCTS`; it will no longer appear on `/academy`. Existing purchases still show in Library (by slug); ensure `downloadUrl`/`courseUrl` still resolve if you keep them available.
