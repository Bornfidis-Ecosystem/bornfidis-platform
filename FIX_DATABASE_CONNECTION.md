# Fix: Database Connection Error

## 🔍 Error Message
```
Can't reach database server at db.axqmavsjdrvhsdjetznb.supabase.co:5432
```

## ✅ Step-by-Step Fix

### **Step 1: Check .env.local File**

1. **Open `.env.local`** in your project root
2. **Verify it has this format:**
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.axqmavsjdrvhsdjetznb.supabase.co:5432/postgres?sslmode=require"
   ```

3. **Important checks:**
   - ✅ Must start with `postgresql://` or `postgres://`
   - ✅ Must include `?sslmode=require` at the end
   - ✅ Host: `db.axqmavsjdrvhsdjetznb.supabase.co`
   - ✅ Port: `5432` (direct connection, NOT 6543)
   - ✅ Username: `postgres`
   - ✅ No quotes inside quotes (use single quotes if needed)

### **Step 2: Get Correct Connection String from Supabase**

1. Go to: https://supabase.com/dashboard
2. Select your project: **island-harvest-hub**
3. Go to: **Settings** → **Database**
4. Scroll to **Connection string** section
5. Select **"Direct connection"** (NOT "Connection pooling")
6. Copy the connection string
7. It should look like:
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
   **BUT** for Prisma, you need the **direct connection** format:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
   ```

### **Step 3: Update .env.local**

Replace the entire `DATABASE_URL` line with the correct string from Step 2.

**Example format:**
```env
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.axqmavsjdrvhsdjetznb.supabase.co:5432/postgres?sslmode=require"
```

### **Step 4: Restart Dev Server**

**CRITICAL:** Environment variables are only loaded when the server starts!

1. **Stop the dev server:**
   - Press `Ctrl+C` in the terminal where `npm run dev` is running

2. **Start it again:**
   ```powershell
   npm run dev
   ```

3. **Wait for:** `Ready - started server on 0.0.0.0:3000`

### **Step 5: Test Connection**

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

## 🔧 Common Issues & Fixes

### **Issue 1: "DATABASE_URL not found"**
- **Fix:** Make sure `.env.local` exists in project root (not in a subfolder)
- **Fix:** Restart dev server after creating/updating `.env.local`

### **Issue 2: "points to localhost"**
- **Fix:** Your `.env` file might be overriding `.env.local`
- **Fix:** Check `.env` file and remove or comment out `DATABASE_URL` line there
- **Fix:** Use `.env.local` for local development (it takes precedence)

### **Issue 3: "Can't reach database server"**
- **Fix:** Verify Supabase project is active (not paused)
- **Fix:** Check firewall/network isn't blocking port 5432
- **Fix:** Verify connection string format is correct
- **Fix:** Try using Supabase Dashboard → SQL Editor to confirm database is accessible

### **Issue 4: "Invalid format"**
- **Fix:** Connection string must start with `postgresql://` or `postgres://`
- **Fix:** Remove any `prisma+` prefix if present
- **Fix:** Ensure `?sslmode=require` is at the end

---

## 🧪 Diagnostic Commands

### **Check if DATABASE_URL is loaded:**
```powershell
# In PowerShell (from project root)
node -e "require('dotenv').config({ path: '.env.local' }); console.log(process.env.DATABASE_URL ? 'Found' : 'Not found')"
```

### **Check connection string format:**
```powershell
node -e "require('dotenv').config({ path: '.env.local' }); const url = process.env.DATABASE_URL; console.log(url ? url.substring(0, 30) + '...' : 'Not set')"
```

---

## 📋 Quick Checklist

- [ ] `.env.local` exists in project root
- [ ] `DATABASE_URL` is set correctly (direct connection, port 5432)
- [ ] Connection string includes `?sslmode=require`
- [ ] Dev server was restarted after updating `.env.local`
- [ ] Supabase project is active (not paused)
- [ ] `/api/test-db` endpoint returns success

---

## 🆘 Still Not Working?

1. **Check Supabase Dashboard:**
   - Go to your project
   - Check if database is paused (resume if needed)
   - Try running a simple SQL query in SQL Editor

2. **Verify Network:**
   - Can you access Supabase Dashboard?
   - Is your firewall blocking port 5432?

3. **Check Both .env Files:**
   - `.env` (might override `.env.local`)
   - `.env.local` (should have correct DATABASE_URL)

4. **Test with Prisma CLI:**
   ```powershell
   npx prisma db pull
   ```
   This will test the connection directly.

---

**After fixing, restart your dev server and test again!**
