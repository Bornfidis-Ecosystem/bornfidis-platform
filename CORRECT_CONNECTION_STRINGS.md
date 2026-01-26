# Correct Supabase Connection Strings

## ✅ Correct Format

### For `.env.local`:

```env
# Connection Pooler (for runtime queries - better performance)
DATABASE_URL="postgresql://postgres.axqmavsjdrvhsdjetznb:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection (for migrations and schema operations)
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.axqmavsjdrvhsdjetznb.supabase.co:5432/postgres?sslmode=require"
```

## 🔑 Key Differences

### DATABASE_URL (Pooler - Port 6543)
- **Host:** `aws-1-us-east-2.pooler.supabase.com` (pooler hostname)
- **Port:** `6543` (pooler port)
- **Username:** `postgres.axqmavsjdrvhsdjetznb` (includes project ref)
- **Query param:** `pgbouncer=true`
- **Use for:** Runtime queries (faster, connection pooling)

### DIRECT_URL (Direct - Port 5432)
- **Host:** `db.axqmavsjdrvhsdjetznb.supabase.co` (direct database hostname)
- **Port:** `5432` (direct port)
- **Username:** `postgres` (just `postgres`, no project ref)
- **Query param:** `sslmode=require`
- **Use for:** Migrations, schema operations

## ❌ What Was Wrong

Your `DIRECT_URL` was using:
```
aws-1-us-east-2.pooler.supabase.com:5432
```

This is incorrect because:
- The pooler hostname (`pooler.supabase.com`) is only for port 6543
- Port 5432 requires the direct database hostname (`db.PROJECT_REF.supabase.co`)

## ✅ Corrected DIRECT_URL

```env
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.axqmavsjdrvhsdjetznb.supabase.co:5432/postgres?sslmode=require"
```

## 📝 Notes

1. Replace `[YOUR-PASSWORD]` with your actual database password
2. The project reference is: `axqmavsjdrvhsdjetznb`
3. Direct connection requires `sslmode=require`
4. Pooler connection uses `pgbouncer=true`

## 🔄 After Updating

1. Update `.env.local` with both strings
2. Restart your dev server
3. Run `npx prisma generate`
4. Test with `npx prisma db pull` (uses DIRECT_URL)
