# Bornfidis Unified Ecosystem — System Audit

**Date:** 2026-07-13 (updated after Phase 1–2 implementation start)  
**Canonical production domain:** `https://bornfidis.com`  
**Legal entity:** Bornfidis Sportswear LLC  
**DBAs (assumed names):** Bornfidis Provisions · Bornfidis Digital Studio  
**Public umbrella:** Bornfidis  

**Implementation progress:** diagnose-db locked; umbrella homepage + nav; footer legal line; `/privacy` + `/terms`; `/digital-studio/apply`; `/client-portal` → `/portal` redirect; `LEGAL_REVIEW_REQUIRED.md` created.  
**Rule:** Do not create or rely on `platform.bornfidis.com`. Do not ship unfinished modules as usable.

**Status key**

| Status | Meaning |
|--------|---------|
| **LIVE** | Production-path works end-to-end (or for that surface) |
| **PARTIAL** | Real code/path exists; gaps, dual systems, or missing CRM |
| **PLACEHOLDER** | UI/copy only, stub, missing page, or intentionally non-functional |
| **BROKEN** | Linked or documented URL/path fails or critical drift |

---

## Executive summary

The app is a **large Provisions / Culinary OS** stack with a Digital Studio pilot and Academy/Sportswear satellites. It is **not yet** a clean umbrella ecosystem homepage with clean DBA legal lines, unified leads, or a quote builder that saves and pays.

Highest risks before claiming production-ready:

1. Homepage and primary nav still read as **Provisions-only**, not umbrella Bornfidis with two divisions.
2. **No in-app `/privacy` or `/terms`**; footer links assume WordPress paths on the same hostname.
3. **`/contact` (product + cooking class)** shares booking validation and can fail when guests are empty; product slug discarded.
4. **Digital Studio applications are email-only** — not in admin CRM.
5. **Quote Builder** (`/admin/quotes/builder`) is preview-only; real money path is `BookingInquiry` quotes + `/portal/[token]`.
6. Admin sidebar exposes **~40 modules**, including labs and one **404** (`/admin/margin-guardrails`).
7. Unauthenticated **`/api/diagnose-db`** can use service-role credentials.
8. Dual booking/quote stacks (`booking_inquiries` vs `quotes`/`bookings`) confuse ops.
9. Docs still mention `platform.bornfidis.com`; middleware already 308s it to `bornfidis.com`.

---

## Feature audit table

