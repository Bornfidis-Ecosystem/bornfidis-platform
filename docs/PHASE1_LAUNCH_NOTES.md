# Phase 1 Launch Notes

**Status:** Operational — public website live  
**Launch date:** 2026-06-02  
**Latest production commit:** `700c45b` — *Add Bornfidis Difference homepage section* (merged to `main` as `098c4c1`)  
**Initial launch commit:** `88279a7` — *Phase 1 public website launch pass*  
**Production URL:** https://bornfidis.com

---

## Deployment

| Item | Result |
|------|--------|
| Git push (initial) | `master` pushed to `origin/master` (`bbfb725..88279a7`) |
| Git push (optimization) | `700c45b` → `origin/master`; merged to `origin/main` as `098c4c1` |
| Vercel build | Production redeployed successfully after `main` merge (`server: Vercel`, region `iad1`) |
| Health check | `GET /api/health` → `200`, database + Supabase connected |
| Founder QA | Completed before initial launch (forms, booking, nav, mobile) |

### Route verification (production)

All Phase 1 public routes returned **HTTP 200**:

- `/`
- `/book`
- `/contact`
- `/provisions`
- `/private-dining`
- `/our-story`
- `/journal`

Phase 1 markers confirmed in production HTML: hero photography (`brian-kitchen-black-coat`), **BOOK NOW** nav CTA, four primary SKUs in footer.

Post-optimization markers (2026-06-03): **The Bornfidis Difference** section, **Hospitality Credibility** block, `ConversionCtaBand` on key pages, hero names **Brian Maylor**, new photography assets under `public/images/bornfidis-*`.

---

## Final Phase 1 homepage optimization pass (2026-06-03)

**Commit:** `700c45b` on `master` → merged to `main` (`098c4c1`) for Vercel production deploy.

### Homepage conversion improvements

- Hero copy names **Brian Maylor** and states the 15-second value proposition (who, what, trust, how to book).
- **`ConversionCtaBand`** on Home final CTA — one primary action (Book Private Dining) plus three secondary paths (Request Product, Cooking Class, Contact).
- Shared conversion band added across Story, Journal, Provisions, Private Dining, and Book — no dead-end pages.
- Contact form pre-fills **service type** from URL params (`?service=product`, `?service=cooking-class`); footer **Request a Product** deep-links to `/contact?service=product`.
- Journal `#` placeholders replaced with book/contact links.

### Bornfidis Difference section

- New **`lib/bornfidis-difference.ts`** + **`HomeEditorial.tsx`** / **`home-editorial.css`**.
- Four-card bridge between founder story and service offers: **Jamaican Roots**, **World-Class Hospitality**, **Vermont Craft**, **Personal Service**.
- Placed after intro/values, before the three-way services grid.

### Trust / credibility additions

- New **`HospitalityCredibility`** component (`components/marketing/`) replaces the old Home credentials strip.
- Stats, Royal Caribbean milestones, guest testimonials, and RC appraisal quote from **`lib/hospitality-credibility.ts`**.
- Also deployed on **Private Dining** (after gallery, before occasion tiers).

### Photography improvements

- Centralized paths in **`lib/bornfidis-photos.ts`**; RC legacy imagery confined to story/credibility sections (not service heroes).
- New assets live in production (all **HTTP 200**): `brian-kitchen-chef-cap.png`, `seasonal-salad-watermelon-radish.png`, `portland-parish-valley.png`, RC credibility gallery (`brian-rc-guests-dining.png`, etc.).
- Our Story hero switched from RC vest to kitchen portrait; audit documented in **`docs/PHASE1_PHOTOGRAPHY_AUDIT.md`**.

### Production verification (2026-06-03)

| Check | Result |
|-------|--------|
| Vercel deploy after `main` merge | ✅ Live — cache age refreshed; new HTML markers present |
| Home — Bornfidis Difference | ✅ Four cards render (`bornfidis-difference` region) |
| Home + Private Dining — Hospitality Credibility | ✅ Stats, milestones, testimonials render |
| Photography assets | ✅ New `bornfidis-*` images return 200 |
| Mobile @ 390×844 — Home | ✅ Hamburger nav (Home, Private Dining, Provisions, Our Story, Journal, Contact, BOOK NOW) |
| Mobile — Private Dining | ✅ Hero, inquiry form, credibility block, conversion band |
| Mobile — Provisions | ✅ SKU filters, Request CTAs, conversion band |
| Mobile — Contact | ✅ Hero, inquiry form, service-type selector |

