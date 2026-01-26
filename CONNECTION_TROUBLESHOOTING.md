# Database Connection Troubleshooting

## ✅ Progress Made

1. ✅ `.env.local` is correctly formatted
2. ✅ `DATABASE_URL` is being loaded by Next.js
3. ✅ Prisma is reading the correct Supabase URL
4. ⚠️ Connection to Supabase server is failing

## Current Error

```
Can't reach database server at `db.axqmavsjdrvhsdjetznb.supabase.co:5432`
```

## Possible Causes & Solutions

### 1. SSL Mode Required (Most Likely)

Supabase requires SSL connections. I've updated the code to automatically add `sslmode=require` if missing.

**Updated `.env.local`:**
```env
DATABASE_URL=postgresql://postgres:Bornfidis2026@db.axqmavsjdrvhsdjetznb.supabase.co:5432/postgres?sslmode=require
```

### 2. Supabase Project Status

Check if your Supabase project is:
- ✅ **Active** (not paused)
- ✅ **Accessible** from your network
- ✅ **Has correct credentials**

**To check:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Check project status (should be "Active")
4. Go to Settings → Database
5. Verify connection string matches

### 3. Network/Firewall Issues

Your network might be blocking port 5432.

**Test connectivity:**
```powershell
Test-NetConnection -ComputerName db.axqmavsjdrvhsdjetznb.supabase.co -Port 5432
```

If this fails, try:
- Different network (mobile hotspot)
- Check corporate firewall settings
- Use Supabase connection pooler (port 6543) as fallback

### 4. Connection Pooler Alternative

If direct connection fails, try the **pooled connection**:

```env
DATABASE_URL=postgresql://postgres.axqmavsjdrvhsdjetznb:Bornfidis2026@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**Note:** Pooler is for app runtime, not migrations. But it works for queries.

### 5. Verify Credentials

Double-check:
- Password is correct (no extra spaces)
- Project reference is correct: `axqmavsjdrvhsdjetznb`
- Username is `postgres` (not `postgres.axqmavsjdrvhsdjetznb`)

## Next Steps

1. **Restart dev server** after updating `.env.local`:
   ```powershell
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Test connection**:
   ```
   http://localhost:3000/api/test-db
   ```

3. **If still failing**, try the pooler connection string from Supabase Dashboard

## Updated Code

I've updated `lib/db.ts` to:
- ✅ Automatically add `sslmode=require` if missing
- ✅ Provide better error messages
- ✅ Validate connection string format

## Alternative: Use Supabase Client (Already Working)

The `/admin/intakes` page uses Supabase client (not Prisma), which should work fine. Prisma is only needed for:
- `/api/whatsapp/inbound` (WhatsApp webhook)
- `/api/test-db` (test endpoint)

If Prisma connection continues to fail, we can:
1. Use Supabase client for all database operations
2. Or troubleshoot the Prisma connection further