| Feature | Current status | Route | Component / API | Supabase / Prisma table | Email template | Stripe dependency | Missing work | Risk | Recommended action |
|---------|----------------|-------|-----------------|-------------------------|----------------|-------------------|--------------|------|--------------------|
| Umbrella homepage | PARTIAL | `/` | `app/page.tsx`, `HomeEditorial.tsx` | — | — | — | Ecosystem messaging, two division cards, umbrella brand | Med | Rebuild Phase 1 IA; keep photography |
| Provisions overview | PARTIAL | `/provisions` | `app/provisions/page.tsx`, `Provisions.tsx` | Static `lib/provisions-products.ts` | Via contact | None (request-only) | No checkout; OK if intentional | Low | Keep request-only; wire source/product into leads |
| Private dining sales | LIVE | `/private-dining` | `PrivateDining.tsx` | `booking_inquiries` | Inquiry + admin notify | Later deposit | WP slug conflict if WP also hosts | Med | Keep; confirm DNS owns Next |
| Book / inquiry | LIVE | `/book` | `BookingInquiryForm`, `/api/submit-booking` | `booking_inquiries`, `ClientProfile` | Guest confirm + admin | — | `source`/UTM unused; no rate limit | Med | Add source, rate limit, honeypot keep |
| Digital Studio pilot | LIVE | `/digital-studio` | `DigitalStudioPageContent`, apply form | — | Application pair | — | noindex OK; no CRM | Med | Persist applications → admin |
| Digital Studio apply URL | PLACEHOLDER | `/digital-studio/apply` | — | — | — | — | No page; form is `#apply` | Low | Add page or redirect → `#apply` |
| Our Story | LIVE | `/our-story` | `StoryPage.tsx` | — | — | — | — | Low | Keep; update legal wording if needed |
| Contact | PARTIAL | `/contact` | `ContactPageContent`, `/api/contact-booking` | `booking_inquiries` | Same as book | — | Guests required by schema; product param ignored | **High** | Fix validation & typed lead_type/source |
| Product request | PARTIAL | `/contact?service=product` | Same as contact | `booking_inquiries` | Same | — | No product metadata | High | Capture product id in metadata/source |
| Cooking class inquiry | PARTIAL | `/contact?service=cooking-class` | Same as contact | `booking_inquiries` | Same | — | Not dedicated lead_type | Med | Same contact pipeline harden |
| Newsletter (journal) | PLACEHOLDER | Journal UI | `JournalPage.tsx` | — | — | — | Link-only; no subscribe | Low | Hide or wire EmailSubscriber |
| Lead magnet list growth | LIVE | `/guide/5-caribbean-sauces` | Lead magnet form + API | `email_subscribers` | PDF delivery | — | No source column | Low | Optional: add source |
| Privacy policy (app) | PLACEHOLDER | `/privacy` missing | Footer → `bornfidis.com/privacy` | — | — | — | No Next page; WP assumption | **High** | Ship branded `/privacy` |
| Terms | PLACEHOLDER | `/terms` missing | Footer → `bornfidis.com/terms` | — | — | — | Same | **High** | Ship branded `/terms` |
| Legal / footer entity | PARTIAL | Global footer | `lib/brand-legal.ts`, `PublicFooter.tsx` | — | — | — | Digital Studio DBA missing; umbrella “Bornfidis” not used | Med | Phase 2 legal line + LEGAL_REVIEW_REQUIRED.md |
| Client portal (named) | BROKEN | `/client-portal/[token]` | — | — | — | — | Route does not exist | Med | Redirect → `/portal/[token]` |
| Client portal (actual) | LIVE | `/portal/[token]` | `PortalClient`, portal APIs | `booking_inquiries.customer_portal_token*` | Deposit/confirm emails | Deposit + balance Checkout | Token-in-URL; Review schema drift risk | Med | Harden expiry; verify Review model |
| Admin shell | LIVE | `/admin/*` | `layout.tsx`, Culinary OS | Many | — | — | Oversized nav | Med | Phase 4 regroup + `/admin/labs` |
| Admin dashboard metrics | LIVE | `/admin` | Founder/ops metric libs | `booking_inquiries`, academy, etc. | — | Reflects Stripe when paid | Empty DB shows $0 (honest but easy to misread) | Med | “No recorded payments” copy |
| Admin nav — Schedule | PLACEHOLDER | `/admin/schedule` | Placeholder page | — | — | — | In primary nav | Med | Move to labs or remove |
| Admin nav — Margin guardrails | BROKEN | `/admin/margin-guardrails` | Client/actions only | Config model | — | — | **No `page.tsx` → 404** | High | Remove from nav or add page → labs |
| Labs (investors, board, succession, experiments, scenarios, AI forecast, surge) | PARTIAL | Various `/admin/*` | Real aggregations / heuristics | Mixed; surge Prisma drift | — | — | Exposed as normal ops | High | `/admin/labs` + feature flag |
| Booking quotes (Provisions) | LIVE | Admin booking detail | `quote-actions`, outreach | `booking_inquiries` quote fields | Quote offer, deposit request | Dynamic deposit preferred; fixed Price ID still used in places | Immutable versioning incomplete | Med | Phase 5 harden; kill fixed Price ID requirement |
| Relational quotes queue | PARTIAL | `/admin/quotes` | Quotes table + send API | `quotes`, `bookings`, `booking_items` | Quote email | Indirect | Parallel to BookingInquiry | Med | Document or consolidate |
| Manual Quote Builder | PLACEHOLDER | `/admin/quotes/builder` | `quoteBuilder.ts` | **None** | None | None | “No database” preview | **High** | Hide until wired or delete from nav |
| Deposit Checkout | LIVE | Portal + admin Stripe routes | `pay-deposit`, `create-deposit-session` | Booking payment fields | Deposit received / booking confirmed | Live/Test Checkout + webhook | Metadata booking_id required | Med | Test-mode E2E before live |
| Main Stripe webhook | LIVE | `/api/stripe/webhook` | `route.ts` | `stripe_webhook_events`, `stripe_webhook_log`, bookings | Confirmations | `STRIPE_WEBHOOK_SECRET` | Prefer bornfidis.com only | Med | Keep; verify secret match |
| Academy webhook | LIVE | `/api/webhooks/academy` | Academy route | `academy_purchases` | Academy confirm | `STRIPE_ACADEMY_WEBHOOK_SECRET` | One-time only; no CRM admin beyond purchases | Low | Ops: confirm secret (already audited) |
| Legacy premium webhook | PLACEHOLDER | (removed) | — | — | — | Old vercel.app | Endpoint deleted in Stripe; code gone | Low | Keep deleted |
| Digital Studio CRM | LIVE (Phase 3) | `/admin/digital-studio` | Apply API + admin list | `digital_studio_applications` | Application emails | — | Status UX polish | Med | Monitor in ops |
| Unified Lead model | PLACEHOLDER | — | — | None (`BookingInquiry` ad hoc) | — | — | Spec fields not normalized | High | Design DATA_MODEL.md then migrate |
| Prep checklist / Action Queue | PARTIAL | Admin action needed | `admin-action-needed`, prep attention | Bookings / prep | — | After deposit | Not full Phase 7 checklist | Med | Expand after deposit webhook |
| Academy public commerce | PARTIAL | `/academy` | Checkout + library | `academy_products`, `academy_purchases` | Purchase confirm | One-time Prices | Not primary nav (good); types COURSE/DOWNLOAD/BUNDLE only | Med | Keep out of primary nav until ready |
| Sportswear | PLACEHOLDER | `/sportswear` | Coming soon | Notify stubs | — | Old premium price exists | Not primary nav (good) | Low | Keep hidden |
| Partners inquire | LIVE | `/partners` | Partners inquire API | (check route) | Admin notify | — | Secondary | Low | Keep |
| Auth admin RBAC | LIVE | `/admin/login` | `admin-rbac`, `ADMIN_EMAILS` | `admin_user_roles`, `users` | Magic link | — | Allowlist + platform roles | Med | Keep hardening |
| Diagnose DB API | BROKEN (security) | `/api/diagnose-db` | Unauthenticated GET | Uses service role | — | — | Secret exposure risk | **Critical** | Disable or lock immediately |
| Analytics privacy events | PLACEHOLDER | — | Academy trackers partial | — | — | — | No consent-gated suite | Med | Phase 10 after legal |
| SEO / a11y | PARTIAL | Public pages | Metadata mixed | — | — | — | DS noindex OK; privacy/terms gaps | Med | Phase 10 pass |
| Env / domain hygiene | PARTIAL | Vercel + `.env*` | `site-url.ts`, middleware | — | — | Webhooks | Trailing `\r` history; dual Vercel teams; docs platform.* | **High** | ENVIRONMENT_MATRIX.md + founder Vercel check |

