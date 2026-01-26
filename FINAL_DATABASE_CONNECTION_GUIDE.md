# ✅ FINAL ANSWER: Database Connection Setup

## The Problem

You're getting **"FATAL: Tenant or user not found"** - this means the **username** in your connection string is wrong.

## ✅ The Correct Solution

### Use Session Pooler (Port 6543)

**Why:** Your network is IPv4-only, and direct connection (5432) requires IPv6.

### Step-by-Step Instructions

1. **Go to Supabase Dashboard:**
   - Settings → Database
   - Scroll to "Connection string"
   - Select **"Session Pooler"** (NOT "Direct connection")

2. **Copy the connection string** - it should look like:
   ```
   postgresql://postgres.axqmavsjdrvhsdjetznb:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```

3. **Important details:**
   - Username: `postgres.axqmavsjdrvhsdjetznb` (with the dot!)
   - Port: `6543` (not 5432)
   - Host: `aws-0-us-east-1.pooler.supabase.com` (or similar, with "pooler" in it)
   - Must include `?sslmode=require` at the end

4. **Update your `.env` file:**
   ```env
   DATABASE_URL="postgresql://postgres.axqmavsjdrvhsdjetznb:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
   ```
   
   **Replace `YOUR_PASSWORD` with your actual database password!**

5. **Restart your dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

## Common Mistakes

❌ **Wrong:** `postgresql://postgres:...` (missing `.PROJECT_REF`)  
✅ **Correct:** `postgresql://postgres.axqmavsjdrvhsdjetznb:...` (with dot)

❌ **Wrong:** Port `5432` (direct connection, IPv6 only)  
✅ **Correct:** Port `6543` (session pooler, IPv4 compatible)

❌ **Wrong:** `db.axqmavsjdrvhsdjetznb.supabase.co` (direct connection host)  
✅ **Correct:** `aws-0-us-east-1.pooler.supabase.com` (pooler host)

## Verify It Works

After updating `.env` and restarting:

1. Visit: `http://localhost:3000/api/test-db`
2. Should return: `{"success": true, ...}`
3. Visit: `http://localhost:3000/admin/intakes`
4. Should show the intakes table (or "No intakes yet")

## For Migrations

Since direct connection doesn't work on your network:
- Apply migrations **manually** via Supabase SQL Editor
- Migration SQL is ready in: `prisma/migrations/20250122234200_phase11g2_schema_updates/migration.sql`
- After applying, mark as applied: `npx prisma migrate resolve --applied 20250122234200_phase11g2_schema_updates`

## Summary

✅ **Use Session Pooler** (port 6543)  
✅ **Username format:** `postgres.PROJECT_REF` (with dot!)  
✅ **For runtime queries:** Works perfectly  
✅ **For migrations:** Apply manually via Supabase SQL Editor

This is the correct setup for IPv4-only networks!
