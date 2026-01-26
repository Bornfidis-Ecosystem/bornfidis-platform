# Phase 11G.2 Prisma Schema Updates - Summary

## ✅ Completed

### 1. Updated `prisma/schema.prisma`

#### New Enum: `FarmerIntakeStatus`
- Values: `received`, `parsed`, `profile_created`, `needs_review`
- Located in `public` schema

#### New Model: `Farmer`
- **Fields:**
  - `id` (uuid, primary key)
  - `name` (String, required)
  - `phone` (String, unique, required)
  - `parish` (String, nullable)
  - `acres` (Float, nullable)
  - `language` (String, default 'en')
  - `createdAt` (DateTime, auto-generated)
  - `updatedAt` (DateTime, auto-updated)
- **Relations:**
  - `intakes` → `FarmerIntake[]`
  - `crops` → `FarmerCrop[]`
- **Table mapping:** `farmers`

#### New Model: `FarmerCrop`
- **Fields:**
  - `id` (uuid, primary key)
  - `farmerId` (String, FK to Farmer, cascade delete)
  - `crop` (String, required)
  - `createdAt` (DateTime, auto-generated)
- **Relations:**
  - `farmer` → `Farmer`
- **Constraints:**
  - Compound unique constraint on (`farmerId`, `crop`)
- **Table mapping:** `farmer_crops`

#### Updated Model: `FarmerIntake`
- **New Fields:**
  - `parsedJson` (Json?, nullable) - stores parser result
- **Updated Fields:**
  - `status` - Changed from `String` to `FarmerIntakeStatus` enum (default: `received`)
  - `farmerId` - Now has proper FK relation to `Farmer` model
- **New Relations:**
  - `farmer` → `Farmer?` (nullable, set null on delete)
- **Preserved Fields:**
  - All existing fields remain compatible: `id`, `createdAt`, `channel`, `fromPhone`, `messageText`, `mediaUrl`, `mediaContentType`, `transcript`, `extractedJson`, `error`

### 2. Created Migration

**Location:** `prisma/migrations/20250122234200_phase11g2_schema_updates/migration.sql`

**Migration includes:**
- Creates `FarmerIntakeStatus` enum
- Creates `farmers` table with all required fields and constraints
- Creates `farmer_crops` table with compound unique constraint
- Updates `farmer_intakes` table:
  - Adds `parsed_json` column
  - Converts `status` column to enum type
  - Adds foreign key constraint to `farmers` table
- Handles existing data migration (status values)

**Migration Notes:** `prisma/migrations/20250122234200_phase11g2_schema_updates/MIGRATION_NOTES.md`

## 📋 Commands to Run

### When Database is Available:

1. **Apply the migration:**
   ```bash
   npx prisma migrate dev --name phase11g2_schema_updates
   ```
   
   Or if the migration directory already exists:
   ```bash
   npx prisma migrate deploy
   ```

2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Verify migration status:**
   ```bash
   npx prisma migrate status
   ```

### Schema Validation:

The schema has been validated and has no linting errors. The Prisma client generation may require the database to be available, but the schema itself is syntactically correct.

## 🔍 Key Features

1. **Data Integrity:**
   - Unique phone numbers per farmer
   - No duplicate crops per farmer (compound unique constraint)
   - Cascade delete for farmer crops when farmer is deleted
   - Set null for farmer intakes when farmer is deleted (preserves intake history)

2. **Backward Compatibility:**
   - Existing `farmer_intakes` records remain valid
   - Nullable `farmerId` allows intakes without farmer profiles
   - Status migration handles existing string values

3. **Relations:**
   - `Farmer` ↔ `FarmerIntake` (one-to-many, nullable)
   - `Farmer` ↔ `FarmerCrop` (one-to-many, required)

## 📁 Files Modified/Created

- ✅ `prisma/schema.prisma` - Updated with new models and enum
- ✅ `prisma/migrations/20250122234200_phase11g2_schema_updates/migration.sql` - Migration SQL
- ✅ `prisma/migrations/20250122234200_phase11g2_schema_updates/MIGRATION_NOTES.md` - Detailed migration notes

## ⚠️ Important Notes

1. **Database Connection Required:** The migration commands require an active database connection. Ensure your `DATABASE_URL` environment variable is set correctly.

2. **Connection Pooler vs Direct Connection:**
   - **For Migrations:** Use **direct connection** (port 5432)
   - **For App Runtime:** Connection pooler (port 6543) is fine
   - See `TROUBLESHOOTING.md` for details

3. **Existing Data:** The migration will:
   - Convert existing `status` string values to enum (non-matching values default to 'received')
   - Preserve all existing `farmer_intakes` records
   - Allow `farmer_id` to remain NULL for existing records

4. **Type Safety:** After generating the Prisma client, TypeScript will have full type safety for:
   - `FarmerIntakeStatus` enum
   - `Farmer`, `FarmerCrop`, and `FarmerIntake` models
   - All relations between models

## 🔧 Troubleshooting

### Database Connection Error

**Problem:** `Can't reach database server at localhost:51260`

**Solution:** Your `.env.local` uses the connection pooler. For migrations, use the **direct connection**:

```env
# Get from Supabase Dashboard → Settings → Database → Direct connection
DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require"
```

**Alternative:** Apply migration manually via Supabase SQL Editor (see `TROUBLESHOOTING.md`)

### Permission Error (EPERM)

**Problem:** `EPERM: operation not permitted, rename query_engine-windows.dll.node`

**Solution:**
1. Close your Next.js dev server (Ctrl+C)
2. Close any IDE processes
3. Run: `npx prisma generate`
4. If still failing: Delete `node_modules\.prisma\client` and regenerate

**See:** `prisma/migrations/20250122234200_phase11g2_schema_updates/TROUBLESHOOTING.md` for detailed solutions

## Next Steps

1. Ensure database is running and accessible
2. Run `npx prisma migrate dev` to apply the migration
3. Run `npx prisma generate` to update the Prisma client
4. Update any code that references `FarmerIntake.status` to use the enum values
5. Test the new models and relations in your application