---

## Legal & brand notes (Phase 2)

| Item | Current | Target |
|------|---------|--------|
| Entity | Bornfidis Sportswear LLC | Keep |
| Provisions DBA | In footer: “DBA Bornfidis Provisions” | Keep + “assumed name” wording per counsel |
| Digital Studio DBA | **Missing** from legal line | Add |
| Umbrella name | Weak on homepage / nav (“Provisions”) | “Bornfidis” umbrella + two divisions |
| Privacy / Terms | Off-app links | In-app pages; entity + DBA clarity |
| Unsupported claims | Avoid new registration claims | Track in `LEGAL_REVIEW_REQUIRED.md` (to create in Phase 2) |

---

## Forms & lead pipeline notes (Phase 3)

| Entry | Persist | Admin visible | Gaps |
|-------|---------|---------------|------|
| `/book` | `booking_inquiries` | Bookings | source/UTM unused |
| `/contact` (+ product / class) | `booking_inquiries` | Bookings | Validation mismatch; weak typing |
| Digital Studio apply | **Email only** | **No** | Must write DB + admin list |
| Journal newsletter | None | No | Placeholder |
| Lead magnet | `email_subscribers` | Indirect | OK for list |

**No unified `Lead` table.** Closest: BookingInquiry + email-only DS + EmailSubscriber.

