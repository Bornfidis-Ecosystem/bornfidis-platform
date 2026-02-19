# Bornfidis Academy — Final Pre-Launch Checklist

Use this checklist before switching Stripe to live mode and announcing the launch. Check off each item when complete.

---

## Technical

- [ ] **All four product pages are live and accessible**
  - URLs: `/academy/regenerative-enterprise-foundations`, `/academy/regenerative-farmer-blueprint`, `/academy/vermont-contractor-foundations`, `/academy/jamaican-chef-enterprise-system`
  - Test from production URL (e.g. https://platform.bornfidis.com/academy)

- [ ] **All cover images are loading correctly**
  - Expected files in `public/academy/covers/`: `regenerative-enterprise-foundations.png`, `regenerative-farmer-blueprint.png`, `vermont-contractor-foundations.png`, `jamaican-chef-enterprise-system.png`
  - If missing: add source PNGs to `public/academy/covers/_source/` and run `npm run copy-academy-covers`

- [ ] **All PDF files are uploaded and accessible via secure download**
  - Expected files in `storage/academy-products/`: see `storage/academy-products/README.txt` for exact filenames
  - Verify after a test purchase: My Library → Download returns the correct PDF

- [ ] **Stripe checkout is working in test mode for all four products**
  - Use test card `4242 4242 4242 4242`; see `docs/ACADEMY_PURCHASE_FLOW_TEST.md`
  - Confirm env: `STRIPE_SECRET_KEY` (test), `NEXT_PUBLIC_STRIPE_ACADEMY_REGENERATIVE_ENTERPRISE`, `_FARMER`, `_VERMONT_CONTRACTOR`, `_JAMAICAN_CHEF` (Price IDs)

- [ ] **Purchase confirmation emails are sending correctly**
  - Requires `RESEND_API_KEY` and sender domain in Resend
  - Subject: "Your [Product Title] is Ready"; body includes library link and support@bornfidis.com

- [ ] **My Library page displays purchased products correctly**
  - URL: `/dashboard/library` (or `/academy/library` → redirects)
  - Requires user to be signed in (Supabase)

- [ ] **Download links are working and secure (authentication required)**
  - Unauthenticated request to `/api/academy/download/[slug]` → redirects to login
  - Without purchase → 403 Forbidden

- [ ] **Mobile responsiveness is tested for all Academy pages**
  - /academy, /academy/[slug], /academy/success, /dashboard/library
  - Nav dropdown and footer links on small viewports

- [ ] **Page load times are acceptable (< 3 seconds)**
  - Test on production (or staging) with throttling if needed

---

## Content

- [ ] **All product descriptions are accurate and compelling**
  - Edit in `lib/academy-products.ts`: `description`, `subtitle` for each of the four manuals

- [ ] **All learning outcomes are clear and specific**
  - Same file: `learningOutcomes` array per product

- [ ] **All "What's Included" lists are complete**
  - Same file: `whatIsIncluded` array per product

- [ ] **All testimonials are added (or placeholders removed)**
  - Product detail page: `app/academy/[slug]/page.tsx` — `TESTIMONIAL_PLACEHOLDERS` (replace with real or remove section)

- [ ] **All FAQ sections are complete and helpful**
  - Same file: `FAQ_ITEMS` — currently 4 items (access, digital vs physical, updates, satisfaction/refund)

---

## Business

- [ ] **Stripe is switched from test mode to live mode**
  - In Stripe Dashboard: toggle to **Live**
  - Create live Products/Prices for all four (or duplicate from test), copy **live** Price IDs
  - Update env: `STRIPE_SECRET_KEY` → live key; `NEXT_PUBLIC_STRIPE_*` → live Price IDs
  - Add live webhook endpoint: `https://platform.bornfidis.com/api/webhooks/academy`, event `checkout.session.completed`, set `STRIPE_ACADEMY_WEBHOOK_SECRET` to live signing secret

- [ ] **Product prices are confirmed ($39, $49, $49, $79)**
  - Regenerative Enterprise Foundations: $39 | Farmer Blueprint: $49 | Vermont Contractor: $49 | Chef System: $79
  - Match in Stripe and in `lib/academy-products.ts` (`priceDisplay`, `priceCents`)

- [ ] **Refund policy is documented (90-day money-back guarantee)**
  - Already in product FAQ: "We offer a 90-day money-back guarantee. If you implement the systems and don't see results, we'll refund your purchase."
  - Optionally add a dedicated /refund-policy or /academy/terms page and link from footer

- [ ] **Support email is set up (support@bornfidis.com)**
  - Referenced in confirmation email and success-page error copy; ensure inbox is monitored

- [ ] **Launch announcement is drafted (email, social media, WhatsApp)**
  - Draft copy and schedule

---

## Marketing

- [ ] **Social media posts are scheduled (Instagram, Facebook, WhatsApp Status)**
- [ ] **Email announcement is ready to send to existing contacts**
- [ ] **WhatsApp message templates are prepared for farmer/chef groups**
- [ ] **Launch pricing or early-bird discount is decided (optional)**

---

## Post-Launch

- [ ] **Monitor first 10 purchases for any issues**
  - Stripe Dashboard, My Library access, download delivery, confirmation emails

- [ ] **Respond to customer support inquiries within 24 hours**
  - support@bornfidis.com

- [ ] **Collect testimonials from first buyers**
  - Replace placeholders in `app/academy/[slug]/page.tsx` or add a testimonial submission flow

- [ ] **Track revenue and conversion metrics weekly**
  - Stripe revenue; Academy analytics events: `academy_view`, `academy_product_view`, `academy_buy_click`, `academy_checkout_complete`, `academy_download_click` (wire to gtag/Plausible if not already)

- [ ] **Plan content marketing (blog posts, case studies, success stories)**

---

## Quick reference

| Item | Location / Env |
|------|----------------|
| Academy product data | `lib/academy-products.ts` |
| Cover images | `public/academy/covers/` — add sources to `_source/`, run `npm run copy-academy-covers` |
| PDF storage | `storage/academy-products/` — see README for filenames |
| Stripe setup | `docs/STRIPE_ACADEMY_SETUP.md` |
| Purchase flow test | `docs/ACADEMY_PURCHASE_FLOW_TEST.md` |
| Env vars (Academy) | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_ACADEMY_*` (4), `STRIPE_ACADEMY_WEBHOOK_SECRET`, `RESEND_API_KEY` (optional) |

---

**Launch:** When all checklist items are complete, switch Stripe to live mode, update environment variables, and publish your launch announcement.
