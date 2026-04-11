# Prisma migration history analysis — P1014 shadow DB

## 1. Safest immediate path: use `prisma db push`

**Yes. Using `prisma db push` is the safest immediate path.**

- **`prisma migrate dev`** uses a **shadow database**: Prisma creates a temporary DB, replays **all** migrations in order, then compares the result to your schema. It never talks to your real Supabase DB for that replay. Your real DB has `farmers` (created outside the current migration set); the shadow DB does not → P1014.
- **`prisma db push`** does **not** use migrations or a shadow DB. It diffs your **current schema** against the **real database** (DATABASE_URL) and applies the diff. So:
  - It does not replay migration history.
  - It will not try to create `farmers` (it already exists).
  - It will add any missing columns/tables that exist in the schema but not in the DB, and leave existing tables (e.g. `farmers`) as-is unless you changed the schema.

**Recommendation:** Use `npx prisma db push` for day-to-day schema changes until you have fixed migration history. Avoid `migrate dev` for new changes until the baseline strategy below is done.

**Caveat:** `db push` does not create migration SQL files and is not suitable for production rollout via migrations. It is the right tool to keep the real DB in sync with the schema when migration history is broken.

---

## 2. Farmer model and table mapping

In `prisma/schema.prisma`:

- **Model name:** `Farmer` (PascalCase).
- **Table name:** `@@map("farmers")` → physical table is **`farmers`** in schema **`public`** (`@@schema("public")` is default).
- **Key fields:** `id` (UUID, default `uuid_generate_v4()`), `created_at`, `updated_at`, `name`, `phone`, etc.

The schema is consistent: the `Farmer` model is correctly mapped to the `farmers` table. The P1014 error is not due to a wrong `@@map` or schema; it is due to the **migration history** never creating `farmers` in the shadow DB.

---

## 3. Why the shadow DB fails — migration `20260218100000_phase1_ecosystem_tables`

**What this migration does:**

- Creates: `academy_products`, `academy_enrollments`, `provisions_products`, `sportswear_products`, `sportswear_orders`, `sportswear_order_lines`, `farm_listings`.
- Adds a foreign key:  
  `ALTER TABLE "farm_listings" ADD CONSTRAINT "farm_listings_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ...`

**What it does *not* do:**

- It does **not** create the table **`farmers`**.

So the migration **assumes** that `farmers` already exists. In your real Supabase DB it does (created manually or by a migration that is not in this repo). In the **shadow database**:

1. Prisma creates an empty shadow DB.
2. It applies, in order: `20250126_add_educator_role`, `20250126_academy_purchases`, `20250126_academy_product_snapshot`, `20260218100000_phase1_ecosystem_tables`.
3. None of these migrations create `farmers`.
4. When `20260218100000_phase1_ecosystem_tables` runs, it either:
   - Fails at the `ALTER TABLE ... REFERENCES "farmers"("id")` because `farmers` does not exist, or
   - Prisma later validates the shadow DB state against the schema and fails with P1014 because the model `Farmer` (table `farmers`) is missing.

**Conclusion:** The failure is caused by **incomplete migration history**: the table `farmers` is required by the schema and by the phase1 migration FK, but no migration in `prisma/migrations` creates it. The shadow DB is a clean replay of only those migrations, so it never has `farmers`.

---

## 4. No schema changes

No schema or migration file changes were made in this analysis. The Farmer model and `@@map("farmers")` are correct; the fix is to fix migration history or use `db push`, not to change the schema.

---

## 5. Future baseline strategy to restore clean migration history

Goal: get to a state where `prisma migrate dev` (and thus the shadow DB) works and new changes use migrations again.

**Option A — Baseline from current DB (recommended if you can afford a clean migration folder)**

1. **Back up the real database** (Supabase backup / pg_dump).
2. **Document current state:** run `npx prisma db pull` (or keep current schema) so the schema matches the real DB.
3. **Create a single “baseline” migration** that creates every table the schema expects, in dependency order (e.g. `farmers` before `farm_listings`). Either:
   - Export the current DB structure (e.g. `pg_dump --schema-only`) and turn it into one migration SQL file, or
   - Manually write a migration that creates all tables (including `farmers`) to match the schema.
4. **Rename or move** the existing `prisma/migrations` folder (e.g. `migrations_old`) so Prisma no longer sees the incomplete history.
5. **Initialize new history:** run `npx prisma migrate dev --name baseline` so Prisma creates a new migration from the current schema. If that would try to create tables that already exist, instead:
   - Put the SQL from step 3 into a new folder `prisma/migrations/YYYYMMDDHHMMSS_baseline/migration.sql`,
   - Run `npx prisma migrate resolve --applied YYYYMMDDHHMMSS_baseline` against the **real** DB to mark the baseline as applied without running it (because the DB already has those tables).
6. From then on, use `migrate dev` for new changes; the shadow DB will replay the baseline and see `farmers` (and everything else) and no longer hit P1014.

**Option B — Keep existing migrations and add the missing “farmers” migration**

1. Find the **earliest** migration that references `farmers` (e.g. `20260218100000_phase1_ecosystem_tables`).
2. Add a **new** migration **before** that one (e.g. `20250101000000_create_farmers/migration.sql`) that creates the `farmers` table (and any other tables that are in the schema but never created in migrations), with the same structure as the current DB.
3. Run `prisma migrate dev` again. The shadow DB will apply the new migration first, then the phase1 migration; the FK to `farmers` will succeed.

**Option C — Stay on `db push` and defer migration cleanup**

- Continue using `npx prisma db push` for schema changes.
- Document in the repo that migration history is incomplete and that production changes are applied via `db push` or manually until a baseline (Option A or B) is done.
- Plan a one-off project to do Option A or B when you need proper migration-based deploys again.

**Recommendation:** Option A gives the cleanest long-term state (one baseline, then normal migrations). Option B is minimal change but leaves the existing, partially inconsistent migration set in place. Option C is fine short-term and matches your current “do not modify schema / fix history later” approach.
