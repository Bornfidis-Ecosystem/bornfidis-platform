# 🔐 Fix: "FATAL: Tenant or user not found" - Password Issue

## ✅ Good News
Your connection string **format is perfect**! All checks pass:
- ✅ Using Session mode
- ✅ Has project reference in username
- ✅ Using pooler (port 6543)
- ✅ SSL mode enabled

## ❌ The Problem
The error "Tenant or user not found" means the **password is wrong** or the **username doesn't match**.

## 🔧 Solution: Reset Database Password

### Step 1: Reset Password in Supabase

1. Go to: https://supabase.com/dashboard
2. Select project: **island-harvest-hub**
3. Go to: **Settings** → **Database**
4. Scroll down to **"Database password"** section
5. Click **"Reset database password"** button
6. **Copy the new password** (you'll only see it once!)

### Step 2: Get Fresh Connection String

1. Still in **Settings** → **Database**
2. Go to **"Connection string"** section
3. Click **"Connection pooling"** tab
4. Make sure **"Session mode"** is selected
5. **Copy the connection string** (it will have the new password)

### Step 3: Update .env.local

1. Open `.env.local`
2. Replace the entire `DATABASE_URL` line with the new connection string you just copied
3. **Make sure** it includes `?sslmode=require` at the end

**Example:**
```env
DATABASE_URL="postgresql://postgres.axqmavsjdrvhsdjetznb:NEW_PASSWORD_HERE@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require"
```

### Step 4: Restart Dev Server

**CRITICAL:** Environment variables only load at startup!

```powershell
# Stop server (Ctrl+C)
npm run dev
```

### Step 5: Test Again

1. Visit: `http://localhost:3000/api/test-connection`
2. Should now show: `"success": true`
3. Visit: `http://localhost:3000/api/admin/whatsapp-diagnose`
4. Should return: `{"success": true, "tableExists": true, ...}`

## 🔍 Why This Happens

- Database passwords can expire or be reset
- Special characters in passwords might need URL encoding
- Copying connection strings sometimes misses characters
- The password in your `.env.local` might be outdated

## ✅ Success Indicators

After resetting password and updating `.env.local`:
- ✅ `/api/test-connection` shows `"success": true`
- ✅ `/api/admin/whatsapp-diagnose` works
- ✅ `/admin/whatsapp` page loads without errors

## 🆘 If Password Reset Doesn't Work

1. **Check for special characters:** If your password has `@`, `#`, `%`, etc., they might need URL encoding
2. **Try copying connection string again:** Make sure you copy the ENTIRE string
3. **Check .env.local format:** Make sure there are no extra spaces or quotes
4. **Verify username:** Should be exactly `postgres.axqmavsjdrvhsdjetznb` (with the dot)
