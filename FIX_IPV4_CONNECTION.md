# Fix: IPv4 Connection Issue - Use Session Pooler

## 🔍 Problem

You're seeing this error:
```
Can't reach database server at db.axqmavsjdrvhsdjetznb.supabase.co:5432
```

**Root Cause:** Supabase's **Direct connection** (port 5432) is **NOT IPv4 compatible**. If your network or development environment is IPv4-only, you cannot connect using the direct connection.

## ✅ Solution: Use Session Pooler (IPv4 Compatible)

The **Session Pooler** (port 6543) is IPv4-compatible and will work from any network.

---

## 📋 Step-by-Step Fix

### **Step 1: Get Session Pooler Connection String**

1. Go to: https://supabase.com/dashboard
2. Select your project: **island-harvest-hub**
3. Go to: **Settings** → **Database**
4. Scroll to **Connection string** section
5. Click **"Pooler settings"** button (or select **"Connection pooling"** tab)
6. Select **"Session mode"** (NOT Transaction mode)
7. Copy the connection string

**Expected format:**
```
postgresql://postgres.axqmavsjdrvhsdjetznb:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Key differences from Direct connection:**
- ✅ Port: `6543` (NOT 5432)
- ✅ Host: `aws-0-us-east-1.pooler.supabase.com` (NOT `db.axqmavsjdrvhsdjetznb.supabase.co`)
- ✅ Username: `postgres.axqmavsjdrvhsdjetznb` (includes project ref, NOT just `postgres`)

### **Step 2: Update .env.local**

Replace your `DATABASE_URL` in `.env.local` with the Session Pooler connection string:

```env
DATABASE_URL="postgresql://postgres.axqmavsjdrvhsdjetznb:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

**Important:**
- Replace `YOUR_PASSWORD` with your actual database password
- Keep `?sslmode=require` at the end
- Use the exact host and port from Supabase Dashboard

### **Step 3: Restart Dev Server**

**CRITICAL:** Environment variables only load at startup!

1. **Stop the dev server:**
   - Press `Ctrl+C` in terminal

2. **Start again:**
   ```powershell
   npm run dev
   ```

3. **Wait for:** `Ready - started server on 0.0.0.0:3000`

### **Step 4: Test Connection**

Visit: `http://localhost:3000/api/test-db`

**Expected success response:**
```json
{
  "success": true,
  "message": "Database connectivity test passed",
  "farmerIntakesCount": 0,
  "newModels": {
    "users": 0,
    "submissions": 0,
    "phases": 0,
    "months": 0,
    "deliverables": 0,
    "metrics": 0
  }
}
```

---

## 🔄 Connection String Comparison

### **Direct Connection (IPv6 only - NOT working)**
```
postgresql://postgres:PASSWORD@db.axqmavsjdrvhsdjetznb.supabase.co:5432/postgres?sslmode=require
```
- ❌ Port: 5432
- ❌ Host: `db.axqmavsjdrvhsdjetznb.supabase.co`
- ❌ Username: `postgres`
- ❌ **NOT IPv4 compatible**

### **Session Pooler (IPv4 compatible - USE THIS)**
```
postgresql://postgres.axqmavsjdrvhsdjetznb:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```
- ✅ Port: 6543
- ✅ Host: `aws-0-us-east-1.pooler.supabase.com`
- ✅ Username: `postgres.axqmavsjdrvhsdjetznb` (includes project ref)
- ✅ **IPv4 compatible**

---

## ⚠️ Important Notes

### **Session Pooler vs Direct Connection**

**Session Pooler (Recommended for development):**
- ✅ IPv4 compatible
- ✅ Works from any network
- ✅ Better for serverless/cloud functions
- ✅ Connection pooling (efficient)
- ⚠️ Slightly higher latency (negligible)

**Direct Connection:**
- ❌ IPv6 only (not compatible with IPv4 networks)
- ✅ Lower latency
- ✅ Better for long-lived connections
- ⚠️ Requires IPv6 support or IPv4 add-on

### **For Prisma:**
- Both connection types work with Prisma
- Session Pooler is recommended for most use cases
- No code changes needed - just update `DATABASE_URL`

---

## 🧪 Verify Connection String Format

After updating `.env.local`, verify the format:

```powershell
# Check if DATABASE_URL is loaded (PowerShell)
node -e "require('dotenv').config({ path: '.env.local' }); const url = process.env.DATABASE_URL; console.log(url ? url.substring(0, 50) + '...' : 'Not set')"
```

**Expected output:**
```
postgresql://postgres.axqmavsjdrvhsdjetznb:****@aws-0...
```

---

## 📋 Quick Checklist

- [ ] Got Session Pooler connection string from Supabase Dashboard
- [ ] Updated `.env.local` with pooler connection (port 6543)
- [ ] Username includes project ref: `postgres.axqmavsjdrvhsdjetznb`
- [ ] Connection string includes `?sslmode=require`
- [ ] Dev server restarted after updating `.env.local`
- [ ] `/api/test-db` endpoint returns success

---

## 🆘 Still Not Working?

1. **Verify Supabase Project Status:**
   - Check if database is paused (resume if needed)
   - Verify project is active in Supabase Dashboard

2. **Check Connection String:**
   - Make sure you copied the **Session Pooler** string (port 6543)
   - Verify username format: `postgres.PROJECT_REF`
   - Ensure password is correct

3. **Test with Prisma CLI:**
   ```powershell
   npx prisma db pull
   ```
   This will test the connection directly.

4. **Check Network:**
   - Can you access Supabase Dashboard?
   - Is your firewall blocking port 6543?

---

**After switching to Session Pooler, restart your dev server and test again!**
