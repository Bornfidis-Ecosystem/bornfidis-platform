# Phase 1.1 — Operations Coordinator permissions

**Goal:** Hospitality operations and event execution without financial visibility (prepared for Caryll @ `caryll@bornfidis.com`).

## Platform role: `operations_coordinator`

Stored in `admin_user_roles` (`AppRole.operations_coordinator`). Works with Prisma `User.role` = **`COORDINATOR`** (recommended) for sidebar nav.

### Can access

- Dashboard — **Event Operations** view (pipeline counts, upcoming events, prep attention; no revenue/divisions/quote builder)
- Bookings list and booking detail — timeline, prep, farmer assignment, SLA, client notes, admin notes
- Calendar, Schedule, Clients, Provisions pipeline, Farmers, Chefs (not performance/earnings), Partners, Education, Coaching, Testimonials, Incidents

### Cannot access

- Revenue KPIs, payment health, revenue trends (founder-only blocks)
- Deposits / balances / Stripe IDs / payout sections on booking detail
- Quote builder, payouts, costs, forecast, ops hub, currency, margin, investors, board deck, and other paths in `FINANCIAL_ADMIN_PATH_PREFIXES` (`lib/ops-coordinator-access.ts`)

### Other platform roles (unchanged)

| Role | Financials | Hospitality ops pages |
|------|------------|------------------------|
| `founder_admin` | Full | Full |
| `manager` | Full | Full |
| `operations_coordinator` | Hidden | Full |
| `staff` | Hidden | Dashboard only |

## Onboarding Caryll

1. Run migration: `20260603120000_app_role_operations_coordinator`
2. `npx tsx scripts/seed-admin-user-roles.ts` (sets `caryll@bornfidis.com` → `operations_coordinator`)
3. Set Prisma `users.role` = `COORDINATOR` after first login (or before via User Management)
4. Ensure she is **not** on `ADMIN_EMAILS`
5. Magic link: `/admin/login` with `caryll@bornfidis.com`

## Code entry points

- `lib/admin-rbac.ts` — role resolution and page guards
- `lib/ops-coordinator-access.ts` — financial path list and helpers
- `lib/filter-nav.ts` — `getNavForPlatformUser()`
- `app/admin/layout.tsx` — nav filter + `guardFinancialPath()`
- `app/admin/bookings/[id]/page.tsx` — hides payment / payout UI
