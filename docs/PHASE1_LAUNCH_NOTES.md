# Phase 1 Launch Notes

**Status:** Operational — public website live  
**Launch date:** 2026-06-02  
**Commit:** `88279a7` — *Phase 1 public website launch pass*  
**Production URL:** https://bornfidis.com

---

## Deployment

| Item | Result |
|------|--------|
| Git push | `master` pushed to `origin/master` (`bbfb725..88279a7`) |
| Vercel build | Production serving on Vercel (`server: Vercel`, region `iad1`) |
| Health check | `GET /api/health` → `200`, database + Supabase connected |
| Founder QA | Completed before push (forms, booking, nav, mobile) |

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
8. **Git branch drift** — `origin/main` is many commits behind `origin/master`. Confirm Vercel **Production Branch** is `master` (or merge master → main) before future deploys. See `DEPLOY_STATUS.md`.

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

Phase 1 public website is **live and operational** at https://bornfidis.com. Focus shifts to revenue activity: outreach, discovery calls, proposals, and bookings.
