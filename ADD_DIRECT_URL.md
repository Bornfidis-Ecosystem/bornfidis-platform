# Add DIRECT_URL to .env File

## The Problem

Prisma CLI reads from `.env` (not `.env.local`), and it needs `DIRECT_URL` for migrations.

**Error:** `Environment variable not found: DIRECT_URL`

## ✅ Quick Fix

### Step 1: Get Direct Connection String

1. Go to: https://supabase.com/dashboard
2. Select project: **bornfidis-platform**
3. Go to: **Settings** → **Database**
4. Scroll to **"Connection string"** section
5. Select **"Direct connection"** (NOT "Connection pooling")
6. Copy the connection string

**Format:**
```
postgresql://postgres:[PASSWORD]@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require
```

### Step 2: Add to .env File

1. Open `.env` file in your project root
2. Add this line (or update if it exists):

```env
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require"
```

**Important:**
- Replace `YOUR_PASSWORD` with your actual database password
- Replace `YOUR_PROJECT_REF` with your actual project reference (from bornfidis-platform)
- Make sure it's the **Direct connection** (port 5432), not pooler
- Use the **same password** as your `DATABASE_URL`

### Step 3: Verify .env File Has Both

Your `.env` file should have:

```env
# Runtime (Transaction Pooler - port 6543)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

# Migrations (Direct Connection - port 5432)
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require"
```

### Step 4: Run Migration Again

```powershell
npx prisma migrate dev --name init_bornfidis_platform
```

---

## Why Two Files?

- **`.env.local`**: Used by Next.js at runtime (your app)
- **`.env`**: Used by Prisma CLI (migrations)

Both should have the same values, but Prisma CLI specifically reads from `.env`.

---

## Quick Copy-Paste Template

Replace the placeholders and add to `.env`:

```env
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require"
```
