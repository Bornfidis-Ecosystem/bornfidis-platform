# Bornfidis Platform — Auth + Roles Lock (Phase 1)

Secure, simple, role-based access. Single source of truth: **Prisma `User.role`**.

## Roles (Bornfidis-aligned)

| Role        | Meaning                          | Access                    |
|------------|-----------------------------------|---------------------------|
| **ADMIN**  | You / core leadership             | Full access               |
| **STAFF**  | Operations, coordinators          | Admin area, bookings, etc. |
| **PARTNER**| Farmers, chefs, cooperatives      | Restricted tools (future) |
| **USER**   | General authenticated             | View / limited actions    |

Legacy roles (still supported): **COORDINATOR** (treated as STAFF), **CHEF**, **FARMER**, **VOLUNTEER**.

## What’s Implemented

- **Prisma**: `UserRole` enum includes `ADMIN`, `STAFF`, `PARTNER`, `USER` (+ legacy). `User.role` default `USER`.
- **Middleware**: `/admin/*` (except `/admin/login`) requires a session; unauthenticated → redirect to `/admin/login`. `/` and `/admin/login` always allowed.
- **Admin area**: Allowed roles = **ADMIN**, **STAFF**, **COORDINATOR**. Enforced in `checkAdminAccess()` and admin layout.
- **`lib/require-role.ts`**: `requireRole(userRole, allowedRoles)` and `hasRole(userRole, allowedRoles)` for server-side checks. Constants: `ADMIN_AREA_ROLES`, `STAFF_AREA_ROLES`, `PARTNER_AREA_ROLES`.
- **API routes**: `requireAdmin(request)` uses Prisma role (ADMIN/STAFF/COORDINATOR) plus optional `ADMIN_EMAILS` allowlist fallback.
- **UI**: Admin layout shows a thin bar with **role badge** (ADMIN / STAFF / COORDINATOR) and email; User Management includes all roles.

## Phase 2A — Role-Aware Navigation

- **`lib/nav-config.ts`**: Single source of truth — `NAV_ITEMS` with label, href, roles. Dashboard, Bookings, Farmers, Chefs, Partners, Payouts, Settings.
- **`lib/filter-nav.ts`**: `getNavForRole(role)` returns only items the role can see.
- **`components/AppNav.tsx`**: Renders filtered nav links; used in admin layout.
- **Admin layout**: Passes `result.role` from server to `<AppNav role={result.role} />` in a row below the header bar. Security unchanged — layouts/API still enforce access.

**Who sees what (admin area):**

| Role        | Nav items                                                                 |
|------------|----------------------------------------------------------------------------|
| ADMIN      | Dashboard, Bookings, Farmers, Chefs, Partners, Payouts, **Settings**       |
| STAFF / COORDINATOR | Dashboard, Bookings, Farmers, Chefs, Partners, Payouts (no Settings) |
| PARTNER / USER | Do not reach admin layout (access denied) — nav not shown              |

## Phase 2B — Partner Invites (Invite-Only Onboarding)

- **Data**: Prisma `Invite` model — `email` (unique), `role`, `token` (unique), `invitedBy`, `accepted`, `expiresAt` (7 days). Table: `invites`.
- **API**: `POST /api/admin/invites` — create invite, send email (admin only). Body: `{ email, role }` (role PARTNER for now). `GET /api/admin/invites?status=pending|accepted|expired|all` — list. `DELETE /api/admin/invites/[id]` — revoke. `POST /api/admin/invites/[id]/resend` — new token + resend email.
- **Accept flow**: `GET /invite?token=XYZ` — validate token, upsert User by email with role, set invite accepted, redirect `/admin/login`. No token or invalid/expired/accepted → show message + link to login.
- **Email**: `sendInviteEmail(to, role, inviteUrl)` in `lib/email.ts`. Subject: "You've been invited to the Bornfidis Platform". Link: `{NEXT_PUBLIC_SITE_URL}/invite?token=...`
- **Admin UI**: `/admin/invites` — form (email, role PARTNER), Invite button; table Pending/Accepted/Expired with Resend and Revoke. Nav: "Invites" (ADMIN, STAFF, COORDINATOR).

