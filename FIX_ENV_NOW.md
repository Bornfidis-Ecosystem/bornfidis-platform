# 🚨 IMMEDIATE FIX - Update .env File

## Problem Found

Your `.env` file has a **Prisma Accelerate connection string** pointing to `localhost:51260`. This is overriding your `.env.local` file!

**Current `.env` has:**
```
DATABASE_URL="prisma+postgres://localhost:51259/..."
```

**This needs to be:**
```
DATABASE_URL="postgresql://postgres:Bornfidis2026@db.axqmavsjdrvhsdjetznb.supabase.co:5432/postgres?sslmode=require"
```

## ✅ Quick Fix (2 Steps)

### Step 1: Update `.env` File

1. **Open `.env` file** in your project root
2. **Replace the entire `DATABASE_URL` line** with:

```env
DATABASE_URL="postgresql://postgres:Bornfidis2026@db.axqmavsjdrvhsdjetznb.supabase.co:5432/postgres?sslmode=require"
```

**Important:** 
- Use **DIRECT connection** (port 5432, not pooler port 6543)
- Get the exact string from: Supabase Dashboard → Settings → Database → **Direct connection**

### Step 2: Fix Permission Error

```powershell
# Stop dev server first (Ctrl+C if running)

# Delete locked Prisma client
Remove-Item -Recurse -Force node_modules\.prisma\client

# Generate Prisma client
npx prisma generate
```

### Step 3: Apply Migration

```powershell
npx prisma migrate dev --name phase11g2_schema_updates
```

## 🎯 Complete Command Sequence

```powershell
# 1. Make sure .env has correct DATABASE_URL (see Step 1 above)

# 2. Stop dev server (Ctrl+C)

# 3. Fix permissions
Remove-Item -Recurse -Force node_modules\.prisma\client

# 4. Generate client
npx prisma generate

# 5. Apply migration
npx prisma migrate dev --name phase11g2_schema_updates
```

## ✅ Verification

After fixing, you should see:
- ✅ No "localhost:51260" errors
- ✅ Connection to Supabase succeeds
- ✅ Migration applies successfully
- ✅ Prisma client generates without EPERM errors
