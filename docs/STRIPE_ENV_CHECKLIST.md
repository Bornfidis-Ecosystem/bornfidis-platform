# Stripe & Academy — Environment Variables Checklist

Set these in **Vercel** (Project → Settings → Environment Variables) for **Production** (and Preview if you want test checkouts there).

## Required for Academy checkout

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...` for test, `sk_live_...` for live) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...` or `pk_live_...`) |
| `STRIPE_ACADEMY_WEBHOOK_SECRET` | Signing secret from Stripe webhook for `/api/webhooks/academy` (event: `checkout.session.completed`) |
| `NEXT_PUBLIC_BASE_URL` | Production URL, e.g. `https://platform.bornfidis.com` (used for success/cancel redirects) |
| `NEXT_PUBLIC_STRIPE_ACADEMY_REGENERATIVE_ENTERPRISE` | Stripe Price ID for Regenerative Enterprise Foundations ($39) |
| `NEXT_PUBLIC_STRIPE_ACADEMY_REGENERATIVE_FARMER` | Stripe Price ID for Regenerative Farmer Blueprint ($49) |
| `NEXT_PUBLIC_STRIPE_ACADEMY_VERMONT_CONTRACTOR` | Stripe Price ID for Vermont Contractor Foundations ($49) |
| `NEXT_PUBLIC_STRIPE_ACADEMY_JAMAICAN_CHEF` | Stripe Price ID for Jamaican Chef Enterprise System ($79) |

Create the four products and one-time prices in [Stripe Dashboard → Products](https://dashboard.stripe.com/products), then copy each **Price ID** (`price_...`) into the matching env var. See [STRIPE_ACADEMY_SETUP.md](./STRIPE_ACADEMY_SETUP.md) for step-by-step.

## Optional (confirmation email)

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | For sending purchase confirmation emails with library link |
| `RESEND_FROM_EMAIL` | e.g. `Bornfidis <noreply@bornfidis.com>` (verify domain in Resend) |

## Going live

1. In Stripe Dashboard, switch to **Live** mode.
2. Create live products/prices (or duplicate from test), copy **live** Price IDs.
3. Update env: `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to live keys; all four `NEXT_PUBLIC_STRIPE_ACADEMY_*` to live Price IDs.
4. Add live webhook: `https://platform.bornfidis.com/api/webhooks/academy`, event `checkout.session.completed`; set `STRIPE_ACADEMY_WEBHOOK_SECRET` to the live webhook signing secret.
5. Redeploy so new env is applied.
