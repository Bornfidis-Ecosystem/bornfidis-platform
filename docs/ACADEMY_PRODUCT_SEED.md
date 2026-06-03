# Academy product seed

Populates the `academy_products` table with the 4 flagship products so the public Academy page shows live DB products.

## When to run

- After a fresh DB or when the `academy_products` table is empty.
- Safe to run anytime: **idempotent** (upserts by slug; existing rows are updated).

## How to run

From the project root, with `.env` or `.env.local` containing `DATABASE_URL` (or `DIRECT_URL` for direct Postgres):

```bash
npx tsx scripts/seed-academy-products.ts
```

Or use the npm script:

```bash
npm run db:seed-academy
```

**Requirements:** `DIRECT_URL` or `DATABASE_URL` must be set. No auth required beyond DB access.

## What gets seeded

| # | Slug | Title | Price | Featured |
|---|------|--------|-------|----------|
| 1 | `caribbean-culinary-foundations` | Caribbean Culinary Foundations | $79 | yes |
| 2 | `regenerative-enterprise-foundations` | Regenerative Enterprise Foundations | $39 | yes |
| 3 | `regenerative-farmer-blueprint` | Regenerative Farmer Blueprint | $49 | no |
| 4 | `vermont-contractor-foundations` | Vermont Contractor Foundations | $49 | no |

- **type:** `DOWNLOAD` for all.
- **active:** `true` for all.
- **stripePriceId:** From env if set (`NEXT_PUBLIC_STRIPE_ACADEMY_*`), otherwise `null`. Set in Admin → Academy products for paid checkout.

## Checkout behavior

- Checkout uses slug and resolves the product via `getAcademyProductBySlugPublic(slug)` (DB then static).
- If `stripePriceId` is null/empty, checkout will respond that the product is free and to use “Get for free”.
- After seeding, set Stripe Price IDs in **Admin → Academy products** (edit each product) so paid checkout works.
