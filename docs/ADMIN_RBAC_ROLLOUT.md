# Admin platform RBAC rollout

## What shipped

- Prisma enum `AppRole` and table `admin_user_roles` (`AdminUserRole`), migrations `20260411120000_admin_user_roles` and `20260603120000_app_role_operations_coordinator`.
- Roles: `founder_admin`, `manager`, `operations_coordinator`, `staff`.
- Resolution order: **active `admin_user_roles` row** → **`ADMIN_EMAILS`** → Prisma default (`ADMIN`→founder, `COORDINATOR`→operations_coordinator, `STAFF`→manager).
- `requireHospitalityOpsPageAccess()` on bookings, calendar, clients, etc.; `staff` → `/admin?notice=operational-only`.
- `guardFinancialPath()` in admin layout blocks financial URLs for `operations_coordinator`.
- See **`docs/PHASE1_1_OPS_COORDINATOR.md`** for Caryll onboarding.

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
