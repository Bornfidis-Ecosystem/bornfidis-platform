# Fix "FATAL: Tenant or user not found" Error

## 🔍 The Problem

The error `FATAL: Tenant or user not found` means your database **username or password is incorrect** in the connection string.

## ✅ The Solution

### For Connection Pooler (Port 6543)

Your `DATABASE_URL` should use this format:

```env
DATABASE_URL="postgresql://postgres.axqmavsjdrvhsdjetznb:YOUR_PASSWORD@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Key points:**
- Username: `postgres.axqmavsjdrvhsdjetznb` (includes project ref)
- Host: `aws-1-us-east-2.pooler.supabase.com`
- Port: `6543`
- Query: `pgbouncer=true`

### For Direct Connection (Port 5432)

If you're using direct connection, format should be:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.axqmavsjdrvhsdjetznb.supabase.co:5432/postgres?sslmode=require"
```

**Key points:**
- Username: `postgres` (NO project ref for direct connection)
- Host: `db.axqmavsjdrvhsdjetznb.supabase.co`
- Port: `5432`
- Query: `sslmode=require`

## 🔧 How to Fix

### Step 1: Get Your Correct Password

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Click **Reset database password** if needed
5. Copy the password (you'll only see it once)

### Step 2: Get Your Connection String

**For Pooler (Recommended):**
1. In Supabase Dashboard → Settings → Database
2. Select **Connection Pooler** tab
3. Select **Session mode**
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your actual password

**For Direct Connection:**
1. In Supabase Dashboard → Settings → Database
2. Select **Connection string** tab
3. Select **Direct connection**
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your actual password

### Step 3: Update `.env.local`

Open `.env.local` in your project root and update:

```env
# Use ONE of these (not both):

# Option 1: Pooler (Recommended for IPv4 networks)
DATABASE_URL="postgresql://postgres.axqmavsjdrvhsdjetznb:YOUR_ACTUAL_PASSWORD@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Option 2: Direct Connection
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.axqmavsjdrvhsdjetznb.supabase.co:5432/postgres?sslmode=require"
```

**Important:**
- Replace `YOUR_ACTUAL_PASSWORD` with the password from Supabase
- No quotes around the password (unless it contains special characters)
- No spaces around the `=` sign
- Make sure there are no extra characters or typos

### Step 4: Restart Dev Server

```bash
# Stop server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Test Again

Visit: `http://localhost:3000/api/test-db`

Should now return:
```json
{
  "success": true,
  "message": "Database connectivity test passed"
}
```

## 🚨 Common Mistakes

### ❌ Wrong Username Format

**Pooler:**
- ❌ `postgres` (missing project ref)
- ✅ `postgres.axqmavsjdrvhsdjetznb`

**Direct:**
- ❌ `postgres.axqmavsjdrvhsdjetznb` (shouldn't have project ref)
- ✅ `postgres`

### ❌ Wrong Host

**Pooler:**
- ❌ `db.axqmavsjdrvhsdjetznb.supabase.co`
- ✅ `aws-1-us-east-2.pooler.supabase.com`

**Direct:**
- ❌ `aws-1-us-east-2.pooler.supabase.com`
- ✅ `db.axqmavsjdrvhsdjetznb.supabase.co`

### ❌ Wrong Port

- Pooler uses port **6543**
- Direct uses port **5432**

### ❌ Password Issues

- Password contains special characters that need URL encoding
- Password has extra spaces
- Password is outdated (reset it in Supabase)

## 🔍 Verify Your Connection String

You can test your connection string format with this PowerShell command:

```powershell
# Test if connection string format is correct
$connString = "postgresql://postgres.axqmavsjdrvhsdjetznb:PASSWORD@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
# If this parses without errors, format is correct
```

## 📝 Quick Checklist

- [ ] Password is correct (from Supabase Dashboard)
- [ ] Username matches connection type (pooler vs direct)
- [ ] Host matches connection type
- [ ] Port matches connection type (6543 for pooler, 5432 for direct)
- [ ] Query parameters are correct (`pgbouncer=true` for pooler, `sslmode=require` for direct)
- [ ] No extra spaces or characters
- [ ] Dev server restarted after changes

## 🆘 Still Not Working?

1. **Reset your database password** in Supabase Dashboard
2. **Copy the connection string directly** from Supabase (don't type it manually)
3. **Check for hidden characters** in `.env.local` (use a text editor, not Word)
4. **Verify project reference** matches: `axqmavsjdrvhsdjetznb`
5. **Try the other connection type** (if pooler fails, try direct, or vice versa)
