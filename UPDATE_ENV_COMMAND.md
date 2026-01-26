# 🚨 URGENT: Update .env File - Copy This Command

## The Problem

Your `.env` file has:
```
DATABASE_URL="prisma+postgres://localhost:51259/..."
```

This is a **Prisma Accelerate** connection pointing to localhost. You need to replace it with your **Supabase direct connection**.

## ✅ Quick Fix - Run This Command

**Option 1: Manual Edit (Recommended)**

1. Open `.env` file in your editor
2. Find the line: `DATABASE_URL="prisma+postgres://localhost:51259/..."`
3. Replace the entire line with (get your exact string from Supabase Dashboard):

```env
DATABASE_URL="postgresql://postgres:Bornfidis2026@db.axqmavsjdrvhsdjetznb.supabase.co:5432/postgres?sslmode=require"
```

**To get your exact connection string:**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to: **Settings** → **Database**
4. Scroll to **Connection string**
5. Select **"Direct connection"** (NOT "Connection pooling")
6. Copy the string
7. Make sure it has `?sslmode=require` at the end

**Option 2: PowerShell Command (If you know your password)**

Run this in PowerShell (replace `YOUR_PASSWORD` with your actual password):

```powershell
$newUrl = 'postgresql://postgres:YOUR_PASSWORD@db.axqmavsjdrvhsdjetznb.supabase.co:5432/postgres?sslmode=require'
$content = Get-Content .env -Raw
$content = $content -replace 'DATABASE_URL\s*=.*', "DATABASE_URL=`"$newUrl`""
Set-Content .env $content -NoNewline
Write-Host "✅ Updated .env file" -ForegroundColor Green
```

**Option 3: Use the Helper Script**

```powershell
.\update-env-for-migration.ps1
```

## ✅ After Updating .env

Run these commands:

```powershell
# 1. Fix permission error
Remove-Item -Recurse -Force node_modules\.prisma\client

# 2. Generate Prisma client
npx prisma generate

# 3. Apply migration
npx prisma migrate dev --name phase11g2_schema_updates
```

## 🔍 Verify It Worked

After updating `.env`, run:
```powershell
npx prisma migrate status
```

You should see connection to Supabase (not localhost) and migration status.

## ⚠️ Important Notes

1. **Use DIRECT connection** (port 5432), NOT pooler (port 6543)
2. **Must have `?sslmode=require`** at the end
3. **Format:** `postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require`
4. **NOT:** `prisma+postgres://` or `pooler.supabase.com` or port `6543`
