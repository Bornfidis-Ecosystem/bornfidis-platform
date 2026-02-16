# Founder Control Checklist

Weekly and periodic actions to stay on top of the platform without getting lost in code.

---

## Weekly

- [ ] **Review analytics** — Open `/admin/academy` (when logged in as admin). Check total revenue, paid sales, free claims.
- [ ] **Review free-to-paid conversion** — Note the "Free → Paid Conversion" metric. Use it to decide where to improve funnel or messaging.
- [ ] **Review product performance** — Look at "Revenue by Product" table. See what sells and what doesn’t.
- [ ] **Decide next build** — Based on data and strategy: new product, post-purchase automation, or marketing step. Document the decision briefly.

---

## When adding a product or campaign

- [ ] **Pricing and positioning** — You set price and message. Cursor implements the mechanics.
- [ ] **Stripe product/price** — Create in Dashboard; add to `lib/academy-products.ts` (or provide price ID for env).
- [ ] **Test purchase and claim** — One paid and one free run-through before promoting.

---

## 30–60 day rhythm (from overview)

- **Week 1–2:** Stabilize Academy, monitor conversion, launch 3 core products.
- **Week 3–4:** Post-purchase automation, homepage positioning, founder visuals if planned.
- **Month 2:** First micro-course, upsell flow, structured marketing.

Adjust dates as needed; use this as a reminder of priorities, not a fixed schedule.

---

## What you own (founder)

- What problem we solve and for whom.
- Pricing, positioning, and product strategy.
- Visual direction and brand tone.
- Strategic partnerships and when to scale.

---

## What the system handles (Cursor / platform)

- Checkout, webhooks, and database.
- Analytics and conversion metrics.
- Security, refactors, and feature implementation.

Keeping this boundary clear reduces confusion and lets you operate as founder rather than only as builder.
