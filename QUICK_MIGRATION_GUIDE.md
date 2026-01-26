# Quick Migration Guide - Phase 11G.2

## 🚀 Quick Fix for Your Current Issues

### Issue 1: Database Connection (localhost:51260 error)

**Problem:** Your `.env.local` uses the connection pooler, but Prisma migrations need direct connection.

**Quick Fix:**

1. **Get your direct connection string:**
   - Go to: [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Settings → Database
   - Copy the **"Direct connection"** string (NOT "Connection pooling")
   - Should look like: `postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require`

2. **Update `.env.local`:**
   ```env
   DATABASE_URL="postgresql://postgres:Bornfidis2026@db.axqmavsjdrvhsdjetznb.supabase.co:5432/postgres?sslmode=require"
   ```

3. **Run migration:**
   ```powershell
   npx prisma migrate dev --name phase11g2_schema_updates
   ```

4. **After migration succeeds, you can switch back to pooler** (optional):
   ```env
   DATABASE_URL="postgresql://postgres.axqmavsjdrvhsdjetznb:Bornfidis2026@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

### Issue 2: Permission Error (EPERM)

**Problem:** `EPERM: operation not permitted, rename query_engine-windows.dll.node`

**Quick Fix:**

1. **Stop your dev server** (if running):
   - Press `Ctrl+C` in the terminal running `npm run dev`

2. **Close Cursor/VS Code** (or at least close the file explorer)

3. **Generate Prisma client:**
   ```powershell
   npx prisma generate
   ```

4. **If still failing, force regenerate:**
   ```powershell
   Remove-Item -Recurse -Force node_modules\.prisma\client
   npx prisma generate
   ```

## ✅ Complete Workflow

```powershell
# 1. Update .env.local with direct connection (see above)

# 2. Apply migration
npx prisma migrate dev --name phase11g2_schema_updates

# 3. Generate Prisma client
npx prisma generate

# 4. Verify
npx prisma migrate status
```

## 🔄 Alternative: Manual SQL Application

If Prisma migration continues to fail:

1. **Open Supabase SQL Editor:**
   - Go to Supabase Dashboard → SQL Editor

2. **Copy migration SQL:**
   - Open: `prisma/migrations/20250122234200_phase11g2_schema_updates/migration.sql`
   - Copy all contents

3. **Paste and run in Supabase SQL Editor**

4. **Mark migration as applied:**
   ```powershell
   npx prisma migrate resolve --applied 20250122234200_phase11g2_schema_updates
   ```

5. **Generate client:**
   ```powershell
   npx prisma generate
   ```

## 📋 What Gets Created

- ✅ `farmers` table (with unique phone constraint)
- ✅ `farmer_crops` table (with compound unique constraint)
- ✅ `FarmerIntakeStatus` enum
- ✅ Updated `farmer_intakes` table (with `parsed_json` and enum status)

## 🎯 Success Indicators

After successful migration, you should see:
- ✅ Migration applied message
- ✅ Prisma client generated successfully
- ✅ `npx prisma migrate status` shows migration as applied

## 📚 More Help

- Detailed troubleshooting: `prisma/migrations/20250122234200_phase11g2_schema_updates/TROUBLESHOOTING.md`
- Full summary: `PHASE11G2_PRISMA_SCHEMA_SUMMARY.md`
