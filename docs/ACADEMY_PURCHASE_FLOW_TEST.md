# Academy Purchase Flow — Test Checklist

## Prerequisites

- **Sign in required for purchase:** You must be signed in (Supabase) before "Buy Now". If not signed in, clicking "Buy Now" redirects to `/admin/login?next=/academy/[slug]`. After logging in (e.g. magic link), you are returned to the product page to complete checkout.
- `.env` / `.env.local`: `STRIPE_SECRET_KEY` (test), `NEXT_PUBLIC_STRIPE_ACADEMY_*` price IDs for all four products, `STRIPE_ACADEMY_WEBHOOK_SECRET`, `DATABASE_URL`, Supabase auth vars, `RESEND_API_KEY` (optional, for email).
- Stripe Dashboard in **Test mode**; webhook endpoint `https://your-domain/api/webhooks/academy` with event `checkout.session.completed` (or use Stripe CLI for local).
- Four PDFs in `storage/academy-products/` (see storage README).
- **Cover images (optional):** Product detail pages use `/academy/covers/<slug>.png`. To fix broken covers, add source PNGs to `public/academy/covers/_source/` and run `npm run copy-academy-covers`.

## Products to Test

| # | Product | Slug | Price |
|---|---------|------|-------|
| 1 | Regenerative Enterprise Foundations™ | regenerative-enterprise-foundations | $39 |
| 2 | Regenerative Farmer Blueprint | regenerative-farmer-blueprint | $49 |
| 3 | Vermont Contractor Foundations™ | vermont-contractor-foundations | $49 |
| 4 | Jamaican Chef Enterprise System™ | jamaican-chef-enterprise-system | $79 |

## Flow (repeat for each product)

1. **Navigate to /academy** — Hero and featured 2x2 grid with category filter.
2. **Click product card** — Goes to `/academy/[slug]`. Verify:
   - Cover image, title, subtitle, price
   - Description, target audience, learning outcomes, what's included
   - FAQ section, final CTA
3. **Click "Buy Now"** — Button shows spinner "Redirecting…", then redirects to Stripe Checkout.
4. **Stripe Checkout** — Use test card `4242 4242 4242 4242`, any future expiry, any CVC. Complete payment.
5. **Redirect to /academy/success?session_id=...** — Verify:
   - "Thank you for your purchase! Your manual is ready."
   - "Download [Product Title]" button
   - "Open My Library" button
6. **Click "Download [Product Title]"** — PDF downloads (browser may open in new tab or download; user must be logged in).
7. **Navigate to My Library** — Use `/academy/library` (redirects to `/dashboard/library`) or `/dashboard/library`. Verify:
   - Product appears with cover, title, purchase date
   - "Download" button present
8. **Click "Download" from My Library** — PDF downloads again.
9. **Email** — If Resend is configured, check inbox for "Your [Product Title] is Ready" with library link and support@bornfidis.com.

## Edge Cases

| Case | Expected | Implementation |
|------|----------|----------------|
| Download without purchase | 403 Forbidden | `/api/academy/download/[slug]` checks `AcademyPurchase` for user + slug. |
| Download without auth | Redirect to login | GET download without session → 302 to `/admin/login?next=/dashboard/library`. |
| Purchase same product twice | Allowed; two rows | Each Stripe session creates one `AcademyPurchase` (unique `stripeSessionId`). |
| Success page without session_id | Generic thank you + My Library link | No Stripe call; still useful. |
| Success page with invalid session_id | 404 | `stripe.checkout.sessions.retrieve` throws. |

## Fixes Applied (Pre-Launch)

- **/academy/library** — Middleware redirects to `/dashboard/library` so both URLs work.
- **Download without auth** — API returns `302` to `/admin/login?next=/dashboard/library` instead of `401` JSON so browser users get a login page.
- **Buy Now without auth** — Checkout API returns `401`; client redirects to `/admin/login?next=/academy/[slug]` so user can sign in and return to complete purchase.
- **Duplicate email** — Only one of (webhook, success page) creates the purchase and sends email (idempotent by `stripeSessionId`).

## Test Card

- **Number:** 4242 4242 4242 4242  
- **Expiry:** Any future date (e.g. 12/34)  
- **CVC:** Any 3 digits  

## Bugs Fixed During Testing

| Issue | Fix |
|-------|-----|
| Buy Now when not signed in showed "You must be signed in to purchase" | Client now redirects to `/admin/login?next=/academy/[slug]` on 401 so user can sign in and return. |
| Success/cancel URLs from Stripe used fixed `localhost:3000` in dev | `getBaseUrl(req)` now uses request URL host so when dev runs on 3001, Stripe redirects back to the same port. |
| Cover images broken on product detail pages | Expected until source PNGs are added to `public/academy/covers/_source/` and `npm run copy-academy-covers` is run. |

## Quick Verification Commands

```bash
# Ensure PDFs exist
ls storage/academy-products/*.pdf

# Run app
npm run dev
# Then open http://localhost:3000/academy and run through one product.
```
