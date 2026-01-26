# 🔧 Manual Reset Steps (If Script Fails)

## The Problem

Prisma client files are locked because:
- Dev server is running (`npm run dev`)
- VS Code/Cursor has files open
- Windows file locks prevent deletion

## ✅ Solution: Manual Steps

### Step 1: Stop Everything

1. **Stop dev server:**
   - Go to terminal running `npm run dev`
   - Press `Ctrl+C`
   - Wait for it to fully stop

2. **Close VS Code/Cursor:**
   - Save all files
   - Close the editor completely
   - This releases file locks

3. **Wait 5 seconds** (let Windows release locks)

### Step 2: Open Fresh Terminal

1. Open a **new** PowerShell terminal
2. Navigate to project:
   ```powershell
   cd C:\Users\18023\bornfidis_requirements
   ```

### Step 3: Remove Old Migrations

```powershell
Remove-Item -Recurse -Force prisma\migrations
```

### Step 4: Remove Prisma Client (If Possible)

Try this:
```powershell
Remove-Item -Recurse -Force node_modules\.prisma
```

**If it fails with "access denied":**
- That's OK! Prisma generate will overwrite the files
- Continue to next step

### Step 5: Generate Prisma Client

```powershell
npx prisma generate
```

**If it fails with "EPERM" or "operation not permitted":**
- Close ALL terminals
- Close ALL editors
- Restart your computer (Windows file locks are persistent)
- Then try again

### Step 6: Create Initial Migration

```powershell
npx prisma migrate dev --name init_bornfidis_platform
```

**Make sure:**
- `DIRECT_URL` is set in `.env.local`
- It points to **bornfidis-platform** project (not Island Harvest Hub)
- Password is correct

---

## Alternative: Skip Prisma Client Cleanup

If you can't delete `node_modules\.prisma`:

1. **Just remove migrations:**
   ```powershell
   Remove-Item -Recurse -Force prisma\migrations
   ```

2. **Generate will overwrite:**
   ```powershell
   npx prisma generate
   ```

3. **Create migration:**
   ```powershell
   npx prisma migrate dev --name init_bornfidis_platform
   ```

The old Prisma client will be overwritten by the new one.

---

## Verify It Worked

After migration completes:

1. **Check Supabase:**
   - Go to Table Editor
   - Should see your tables

2. **Test connection:**
   - Visit: `http://localhost:3000/api/test-connection`
   - Should show: `"success": true`

---

## If Still Failing

1. **Check `.env.local`:**
   - `DATABASE_URL` should use pooler (port 6543)
   - `DIRECT_URL` should use direct (port 5432)
   - Both should point to **bornfidis-platform** project

2. **Verify project reference:**
   - In Supabase Dashboard → Settings → General
   - Copy the "Reference ID"
   - Make sure it matches your connection strings

3. **Reset database password:**
   - Supabase Dashboard → Settings → Database
   - Click "Reset database password"
   - Update both `DATABASE_URL` and `DIRECT_URL` in `.env.local`