Recommended statuses (target, not current):  
`new → reviewing → qualified → quoted → awaiting_deposit → confirmed → in_progress → completed → declined → archived`  
Current booking path uses pipeline statuses such as `new_inquiry` (see `lib/booking-pipeline-status.ts`).

---

## Admin IA (Phase 4) — gap vs target

Current: Phase 4 Culinary OS nav — groups COMMAND / SALES / DELIVERY / FINANCE / PEOPLE / SYSTEM; labs under `/admin/labs` when `ENABLE_ADMIN_LABS=true`.

Target groups: COMMAND / SALES / DELIVERY / FINANCE / PEOPLE / SYSTEM + **`/admin/labs`** behind feature flag.

Must move out of normal nav (non-exhaustive): investors, succession, experiments, board-deck, scenarios, forecast/ai, surge, margin, design-agent, academy (until ready), schedule placeholder — **done** (Labs list). Margin guardrails page restored under Labs.

---

## Quote & portal (Phase 5)

| Capability | Status |
|------------|--------|
| Link quote to booking | LIVE on BookingInquiry |
| Save line items / totals / deposit | LIVE on booking (`updateBookingQuote`) |
| Email quote / deposit request | LIVE — dynamic Stripe amount (matches portal) |
| Client accept/decline + lock | LIVE — portal accept/decline; locked after accept/pay |
| Portal deposit / balance | LIVE at `/portal/[token]` |
| Dynamic deposit (no fixed STRIPE_DEPOSIT_PRICE_ID) | LIVE — `createDepositCheckoutSessionForBooking` uses `price_data` |
| Manual builder persist | PLACEHOLDER (Labs preview only; clearly labeled) |

---

## Stripe (Phase 6) — HARDENED

| Item | Status |
|------|--------|
| `https://bornfidis.com/api/stripe/webhook` | LIVE destination |
| Academy `…/api/webhooks/academy` | LIVE destination (one-time fulfillment) — now writes to `stripe_webhook_log` + `stripe_webhook_events` |
| Legacy `…vercel.app/…/premium-webhook` | Removed from Stripe; keep gone |
| Idempotency | `stripe_webhook_events` (event id) — used by both main + academy webhooks |
| Audit log | `stripe_webhook_log` (matched/unmatched) — unified across all webhooks |
| Passive priceId | Allowlisted against env vars (no arbitrary Price IDs) |
| `/api/stripe/create-deposit-session` | DEPRECATED — delegates to canonical `createDepositCheckoutSessionForBooking` |
| `/api/stripe/create-balance-session` | Auth guard enforced (was no-op) |
| Portal deposit metadata | `checkout_mode: deposit` added for consistent dispatch |
| Full docs | `docs/STRIPE_FLOW.md` |

**Do not switch to new live keys until test-mode E2E passes** (per program plan). See `docs/STRIPE_FLOW.md` for go-live checklist.

---

## Security (Phase 9) — immediate flags

| Issue | Severity | Action |
|-------|----------|--------|
| `/api/diagnose-db` unauthenticated | Critical | Disable / protect before other work |
| Portal token in URL | Med | Keep random; add expiry/revoke UX |
| Service role server-only | Mostly OK | Audit all routes |
| NEXT_PUBLIC secrets | Monitor | Never put service role / webhook secrets in NEXT_PUBLIC |
| Docs still say platform.* Site URL | Med | Update to bornfidis.com |

---

## Recommended implementation order (locked)

Per program plan — **do not skip audit artifacts**:

1. Legal / domain consistency (+ `LEGAL_REVIEW_REQUIRED.md`)  
2. Public form reliability  
3. Admin lead pipelines (incl. Digital Studio)  
4. Quote Builder (wire or hide)  
5. Stripe test webhook E2E  
6. Client portal  
7. Preparation workflow  
8. Email automation  
9. Dashboard metric accuracy  
10. Security (diagnose-db first)  
11. Accessibility and SEO  
12. Production QA  

**Completion docs written:**  
- `docs/STRIPE_FLOW.md` (Phase 6)  
- `docs/EMAIL_FLOW.md` (Phase 7)  
- `docs/PREP_WORKFLOW.md` (Phase 7)  
- `docs/NOTIFICATION_SYSTEM.md` (Phase 7)  

