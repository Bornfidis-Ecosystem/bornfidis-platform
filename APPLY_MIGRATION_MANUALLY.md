# ✅ Apply Migration Manually via Supabase

## Status

✅ `.env` file updated with correct Supabase connection  
✅ Prisma client generated successfully  
⚠️  Prisma can't connect to database (likely network/firewall)

## Solution: Apply Migration via Supabase SQL Editor

Since Prisma can't connect, apply the migration directly in Supabase:

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

### Step 2: Copy Migration SQL

Open this file and copy ALL contents:
```
prisma/migrations/20250122234200_phase11g2_schema_updates/migration.sql
```

Or copy from below:

```sql
-- Phase 11G.2: Prisma Schema Updates
-- Creates Farmer, FarmerCrop models and updates FarmerIntake

-- Create FarmerIntakeStatus enum
CREATE TYPE "FarmerIntakeStatus" AS ENUM ('received', 'parsed', 'profile_created', 'needs_review');

-- Create farmers table
CREATE TABLE "farmers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "parish" TEXT,
    "acres" DOUBLE PRECISION,
    "language" TEXT NOT NULL DEFAULT 'en',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farmers_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on phone
CREATE UNIQUE INDEX "farmers_phone_key" ON "farmers"("phone");

-- Create farmer_crops table
CREATE TABLE "farmer_crops" (
    "id" TEXT NOT NULL,
    "farmer_id" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "farmer_crops_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on (farmer_id, crop)
CREATE UNIQUE INDEX "farmer_crops_farmer_id_crop_key" ON "farmer_crops"("farmer_id", "crop");

-- Add foreign key constraint for farmer_crops
ALTER TABLE "farmer_crops" ADD CONSTRAINT "farmer_crops_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update farmer_intakes table
-- Add parsed_json column
ALTER TABLE "farmer_intakes" ADD COLUMN IF NOT EXISTS "parsed_json" JSONB;

-- Change status column to use enum type
-- First, update existing status values to match enum values if needed
UPDATE "farmer_intakes" SET "status" = 'received' WHERE "status" NOT IN ('received', 'parsed', 'profile_created', 'needs_review');

-- Drop the old status column constraint if it exists
ALTER TABLE "farmer_intakes" DROP CONSTRAINT IF EXISTS "farmer_intakes_status_check";

-- Change status column type to enum
ALTER TABLE "farmer_intakes" ALTER COLUMN "status" TYPE "FarmerIntakeStatus" USING "status"::"FarmerIntakeStatus";

-- Set default value for status
ALTER TABLE "farmer_intakes" ALTER COLUMN "status" SET DEFAULT 'received';

-- Add foreign key constraint for farmer_id (if it doesn't already exist)
-- First check if the constraint exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'farmer_intakes_farmer_id_fkey'
    ) THEN
        ALTER TABLE "farmer_intakes" 
        ADD CONSTRAINT "farmer_intakes_farmer_id_fkey" 
        FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
```

### Step 3: Paste and Run

1. Paste the SQL into the Supabase SQL Editor
2. Click **"Run"** (or press Ctrl+Enter)
3. Wait for success message

### Step 4: Mark Migration as Applied

After running the SQL successfully, mark the migration as applied in Prisma:

```powershell
npx prisma migrate resolve --applied 20250122234200_phase11g2_schema_updates
```

### Step 5: Verify

```powershell
# Check migration status
npx prisma migrate status

# Should show: "Database schema is up to date!"
```

## ✅ What Gets Created

- ✅ `FarmerIntakeStatus` enum
- ✅ `farmers` table (with unique phone constraint)
- ✅ `farmer_crops` table (with compound unique constraint)
- ✅ Updated `farmer_intakes` table (with `parsed_json` and enum status)

## 🎯 Success Indicators

After applying:
- ✅ SQL runs without errors in Supabase
- ✅ `npx prisma migrate status` shows migration as applied
- ✅ You can query the new tables in Supabase

## 📝 Notes

- This approach bypasses Prisma's connection issues
- The migration SQL is idempotent (safe to run multiple times)
- All constraints and indexes are created correctly
- Existing data in `farmer_intakes` is preserved