**Note:** Vercel **Production Branch** is **`main`**. Pushes to `master` alone do not deploy until merged to `main` (or branch setting changed). See `DEPLOY_STATUS.md`.

---

## Conversion flows (production smoke test)

| Flow | Endpoint / path | Result |
|------|-----------------|--------|
| Private dining booking | `/book` → `POST /api/submit-booking` | Form renders; API returns validation `400` on empty payload (expected) |
| Contact / cooking class / product inquiry | `/contact` → `POST /api/contact-booking` | Form renders with Cooking Class + Product service types; API returns field validation `400` on empty payload (expected) |
| Product request CTA | `/provisions` → **Request a Product** buttons | Present on all four SKUs; routes to contact flow |
| Mobile navigation | Hamburger menu @ 390×844 | Opens with Home, Private Dining, Provisions, Our Story, Journal, Contact, BOOK NOW |

**Note:** Smoke tests did not submit live inquiries to avoid polluting production data. Founder QA covered end-to-end submission.

---

## Domain & infrastructure

| Domain | Status |
|--------|--------|
| **bornfidis.com** | Resolves (`A` → Vercel). Serves Phase 1 Next.js marketing site + platform APIs. |
| **platform.bornfidis.com** | **Not configured** — DNS NXDOMAIN. Subdomain CNAME not yet added per `DNS_SETUP_PLATFORM.md`. |

**Implication:** Public marketing and booking currently live on **bornfidis.com**, not the platform subdomain. WordPress/marketing split rules still apply if WP is reintroduced on the root domain later — confirm DNS/hosting intent before any dual-host change.

---

## Phase 1 goals (operational focus)

| Goal | Target | How site supports it |
|------|--------|----------------------|
| Private dining bookings | 2 / month | `/book`, BOOK NOW nav, CTAs site-wide |
| Product orders | 10 / month | Four SKUs, Request a Product → `/contact` |
| Cooking classes | 1 / month | Contact form → Cooking Class service type |

**Next focus:** Outreach, discovery calls, proposals, and confirmed bookings — not further site expansion.

---

## Launch issues & follow-ups

### Blockers

None identified at launch. Site is operational for Phase 1 conversion paths.

### Non-blockers (deferred — do not block outreach)

1. **Journal newsletter** — button has no submit handler (stub).
2. **Provisions community email** — toast only; not wired to email/CRM.
3. **Journal Read links** — article links still `#` placeholders.
4. **Product photography** — B monogram placeholders on provision cards (intentional for Phase 1).
5. **No dedicated `/cooking-classes` page** — flows through Contact form.
6. **Academy / Sportswear / Experience** — routes exist but excluded from public nav (correct for Phase 1).
7. **`platform.bornfidis.com` DNS** — not live; update env vars and DNS when subdomain is needed.
8. **Git branch drift** — resolved for this pass via `master` → `main` merge (`098c4c1`). For future deploys, merge to **`main`** or set Vercel Production Branch to **`master`**. See `DEPLOY_STATUS.md`.

### Repo hygiene (local, unstaged)

- `app/admin/leaderboard/LeaderboardAdminClient.tsx`
- `app/payments/page.tsx`
- `app/resources/**` (brand token alignment)
- `Untitled` (stray file — safe to delete)

---

## Pre-launch QA reference

| Check | Result |
|-------|--------|
| Lint (changed marketing files) | Clean |
| Lint (full repo) | Pre-existing admin/chef errors |
| Typecheck | Pre-existing errors elsewhere; none in marketing files |
| Production build (`npm run build`) | Passed locally before commit |
| Protected flows | Booking API, contact API, Stripe, Resend, Supabase, admin — unchanged |

---

## Sign-off

Phase 1 public website is **live and operational** at https://bornfidis.com. The **final Phase 1 homepage optimization pass** (`700c45b`) is deployed to production. Focus shifts to revenue activity: outreach, discovery calls, proposals, and bookings — not further site expansion.
