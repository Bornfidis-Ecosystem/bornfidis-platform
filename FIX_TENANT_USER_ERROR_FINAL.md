# Fix: "FATAL: Tenant or user not found" Error

## 🔍 Error Message
```
FATAL: Tenant or user not found
```

## ✅ Root Cause

This error happens when using **Session Pooler** with the **wrong username format**.

**Wrong (Direct connection format):**
```
postgresql://postgres:PASSWORD@...
```

**Correct (Session Pooler format):**
```
postgresql://postgres.PROJECT_REF:PASSWORD@...
```

The username **MUST** include your project reference ID when using Session Pooler!

---

## 📋 Step-by-Step Fix

### **Step 1: Get Your Project Reference ID**

Your project reference is: `axqmavsjdrvhsdjetznb`

You can find it in:
- Supabase Dashboard → Project Settings → General → Reference ID
- Or in your connection string host: `db.axqmavsjdrvhsdjetznb.supabase.co`

### **Step 2: Get Correct Session Pooler Connection String**

1. Go to: https://supabase.com/dashboard
2. Select project: **island-harvest-hub**
3. Go to: **Settings** → **Database**
4. Click **"Connection pooling"** tab (or "Pooler settings" button)
5. Select **"Session mode"** (NOT Transaction mode)
6. Copy the connection string

**It should look like:**
```
postgresql://postgres.axqmavsjdrvhsdjetznb:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Key points:**
- ✅ Username: `postgres.axqmavsjdrvhsdjetznb` (includes project ref!)
- ✅ Host: `aws-0-us-east-1.pooler.supabase.com` (pooler, not direct)
- ✅ Port: `6543` (not 5432)
- ✅ Replace `[YOUR-PASSWORD]` with your actual password

### **Step 3: Update .env.local**

**Open `.env.local`** and replace the `DATABASE_URL` line:

```env
DATABASE_URL="postgresql://postgres.axqmavsjdrvhsdjetznb:YOUR_ACTUAL_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

**Important:**
- Username MUST be: `postgres.axqmavsjdrvhsdjetznb` (with the dot and project ref)
- NOT just `postgres`
- Add `?sslmode=require` at the end if not already there

### **Step 4: Verify Connection String Format**

Your connection string should match this pattern:

```
postgresql://postgres.PROJECT_REF:PASSWORD@aws-REGION.pooler.supabase.com:6543/postgres?sslmode=require
```

**Example (with your project):**
```
postgresql://postgres.axqmavsjdrvhsdjetznb:Bornfidis2026@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

### **Step 5: Restart Dev Server**

**CRITICAL:** Environment variables only load at startup!

1. **Stop the server:**
   - Press `Ctrl+C` in terminal

2. **Start again:**
   ```powershell
   npm run dev
   ```

3. **Wait for:** `Ready - started server on 0.0.0.0:3000`

### **Step 6: Test Connection**

Visit: `http://localhost:3000/api/test-db`

**Expected success:**
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

## 🔍 Common Mistakes

### **Mistake 1: Wrong Username Format**
```env
# ❌ WRONG (Direct connection format)
DATABASE_URL="postgresql://postgres:PASSWORD@..."

# ✅ CORRECT (Session Pooler format)
DATABASE_URL="postgresql://postgres.axqmavsjdrvhsdjetznb:PASSWORD@..."
```

### **Mistake 2: Wrong Host**
```env
# ❌ WRONG (Direct connection host)
DATABASE_URL="postgresql://postgres.axqmavsjdrvhsdjetznb:PASSWORD@db.axqmavsjdrvhsdjetznb.supabase.co:6543/..."

# ✅ CORRECT (Pooler host)
DATABASE_URL="postgresql://postgres.axqmavsjdrvhsdjetznb:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/..."
```

### **Mistake 3: Wrong Port**
```env
# ❌ WRONG (Direct connection port)
DATABASE_URL="...@aws-0-us-east-1.pooler.supabase.com:5432/..."

# ✅ CORRECT (Pooler port)
DATABASE_URL="...@aws-0-us-east-1.pooler.supabase.com:6543/..."
```

### **Mistake 4: Wrong Password**
- Make sure you're using the **database password**, not your Supabase account password
- You can reset it in: Supabase Dashboard → Settings → Database → Database password

---

## 🧪 Verify Your Connection String

Run this in PowerShell to check your connection string format (without exposing password):

```powershell
node -e "require('dotenv').config({ path: '.env.local' }); const url = process.env.DATABASE_URL; if (url) { const parts = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/); if (parts) { console.log('Username:', parts[1]); console.log('Host:', parts[3]); console.log('Port:', parts[4]); console.log('Database:', parts[5]); console.log('Username includes project ref:', parts[1].includes('.')); } else { console.log('Invalid format'); } } else { console.log('DATABASE_URL not found'); }"
```

**Expected output:**
```
Username: postgres.axqmavsjdrvhsdjetznb
Host: aws-0-us-east-1.pooler.supabase.com
Port: 6543
Database: postgres
Username includes project ref: true
```

---

## 📋 Quick Checklist

- [ ] Using Session Pooler connection string (port 6543)
- [ ] Username is `postgres.axqmavsjdrvhsdjetznb` (includes project ref with dot)
- [ ] Host is `aws-0-us-east-1.pooler.supabase.com` (pooler, not direct)
- [ ] Port is `6543` (not 5432)
- [ ] Password is correct (database password, not account password)
- [ ] Connection string includes `?sslmode=require`
- [ ] Dev server restarted after updating `.env.local`
- [ ] `/api/test-db` returns success

---

## 🆘 Still Getting "Tenant or user not found"?

1. **Double-check username format:**
   - Must be: `postgres.axqmavsjdrvhsdjetznb`
   - NOT: `postgres` (missing project ref)
   - NOT: `postgres@axqmavsjdrvhsdjetznb` (wrong separator)

2. **Verify password:**
   - Go to Supabase Dashboard → Settings → Database
   - Click "Reset database password" if needed
   - Copy the new password and update `.env.local`

3. **Check connection string source:**
   - Make sure you copied from **Session Pooler** tab
   - NOT from Direct connection tab
   - Select **Session mode** (not Transaction mode)

4. **Test with Prisma CLI:**
   ```powershell
   npx prisma db pull
   ```
   This will show a clearer error message if connection still fails.

---

**The key fix: Username must be `postgres.PROJECT_REF` for Session Pooler!**
