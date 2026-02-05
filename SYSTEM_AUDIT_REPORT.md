# System Audit Report

**Date:** 2025-01-26  
**Scope:** Farmer Application Flow, Core Submission Pipelines, Database Integrity, TypeScript & Build, Admin Operations, Payments/Payouts (summary)

---

## 1. Farmer Application Flow

### Current behavior
- **Form:** `app/farm/apply/FarmerApplicationForm.tsx` → POST `/api/farm/apply`
- **API:** `app/api/farm/apply/route.ts` uses **Supabase only** (`supabaseAdmin.from('farmers').insert(...)`).
- **Validation:** `farmerApplicationSchema` in `lib/validation.ts` (name, email, phone, location, parish, country, regenerative_practices, certifications, crops, proteins, processing_capabilities, website_url, instagram_handle).
- **Target table:** Supabase `farmers` (from `migration-phase6a-farmer-network.sql`). Table has: name, email (UNIQUE NOT NULL), phone, location, parish, country, regenerative_practices, certifications[], crops[], proteins[], processing_capabilities[], status, approved_at, Stripe fields, website_url, instagram_handle, etc.

### Critical: Prisma vs database schema mismatch

| Aspect | Supabase `farmers` table | Prisma `Farmer` model |
|--------|---------------------------|------------------------|
| Identity | email UNIQUE NOT NULL, phone nullable | phone UNIQUE, **no email** |
| Extra in DB | location, country, regenerative_practices, certifications[], crops[], proteins[], processing_capabilities[], status, Stripe, website_url, instagram_handle | — |
| Extra in Prisma | — | **acres**, **language** (not in phase6a table) |
| Crops | `crops TEXT[]` on `farmers` | Separate `FarmerCrop` table / relation |

**Implications:**
- Web-app farmer submissions write correctly to Supabase `farmers` and work as designed.
- Any code using **Prisma** `db.farmer` (e.g. `findUnique({ where: { phone }})`) assumes phone is the key; web-app farmers may have phone optional and email required, so lookups can be wrong or missing.
- Prisma `Farmer` has `acres` and `language`; if the DB table was never extended, Prisma reads could be wrong or migrations may have added columns elsewhere.
- **FarmerCrop** in Prisma implies a `farmer_crops` table; Supabase stores crops as `farmers.crops` array. So either the DB has both (e.g. later migration) or Prisma is out of sync.

### Recommendation
- **Short term:** Document that farmer **submissions** and **admin farmer CRUD** use Supabase; **WhatsApp intake** and some **booking/payout** code use Prisma. Avoid mixing lookups (e.g. do not assume one farmer record is findable by both email and phone in Prisma).
- **Medium term:** Align Prisma with the real DB: either run introspection and fix schema, or add missing columns to Prisma `Farmer` (email, status, stripe fields, etc.) and drop/remap `FarmerCrop` if DB only has `farmers.crops[]`.

---

## 2. Core Submission Pipelines

| Pipeline | Route | Storage | Notes |
|----------|-------|---------|--------|
| **Booking** | POST `/api/submit-booking` | **Prisma** `db.bookingInquiry.create()` | Consistent with schema. |
| **Farmer apply** | POST `/api/farm/apply` | **Supabase** `from('farmers').insert()` | Works; Prisma model out of sync (see above). |
| **Chef apply** | POST `/api/chef/apply` | **Supabase** `from('chefs').insert()` | Duplicate check by email via Supabase. No Prisma `Chef` model. |
| **Cooperative join** | POST `/api/cooperative/join` | **Supabase** `from('cooperative_members').insert()` | No Prisma `CooperativeMember` model. |

**Conclusion:** Booking is Prisma-only; farmer/chef/cooperative submissions are Supabase-only. Split is intentional; risk is only where code assumes one source of truth (e.g. Prisma) for farmers/chefs.

---

## 3. Database Integrity

- **Prisma generate:** Succeeds.
- **Build:** Succeeds (`npm run build`). API routes that use `cookies()` show "Dynamic server usage" during static generation; they correctly run as dynamic (ƒ).
- **Two farmer-related tables:**
  - **farmers** (phase6a): main supplier table; web apply writes here.
  - **farmers_applications** (phase11g): Portland-style applications (simpler schema: name, phone, acres, crops text, status). Not used by the main farm apply form.
- **Chefs / cooperative_members:** Exist in Supabase; no Prisma models. All admin/submission code uses Supabase client for these.

---

## 4. TypeScript & Build State

- **Result:** Build completes successfully.
- **Note:** Next.js reports "Skipping validation of types" / "Skipping linting" in the build; consider enabling type checking in CI if not already.

---

## 5. Admin Operations (summary)

- **Farmer admin:** List/approve/reject/active/assign-farmer/send-onboarding use **Supabase** `from('farmers')`.
- **Submissions page:** Uses Supabase for farmers (and likely chefs/cooperative).
- **Bookings:** Use **Prisma** for `db.farmer.findUnique` / `findMany` (e.g. assign farmer dropdown).
- **Intakes/WhatsApp:** Use **Prisma** `db.farmer`, `db.farmerCrop`, `db.farmerIntake` (create/update farmer from intake).
- **Payouts:** Admin payouts use **Prisma** (`db.farmerPayout`, `db.farmer.findUnique`); payout engines (cooperative, ingredient, farmer) use **Supabase** `from('farmers')` for reading farmer data.

So admin mixes Supabase (farmer CRUD, engines) and Prisma (bookings, intakes, payouts). Coherent as long as the same `farmers` rows are readable by both; Prisma’s limited Farmer model means Prisma only sees a subset of columns.

---

## 6. Payments & Payouts (summary)

- **Stripe:** Webhook and portal routes exist; booking flow uses Prisma for booking state.
- **Farmer payouts:** Stored via Prisma `FarmerPayout`; payout engines read farmers from Supabase. No inconsistency if farmer IDs are the same and engines only need fields present in Supabase.

---

## Action Items (prioritized)

1. **Document** the dual use of Supabase vs Prisma for farmers (and that Chef/Cooperative are Supabase-only) in a single place (e.g. README or ARCHITECTURE.md).
2. **Sync Prisma `Farmer` with DB:** Either introspect and fix schema, or add missing columns and resolve `FarmerCrop` vs `farmers.crops[]`.
3. **Optional:** Add `export const dynamic = 'force-dynamic'` to admin API routes that use cookies, to avoid static generation attempts and reduce build-time auth errors in logs.
4. **Optional:** Enable TypeScript strict type-check and lint in production build for safer refactors.

---

*End of audit report.*
