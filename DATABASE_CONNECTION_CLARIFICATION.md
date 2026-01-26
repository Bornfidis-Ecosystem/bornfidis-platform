# Database Connection Clarification

## The Confusion

You're seeing conflicting information:
- **Supabase Dashboard** says: "Not IPv4 compatible" for direct connection → suggests using Session Pooler
- **Previous guidance** said: Use direct connection (port 5432) for migrations

## The Solution

### For Runtime Queries (Your App):
**Use Session Pooler (port 6543)** - This is IPv4 compatible and works for all your app queries.

**Connection String Format:**
```
postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**Where to get it:**
1. Supabase Dashboard → Settings → Database
2. Select "Session Pooler" (not "Direct connection")
3. Copy the connection string
4. Update your `.env` file

### For Migrations:
**Apply manually via Supabase SQL Editor** - Since direct connection isn't IPv4 compatible, apply migrations directly in Supabase.

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Copy migration SQL from `prisma/migrations/.../migration.sql`
3. Paste and run in SQL Editor
4. Mark as applied: `npx prisma migrate resolve --applied MIGRATION_NAME`

## Why This Happens

- **Direct connection (5432)**: Uses IPv6, not compatible with IPv4-only networks
- **Session Pooler (6543)**: IPv4 compatible, works on all networks
- **Prisma migrations**: Typically need direct connection, but you can work around this

## Quick Fix

1. **Get Session Pooler connection string from Supabase Dashboard**
2. **Update `.env` file:**
   ```env
   DATABASE_URL="postgresql://postgres.axqmavsjdrvhsdjetznb:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
   ```
3. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

## Summary

✅ **Use Session Pooler for runtime** (your app queries)  
✅ **Apply migrations manually** via Supabase SQL Editor  
❌ **Don't use direct connection** if you see "Not IPv4 compatible" warning

This is the correct approach for IPv4-only networks!
