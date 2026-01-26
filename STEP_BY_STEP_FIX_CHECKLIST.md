# ✅ Step-by-Step Fix Checklist

## Current Status
- ✅ RLS policies are created correctly (I can see them in Supabase)
- ❌ Database connection is failing ("FATAL: Tenant or user not found")
- ❌ Prisma can't connect to the database

## The Fix (Do These Steps in Order)

### ✅ Step 1: Get the Correct Connection String from Supabase

1. Go to: https://supabase.com/dashboard
2. Select project: **island-harvest-hub**
3. Go to: **Settings** → **Database**
4. Scroll to **"Connection string"** section
5. Click **"Connection pooling"** tab
6. **CRITICAL:** In the "Method" dropdown, select **"Session mode"** (NOT "Transaction pooler")
7. Copy the entire connection string

**It should look like:**
```
postgresql://postgres.axqmavsjdrvhsdjetznb:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

### ✅ Step 2: Update .env.local File

1. Open `.env.local` in your project root
2. Find the line that starts with `DATABASE_URL=`
3. Replace the entire line with:

```env
DATABASE_URL="postgresql://postgres.axqmavsjdrvhsdjetznb:YOUR_ACTUAL_PASSWORD@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require"
```

**IMPORTANT:**
- Replace `YOUR_ACTUAL_PASSWORD` with your real database password
- Make sure the username is `postgres.axqmavsjdrvhsdjetznb` (with the dot!)
- Make sure it ends with `?sslmode=require`
- Make sure the port is `6543` (not 5432)
- Make sure the host has "pooler" in it

### ✅ Step 3: Save and Restart Dev Server

1. **Save** `.env.local` (Ctrl+S)
2. **Stop** your dev server:
   - Go to the terminal running `npm run dev`
   - Press `Ctrl+C`
3. **Start** the dev server again:
   ```powershell
   npm run dev
   ```
4. **Wait** for: `Ready - started server on 0.0.0.0:3000`

### ✅ Step 4: Test the Connection

1. Open browser: `http://localhost:3000/api/admin/whatsapp-diagnose`
2. Should return: `{"success": true, "tableExists": true, "messageCount": 0, ...}`
3. If that works, go to: `http://localhost:3000/admin/whatsapp`
4. Should now show "No messages yet" instead of an error!

## ❌ Common Mistakes to Avoid

### Mistake 1: Using Transaction Pooler
- ❌ **Wrong:** "Transaction pooler" in Supabase dashboard
- ✅ **Correct:** "Session mode" in Supabase dashboard

### Mistake 2: Wrong Username Format
- ❌ **Wrong:** `postgres:PASSWORD@...` (missing project ref)
- ✅ **Correct:** `postgres.axqmavsjdrvhsdjetznb:PASSWORD@...` (with dot and project ref)

### Mistake 3: Wrong Port
- ❌ **Wrong:** Port `5432` (direct connection, not IPv4 compatible)
- ✅ **Correct:** Port `6543` (session pooler, IPv4 compatible)

### Mistake 4: Not Restarting Server
- ❌ **Wrong:** Updating `.env.local` but not restarting
- ✅ **Correct:** Always restart after changing environment variables

### Mistake 5: Password Placeholder
- ❌ **Wrong:** `[YOUR-PASSWORD]` or `YOUR_PASSWORD` (literal text)
- ✅ **Correct:** Your actual database password

## 🔍 How to Verify Your Connection String is Correct

Your connection string should have ALL of these:
- ✅ Starts with `postgresql://`
- ✅ Username: `postgres.axqmavsjdrvhsdjetznb` (with dot!)
- ✅ Password: Your actual password (not a placeholder)
- ✅ Host: `aws-1-us-east-2.pooler.supabase.com` (has "pooler")
- ✅ Port: `6543` (not 5432)
- ✅ Database: `/postgres`
- ✅ Ends with: `?sslmode=require`

## 🆘 If It Still Doesn't Work

1. **Double-check** you selected "Session mode" (not Transaction pooler)
2. **Verify** your password is correct (try resetting it in Supabase if unsure)
3. **Check** `.env.local` has no extra spaces or quotes
4. **Make sure** you restarted the dev server after changing `.env.local`
5. **Check** the terminal for any error messages when starting the server

## ✅ Success Indicators

When it's working, you'll see:
- ✅ No "FATAL: Tenant or user not found" error
- ✅ `/api/admin/whatsapp-diagnose` returns success
- ✅ `/admin/whatsapp` page loads (even if it shows "No messages yet")
