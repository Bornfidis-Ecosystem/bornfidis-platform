# 🔧 Fix: "FATAL: Tenant or user not found" Error

## The Problem

Prisma can't connect to your database because the `DATABASE_URL` connection string is incorrect.

**Error:** `FATAL: Tenant or user not found`

## ✅ Quick Fix (5 minutes)

### Step 1: Get Correct Connection String

1. Go to: https://supabase.com/dashboard
2. Select your project: **island-harvest-hub**
3. Go to: **Settings** → **Database**
4. Scroll to **"Connection string"** section
5. Click **"Connection pooling"** tab (or "Pooler settings" button)
6. **IMPORTANT:** Select **"Session mode"** (NOT "Transaction pooler")
   - Transaction pooler doesn't support PREPARE statements (which Prisma needs)
   - Session mode is required for Prisma
7. Copy the connection string

**It should look like:**
```
postgresql://postgres.axqmavsjdrvhsdjetznb:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require
```

**⚠️ CRITICAL:** 
- You MUST select **"Session mode"** (NOT "Transaction pooler")
- Transaction pooler doesn't work with Prisma (doesn't support PREPARE statements)
- Replace `[YOUR-PASSWORD]` with your actual database password

**Key points:**
- ✅ Username: `postgres.axqmavsjdrvhsdjetznb` (includes project ref with a dot!)
- ✅ Port: `6543` (Session Pooler, NOT 5432)
- ✅ Host: `aws-0-us-east-1.pooler.supabase.com` (has "pooler" in it)
- ✅ Replace `[YOUR-PASSWORD]` with your actual database password

### Step 2: Update .env.local

1. Open `.env.local` in your project root
2. Find the `DATABASE_URL` line
3. Replace it with the connection string you copied
4. Make sure it includes `?sslmode=require` at the end

**Example:**
```env
DATABASE_URL="postgresql://postgres.axqmavsjdrvhsdjetznb:YOUR_ACTUAL_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

### Step 3: Restart Dev Server

**CRITICAL:** Environment variables only load when the server starts!

1. **Stop the server:**
   - Press `Ctrl+C` in the terminal running `npm run dev`

2. **Start again:**
   ```powershell
   npm run dev
   ```

3. **Wait for:** `Ready - started server on 0.0.0.0:3000`

### Step 4: Test the Connection

1. Visit: `http://localhost:3000/api/admin/whatsapp-diagnose`
2. Should return: `{"success": true, "tableExists": true, ...}`
3. Visit: `http://localhost:3000/admin/whatsapp`
4. Should now load without errors!

## ❌ Common Mistakes

**Wrong username format:**
```env
# ❌ Missing project reference
DATABASE_URL="postgresql://postgres:PASSWORD@..."
```

**Correct:**
```env
# ✅ Includes project reference
DATABASE_URL="postgresql://postgres.axqmavsjdrvhsdjetznb:PASSWORD@..."
```

**Wrong port:**
```env
# ❌ Direct connection (port 5432) - not IPv4 compatible
DATABASE_URL="...@db.axqmavsjdrvhsdjetznb.supabase.co:5432/..."
```

**Correct:**
```env
# ✅ Session Pooler (port 6543) - IPv4 compatible
DATABASE_URL="...@aws-0-us-east-1.pooler.supabase.com:6543/..."
```

## Why This Happens

- **Session Pooler** requires username format: `postgres.PROJECT_REF`
- **Direct connection** uses just: `postgres`
- Your network is IPv4-only, so you MUST use Session Pooler (port 6543)
- The username format is different for each connection type

## After Fixing

Once you update `.env.local` and restart:
- ✅ Prisma will connect successfully
- ✅ WhatsApp messages page will load
- ✅ All database queries will work
