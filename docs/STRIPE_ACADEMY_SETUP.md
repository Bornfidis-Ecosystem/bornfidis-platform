# Stripe Academy Checkout Setup

## 1. Create products and prices in Stripe

In [Stripe Dashboard → Products](https://dashboard.stripe.com/products), create four products and add a **one-time** USD price to each:

| Product name | Price (USD) | Env variable |
|--------------|-------------|--------------|
| Regenerative Enterprise Foundations™ | $39 | `NEXT_PUBLIC_STRIPE_ACADEMY_REGENERATIVE_ENTERPRISE` |
| Regenerative Farmer Blueprint | $49 | `NEXT_PUBLIC_STRIPE_ACADEMY_REGENERATIVE_FARMER` |
| Vermont Contractor Foundations™ | $49 | `NEXT_PUBLIC_STRIPE_ACADEMY_VERMONT_CONTRACTOR` |
| Jamaican Chef Enterprise System™ | $79 | `NEXT_PUBLIC_STRIPE_ACADEMY_JAMAICAN_CHEF` |

For each product:
1. Click **Add product**
2. Name: (as in table)
3. **Add price** → One-time → **$XX USD** → Save
4. Copy the **Price ID** (starts with `price_`) into your `.env` / Vercel env for the matching variable

## 2. Webhook

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://your-domain.com/api/webhooks/academy` (or `http://localhost:3000/api/webhooks/academy` for local with Stripe CLI)
3. Event: `checkout.session.completed`
4. Copy the **Signing secret** (starts with `whsec_`) → `STRIPE_ACADEMY_WEBHOOK_SECRET`

## 3. Test mode

- Use **Test mode** (toggle in Stripe Dashboard) and test keys (`sk_test_...`, `pk_test_...`) in `.env`
- Test card: **4242 4242 4242 4242**
- Any future expiry, any CVC
- After payment, Stripe redirects to `/academy/success?session_id=...`; the webhook records the purchase and the user can open **My Library** to download

## 4. Flow summary

- **Buy Now** → `POST /api/academy/checkout` with `{ productId: "<slug>" }` → returns Stripe Checkout URL → redirect to Stripe
- **Success** → Stripe redirects to `/academy/success?session_id={CHECKOUT_SESSION_ID}`
- **Cancel** → Stripe redirects to `/academy/<slug>` (product detail)
- **Webhook** → On `checkout.session.completed`, creates `AcademyPurchase` and sends confirmation email
