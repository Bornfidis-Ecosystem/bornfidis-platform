# Step-by-Step: Apply Phase 11G.2 Migration

## 🚨 Current Issues

1. **Database Connection:** Prisma trying to connect to `localhost:51260` instead of Supabase
2. **Permission Error:** Prisma client files are locked

## ✅ Solution Steps

### Step 1: Fix Database Connection

**Problem:** Prisma CLI reads `.env` (not `.env.local`), and your connection string uses the pooler.

**Fix:**

1. **Get your DIRECT connection string:**
   - Go to: [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to: **Settings** → **Database**
   - Scroll to **Connection string**
   - Select **"Direct connection"** (NOT "Connection pooling")
   - Copy the string (should look like):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.axqmavsjdrvhsdjetznb.supabase.co:5432/postgres?sslmode=require
     ```

2. **Update `.env.local`:**
   - Open `.env.local` in your editor
   - Replace the `DATABASE_URL` line with the DIRECT connection string
   - Make sure it uses port **5432** (not 6543)
   - Make sure it has `?sslmode=require` at the end

3. **Create/update `.env` file** (for Prisma CLI):
   - Create a file named `.env` in the project root
   - Add this line (use your DIRECT connection string):
     ```env
     DATABASE_URL="postgresql://postgres:Bornfidis2026@db.axqmavsjdrvhsdjetznb.supabase.co:5432/postgres?sslmode=require"
     ```
   - **Note:** Use the DIRECT connection (port 5432), not the pooler

### Step 2: Fix Permission Error

**Problem:** Prisma client files are locked by another process.

**Fix:**

1. **Stop your Next.js dev server:**
   ```powershell
   # If you have a terminal running `npm run dev`, press Ctrl+C
   ```

2. **Close Cursor/VS Code** (or at least close any Prisma-related files)

3. **Delete the locked Prisma client:**
   ```powershell
   Remove-Item -Recurse -Force node_modules\.prisma\client
   ```

4. **If that fails**, close all terminals and editors, then try again

### Step 3: Apply Migration

**Option A: Use Prisma Migrate (Recommended)**

```powershell
# Make sure .env file exists with DIRECT connection (from Step 1)
# Make sure dev server is stopped (from Step 2)

# Apply the migration
npx prisma migrate dev --name phase11g2_schema_updates

# Generate Prisma client
npx prisma generate
```

**Option B: Manual SQL Application (If Prisma still fails)**

1. **Open Supabase SQL Editor:**
   - Go to Supabase Dashboard → SQL Editor

2. **Copy migration SQL:**
   - Open: `prisma/migrations/20250122234200_phase11g2_schema_updates/migration.sql`
   - Copy all contents (Ctrl+A, Ctrl+C)

3. **Paste and run in Supabase SQL Editor:**
   - Paste the SQL
   - Click "Run" or press Ctrl+Enter

4. **Mark migration as applied:**
   ```powershell
   npx prisma migrate resolve --applied 20250122234200_phase11g2_schema_updates
   ```

5. **Generate Prisma client:**
   ```powershell
   npx prisma generate
   ```

### Step 4: Verify

```powershell
# Check migration status
npx prisma migrate status

# Should show: "Database schema is up to date!"
```

## 🎯 Quick Script (Alternative)

I've created a PowerShell script to automate some of this:

```powershell
# Run the helper script
.\fix-prisma-connection.ps1
```

This script will:
- ✅ Copy DATABASE_URL from `.env.local` to `.env`
- ✅ Warn if you're using pooler (needs direct connection)
- ✅ Try to remove locked Prisma client files
- ✅ Generate Prisma client
- ✅ Test database connection

## 📋 Checklist

Before running migration, ensure:

- [ ] `.env.local` has DIRECT connection (port 5432, not 6543)
- [ ] `.env` file exists with same DIRECT connection
- [ ] Next.js dev server is stopped
- [ ] No IDE/editor has Prisma files locked
- [ ] `node_modules\.prisma\client` is deleted (if EPERM error occurred)

## 🔍 Troubleshooting

### Still getting "localhost:51260" error?

1. Check `.env` file exists and has correct DATABASE_URL
2. Verify it's the DIRECT connection (not pooler)
3. Make sure `.env` is in project root (same folder as `package.json`)
4. Try: `npx prisma migrate dev --env-file .env`

### Still getting EPERM error?

1. Close ALL terminals
2. Close Cursor/VS Code completely
3. Open new terminal
4. Run: `Remove-Item -Recurse -Force node_modules\.prisma\client`
5. Run: `npx prisma generate`

### Migration fails with SQL errors?

- The migration SQL is in: `prisma/migrations/20250122234200_phase11g2_schema_updates/migration.sql`
- You can apply it manually via Supabase SQL Editor
- Then mark as applied: `npx prisma migrate resolve --applied 20250122234200_phase11g2_schema_updates`

## ✅ Success Indicators

After successful migration:

- ✅ `npx prisma migrate status` shows "Database schema is up to date!"
- ✅ `npx prisma generate` completes without errors
- ✅ No "localhost" connection errors
- ✅ No EPERM errors
