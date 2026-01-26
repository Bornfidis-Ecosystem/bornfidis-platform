# Syncing Intake Table with Prisma

## Current Status

The `Intake` model has been added to `prisma/schema.prisma` to match your Supabase table structure.

## Schema Structure

The `Intake` model matches your table:
- `id` (TEXT, primary key) → `id String @id @default(uuid())`
- `createdAt` (TIMESTAMP WITH TIME ZONE) → `createdAt DateTime @map("createdAt") @db.Timestamptz`
- `channel` (TEXT, not null) → `channel String`
- `from` (TEXT, not null) → `from String @map("\"from\"")` (quoted because "from" is a reserved word)
- `message` (TEXT, not null) → `message String @db.Text`
- `farmerName` (TEXT, nullable) → `farmerName String? @map("farmerName")`
- `status` (TEXT, default 'new') → `status String @default("new")`
- `type` (TEXT, default 'inquiry') → `type String @default("inquiry")`

## Next Steps

### 1. Fix File Lock Issue

If `npx prisma generate` fails with EPERM error:
```powershell
# Stop your dev server (Ctrl+C)
# Close any IDE/editors
# Then run:
Remove-Item -Recurse -Force node_modules\.prisma\client
npx prisma generate
```

### 2. Verify Column Names

The column mappings assume camelCase column names in PostgreSQL. If your columns are actually stored as:
- **snake_case** (e.g., `created_at`, `farmer_name`): Update `@map` directives
- **lowercase** (e.g., `createdat`, `farmername`): Update `@map` directives

**To check actual column names:**
1. Go to Supabase Dashboard → Table Editor
2. Select the `intakes` table
3. Check the actual column names

### 3. Update Schema if Needed

If column names don't match, update the `@map` directives. For example:

**If columns are snake_case:**
```prisma
model Intake {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz
  channel   String
  from      String   @map("from")
  message   String   @db.Text
  farmerName String? @map("farmer_name")
  status    String   @default("new")
  type      String   @default("inquiry")
  
  @@schema("public")
  @@map("intakes")
}
```

### 4. Generate Client

Once schema is correct:
```powershell
npx prisma generate
```

### 5. Test Endpoint

Visit: `http://localhost:3000/api/test-db`

Should return success if connection works.

## Alternative: Use db pull (when connection works)

Once your database connection is working (Session Pooler), you can run:
```powershell
npx prisma db pull
```

This will automatically sync the schema with your database structure.

## Current Schema Location

The `Intake` model is in `prisma/schema.prisma` starting at line 56.
