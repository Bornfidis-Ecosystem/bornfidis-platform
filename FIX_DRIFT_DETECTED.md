# Fix: "Drift detected" Error

## The Problem

Prisma detected that your database already has tables (Supabase's `auth` schema) but no migration history. This is normal for a fresh Supabase project.

## ✅ Solution: Create Baseline Migration

Since this is a **fresh bornfidis-platform project**, we'll create a baseline migration that acknowledges the existing `auth` schema.

### Option 1: Baseline Migration (Recommended)

This creates a migration that acknowledges existing tables without modifying them:

```powershell
npx prisma migrate dev --name init_bornfidis_platform --create-only
```

This will:
- Create a migration file without applying it
- You can then review and edit it if needed
- Then apply it with: `npx prisma migrate dev`

### Option 2: Use db push (Faster, for development)

This syncs your schema directly without migration history:

```powershell
npx prisma db push
```

**Note:** `db push` doesn't create migration files, but it's perfect for initial setup.

### Option 3: Mark auth schema as applied

If you only want to create your custom tables and ignore the auth schema:

```powershell
# First, create a baseline migration
npx prisma migrate dev --name baseline --create-only

# Then mark auth schema tables as already applied
npx prisma migrate resolve --applied baseline
```

---

## Recommended: Use db push for now

Since this is a fresh project and you want to get started quickly:

```powershell
npx prisma db push
```

This will:
- ✅ Sync your Prisma schema to the database
- ✅ Create all your custom tables (users, submissions, phases, etc.)
- ✅ Leave the `auth` schema untouched
- ✅ Get you up and running fast

**After `db push` succeeds:**
- Check Supabase → Table Editor
- You should see your tables created
- Then test: `http://localhost:3000/api/test-connection`

---

## Why This Happens

Supabase automatically creates the `auth` schema with tables for authentication. When Prisma tries to create migrations, it sees these existing tables and detects "drift" because there's no migration history for them.

This is **normal and expected** for Supabase projects.