**One-time DB**: If not using Prisma migrate, run `supabase/add-invites-table-phase2b.sql` to create `invites` table.

## Phase 2C — Partner Profile Setup Wizard

- **Data**: Prisma `PartnerProfile` (userId, displayName, partnerType, parish, phone, bio, completed) and `PartnerType` enum (FARMER, CHEF, COOPERATIVE, OTHER). Table: `partner_profiles`.
- **Gate**: In `app/partner/layout.tsx` — if role !== PARTNER redirect to /admin; if PARTNER and (!profile \|\| !profile.completed) and path is not /partner/setup, redirect to /partner/setup.
- **Middleware**: /partner/* requires auth (redirect to /admin/login if not logged in).
- **Routes**: `/partner/setup` — wizard (Identity, Contact & Location, About); `/partner` — landing after setup. Server action `savePartnerProfile` in `app/partner/setup/actions.ts`; helpers in `lib/partner.ts` (`getCurrentPrismaUser`, `getPartnerProfileForCurrentUser`).
- **One-time DB**: If not using Prisma migrate, run `supabase/add-partner-profile-phase2c.sql`.

## One-Time Setup

### 1. Database: Add new enum values (if needed)

If your DB already has `UserRole` without `STAFF`, `PARTNER`, `USER`, add them:

```sql
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'STAFF';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PARTNER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'USER';
```

(PostgreSQL 9.1+; adjust if your enum is in a different schema.)

### 2. Seed your first admin

**Option A — Prisma seed (creates Supabase Auth user + Prisma User with ADMIN):**

```bash
npx prisma db seed
```

Then sign in at `/admin/login` with the seeded email (see seed output for password).

**Option B — Set existing user to ADMIN (Prisma User already exists):**

```bash
npx tsx scripts/set-admin-role.ts you@bornfidis.com
```

Sign out and sign back in so the role is picked up.

### 3. Never hardcode admin again

Use the User Management page (`/admin/users`) or `set-admin-role.ts` to assign ADMIN/STAFF. Role is stored only in Prisma `users.role`.

## Route Rules (Phase 1)

| Route         | Allowed                          |
|---------------|-----------------------------------|
| `/`           | Everyone                          |
| `/admin/login`| Everyone                          |
| `/admin/*`    | Authenticated + ADMIN/STAFF/COORDINATOR |
| `/staff/*`    | (Future) ADMIN, STAFF            |
| `/partner/*`  | (Future) ADMIN, STAFF, PARTNER   |

## Files Touched

- `prisma/schema.prisma` — UserRole enum + User default
- `lib/require-role.ts` — **new** — requireRole, hasRole, role constants
- `lib/requireAdmin.ts` — uses getCurrentUserRole() + ADMIN_AREA_ROLES
- `lib/authz.ts` — canAccessAdminArea, STAFF in canManageBookings etc.
- `middleware.ts` — lock /admin/* (except login) when not authenticated
- `app/admin/layout.tsx` — AdminHeaderBar with role badge
- `components/admin/AdminHeaderBar.tsx` — **new** — role badge + email + Sign out
- `lib/get-user-role.ts` — default new users to USER
- `app/admin/users/UserManagementClient.tsx` — STAFF, PARTNER, USER in list and dropdown

## Optional: Enforce role in API

```ts
import { getCurrentUserRole } from '@/lib/get-user-role'
import { requireRole, ADMIN_AREA_ROLES } from '@/lib/require-role'

const role = await getCurrentUserRole()
requireRole(role, ADMIN_AREA_ROLES) // throws if not allowed
```

This is already done for admin routes via `requireAdmin()` / `checkAdminAccess()`.
