# Admin platform RBAC rollout

## What shipped

- Prisma enum `AppRole` and table `admin_user_roles` (`AdminUserRole`), migration `20260411120000_admin_user_roles`.
- Resolution order for platform role: **active row in `admin_user_roles`** (email lowercased) → **`ADMIN_EMAILS` env** (treated as `founder_admin`) → **Prisma `User.role` in admin-area roles** (`ADMIN`, `STAFF`, `COORDINATOR`) as `founder_admin` for rollout safety → else no platform role.
- Helpers: `lib/admin-rbac.ts`, re-exports in `lib/authz.ts` (platform role aliases include `getCurrentUserRole` / `getCurrentUserRoleWithFallback`).
- `requireManagerOrFounderPageAccess()` on manager routes (bookings list, clients, calendar, testimonials, provisions pipeline); staff users are redirected to `/admin?notice=operational-only`.
- Founder-only: manual mark-paid server actions, founder-only payment UI on booking detail, founder-only strips on `/admin`, and selected API routes (`requireFounderAdminApi`).

## Production (Vercel)

1. Deploy migration: ensure `prisma migrate deploy` runs in your release pipeline (or run against production DB once).
2. Seed role rows (idempotent upsert):  
   `npx tsx scripts/seed-admin-user-roles.ts`  
   or `npm run db:seed-admin-roles`  
   Uses `DIRECT_URL` or `DATABASE_URL` from the environment.
3. Keep **`ADMIN_EMAILS`** set during rollout so any email not yet in `admin_user_roles` still maps to **founder_admin** when listed.
4. `tech@bornfidis.com` and `brian@bornfidis.com` must remain **founder_admin** in the table or on `ADMIN_EMAILS`; do not remove allowlist until every operator has a row.

## Optional next steps

- Tighten legacy fallback: once all ops emails have rows, trim `ADMIN_EMAILS` to break-glass accounts only.
- Add a founder-only UI for managing `admin_user_roles` (not in initial scope).