**Still required:**  
`ENVIRONMENT_MATRIX.md`, `PRODUCTION_QA.md`, `DATA_MODEL.md`, migrations list, env changes, founder actions, test results, rollback plan.

---

## Preparation, Email & Notifications (Phase 7) — HARDENED

| Item | Status |
|------|--------|
| Email branding: division-aware sender identity | `fromAddress(division)` — provisions / digital-studio / admin / academy |
| Email legal footer | `emailLegalFooter()` on all guest-facing templates — copyright + assumed-name line |
| `BRAND_LEGAL` usage in templates | Hardcoded "Bornfidis Provisions" → `BRAND_LEGAL.provisionsDba` / `digitalStudioDba` |
| Link domains | All links use `siteOrigin()` → `https://bornfidis.com`; `platform.bornfidis.com` blocked |
| Email send logging | `lib/email-send-log.ts` — `logEmailSend()` writes `booking_activities` for booking emails |
| Email dedup | Cron: timestamp columns; webhook: `stripe_webhook_events`; admin: per-action |
| Failure safety | Email failure never reverses booking/payment — catch + log pattern verified |
| Prep workflow docs | `docs/PREP_WORKFLOW.md` — models, checklist gates, dashboard integration |
| Email flow docs | `docs/EMAIL_FLOW.md` — 20+ templates inventoried with trigger/sender/dedup |
| Notification docs | `docs/NOTIFICATION_SYSTEM.md` — channels, hardening rules, production config |
| Dashboard empty states | All 6 cards verified: "No actions right now" / "No upcoming bookings" |
| Cron reminders | 4 crons in `vercel.json` (prep, balance, inquiry, SLA) — all with dedup |
| Prep checklist | 7 inline boolean gates on BookingInquiry + BookingPrepItem line items |
| Action Queue | Live DB queries: deposit follow-up, upcoming prep, balance, post-event |

**Do not build a generic `ops_tasks` table** until either DS projects need tracking or the inline-boolean checklist becomes limiting.

---

## Workflow Unification & Delivery Operations (Phase 8) — IMPLEMENTED

| Item | Status |
|------|--------|
| BookingPrepItem as prep source of truth | Enhanced: `status`, `priority`, `assigned_to`, `due_at`, `task_type`, `updated_at`, `source`, `metadata` |
| Dashboard prep queries | Unified: prepItems rows first, boolean gate fallback |
| ChefPrepChecklist | Deprecated — never auto-created, duplicates BookingPrepItem |
| DigitalStudioProject model | NEW: full project delivery lifecycle |
| DigitalStudioProjectTask model | NEW: 18 default milestones, idempotent creation |
| Application → Project conversion | NEW: admin UI at `/admin/digital-studio` |
| EmailSendLog model | NEW: dedicated email send audit table |
| Email log admin UI | NEW: `/admin/email-log` with status/division/template filters |
| ActivityLog enhanced | NEW fields: `actor_id`, `actor_name`, `entity_type`, `entity_id`, `action`, `previous_value`, `new_value` |
| Action Queue extended | NEW cards: overdue prep, failed emails, DS applications, DS awaiting client |
| Dashboard data sources doc | NEW: `docs/DASHBOARD_DATA_SOURCES.md` |
| Legacy deprecation doc | NEW: `docs/LEGACY_FIELD_DEPRECATION.md` |
| DS project flow doc | NEW: `docs/DIGITAL_STUDIO_PROJECT_FLOW.md` |

**Schema changes require `npx prisma db push` or a migration** before production use.

---

## Explicit non-goals this sprint (until later phases)

- Separate Digital Studio app or backend  
- Recreating `platform.bornfidis.com`  
- Sportswear / Academy in primary public nav  
- Public Digital Studio pricing on pilot page  
- Subscription / book commerce redesign for Academy  
- Marking system production-ready without E2E QA pass  

---

## Founder actions (pre-code / parallel)

1. Confirm **only** Next (or only WP) owns marketing slugs on `bornfidis.com` — avoid double hosts.  
2. Confirm Vercel project that serves `bornfidis.com` (brian-ms-projects vs maylortech) for all env edits.  
3. Confirm Stripe Live webhooks: provisions + academy secrets match Production env (redeploy after edits).  
4. Attorney/founder review of assumed-name wording before lock.  

---

*End of audit. No application code was changed for this document.*
