# 🌱 Reset to Bornfidis Platform - Clean Migration

## Root Cause Identified ✅

You're using connection strings from the **old Island Harvest Hub** project instead of the new **bornfidis-platform** project.

This causes: `FATAL: Tenant or user not found`

---

## Phase A: Confirm Correct Project ✅

- **Org:** Bornfidis-Ecosystem's Org
- **Project:** bornfidis-platform  
- **Region:** AWS us-east-1
- **Status:** Clean slate (no tables yet) ✅

---

## Phase B: Get Connection Strings from Supabase

### Step 1: Go to Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select project: **bornfidis-platform**
3. Go to: **Settings** → **Database**

### Step 2: Get Transaction Pooler (Runtime)

1. Scroll to **"Connection string"** section
2. Click **"Connection pooling"** tab
3. Select **"Transaction pooler"** (for runtime queries)
4. Copy the connection string

**Format:**
```
postgresql://postgres:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

### Step 3: Get Direct Connection (Migrations)

1. Still in **Settings** → **Database**
2. In **"Connection string"** section
3. Select **"Direct connection"** (for Prisma migrations)
4. Copy the connection string

**Format:**
```
postgresql://postgres:[PASSWORD]@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

**Note:** Replace `YOUR_PROJECT_REF` with your actual project reference ID (visible in the connection string).

---

## Phase C: Update .env.local

Open `.env.local` and add/replace these lines:

```env
# Runtime (Next.js API routes) - Transaction Pooler
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

# Prisma migrations ONLY - Direct Connection
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require"
```

**Important:**
- Replace `YOUR_PASSWORD` with your actual database password
- Replace `YOUR_PROJECT_REF` with your actual project reference
- Use the **same password** for both
- **No quotes inside the URL**
- **No old project refs** (like `axqmavsjdrvhsdjetznb`)

---

## Phase D: Prisma Schema Updated ✅

The schema now uses both URLs:
- `DATABASE_URL` for runtime queries (pooler)
- `DIRECT_URL` for migrations (direct)

---

## Phase E: Reset Prisma State

Run these commands **in order**:

```powershell
# 1. Remove old migrations (from Island Harvest Hub)
Remove-Item -Recurse -Force prisma\migrations

# 2. Remove Prisma client cache
Remove-Item -Recurse -Force node_modules\.prisma

# 3. Generate fresh Prisma client
npx prisma generate

# 4. Create initial migration for bornfidis-platform
npx prisma migrate dev --name init_bornfidis_platform
```

**If step 4 fails**, stop and share the exact error message.

---

## Phase F: Create First Table (Anchor)

The schema already has models. After running migrations, you should see tables in Supabase.

**Verify:**
1. Go to Supabase Dashboard → **Table Editor**
2. You should see tables like:
   - `users`
   - `submissions`
   - `phases`
   - `months`
   - `deliverables`
   - `metrics`
   - `farmers`
   - `farmer_intakes`
   - `whatsapp_messages`

---

## Phase G: Verify Runtime Connection

Test the connection:

1. Visit: `http://localhost:3000/api/test-connection`
2. Should show: `"success": true`
3. Visit: `http://localhost:3000/api/admin/whatsapp-diagnose`
4. Should return: `{"success": true, "tableExists": true, ...}`

---

## What You've Achieved

✅ **Reclaimed ownership** of your data  
✅ **Separated legacy Island Harvest Hub** from **Bornfidis Platform**  
✅ **Clean, sovereign database** ready for:
- Food systems (ProJu / Island Harvest Hub)
- Workforce onboarding
- Education & digital tools
- Scalable regenerative enterprise

---

## Next Steps (Choose One)

1. **Build Farmer Intake schema** (Phase 11G reborn, clean)
2. **Add Auth + Users** (Supabase Auth + Prisma sync)
3. **Lock environment parity** (local → production checklist)

Tell me which one you want to proceed with! 🌍✨
