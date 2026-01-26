# Step-by-Step: Drizzle to Prisma Migration

## 🎯 Goal
Migrate from Drizzle ORM to Prisma ORM for Supabase PostgreSQL.

---

## ✅ STEP 1: Verify Prisma Schema (Already Done)

Your schema is already updated with all 6 models. Just verify:

```powershell
npx prisma format
```

**Expected:** `Formatted prisma\schema.prisma` ✅

---

## ✅ STEP 2: Apply Database Migration

### **Method: Supabase SQL Editor** (Recommended)

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query" button

3. **Copy Migration SQL**
   - Open this file: `prisma/migrations/20250123000000_drizzle_to_prisma/migration.sql`
   - Select ALL (Ctrl+A)
   - Copy (Ctrl+C)

4. **Paste and Run**
   - Paste into SQL Editor (Ctrl+V)
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for "Success" message

5. **Verify Tables**
   - Click "Table Editor" in left sidebar
   - You should see these new tables:
     - ✅ `users`
     - ✅ `submissions`
     - ✅ `phases`
     - ✅ `months`
     - ✅ `deliverables`
     - ✅ `metrics`

---

## ✅ STEP 3: Generate Prisma Client

```powershell
npx prisma generate
```

**Expected output:**
```
✔ Generated Prisma Client (v6.19.2)
```

---

## ✅ STEP 4: Find Files Using Drizzle

Run this PowerShell command to find files:

```powershell
Get-ChildItem -Recurse -Include "*.ts","*.tsx" | Select-String -Pattern "drizzle" | Select-Object Path, LineNumber
```

This will show you which files have "drizzle" in them.

**Common locations:**
- `lib/drizzle/` folder (if exists)
- `lib/db.ts` or `lib/database.ts`
- API route files (`app/api/**/*.ts`)
- Server action files

---

## ✅ STEP 5: Convert Each File

For each file found, replace Drizzle queries with Prisma.

### **Example File Conversion**

**BEFORE (Drizzle):**
```typescript
import { db } from '@/lib/drizzle-db';
import { users } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';

// Get all users
const allUsers = await db.select().from(users);

// Get one user
const user = await db.select()
  .from(users)
  .where(eq(users.id, userId))
  .limit(1);

// Create user
await db.insert(users).values({
  name: 'John',
  email: 'john@example.com'
});
```

**AFTER (Prisma):**
```typescript
import { db } from '@/lib/db';

// Get all users
const allUsers = await db.user.findMany();

// Get one user
const user = await db.user.findUnique({
  where: { id: userId }
});

// Create user
await db.user.create({
  data: {
    name: 'John',
    email: 'john@example.com'
  }
});
```

---

## ✅ STEP 6: Common Query Patterns

### **Pattern 1: SELECT with WHERE**
```typescript
// Drizzle
db.select().from(submissions)
  .where(eq(submissions.type, 'farmer'))

// Prisma
db.submission.findMany({
  where: { type: 'farmer' }
})
```

### **Pattern 2: SELECT with ORDER BY**
```typescript
// Drizzle
db.select().from(submissions)
  .orderBy(desc(submissions.createdAt))

// Prisma
db.submission.findMany({
  orderBy: { createdAt: 'desc' }
})
```

### **Pattern 3: SELECT with Relations**
```typescript
// Drizzle (manual joins)
db.select()
  .from(phases)
  .leftJoin(months, eq(phases.id, months.phaseId))

// Prisma (automatic)
db.phase.findMany({
  include: {
    months: true
  }
})
```

### **Pattern 4: UPDATE**
```typescript
// Drizzle
db.update(users)
  .set({ name: 'New Name' })
  .where(eq(users.id, userId))

// Prisma
db.user.update({
  where: { id: userId },
  data: { name: 'New Name' }
})
```

### **Pattern 5: DELETE**
```typescript
// Drizzle
db.delete(users).where(eq(users.id, userId))

// Prisma
db.user.delete({
  where: { id: userId }
})
```

---

## ✅ STEP 7: Test Your Changes

After converting files, test in your browser or API:

1. **Start dev server:**
   ```powershell
   npm run dev
   ```

2. **Test a query:**
   - Visit a page that uses the database
   - Check browser console for errors
   - Verify data loads correctly

---

## 📋 Complete Checklist

Copy this and check off as you go:

```
[ ] Step 1: Verified Prisma schema (npx prisma format)
[ ] Step 2: Applied migration SQL in Supabase
[ ] Step 3: Generated Prisma client (npx prisma generate)
[ ] Step 4: Found all Drizzle files
[ ] Step 5: Converted all query files
[ ] Step 6: Updated all imports
[ ] Step 7: Tested queries work
[ ] Step 8: Removed Drizzle from package.json (optional)
```

---

## 🆘 Need Help?

### **Error: "Table doesn't exist"**
→ Go back to Step 2, make sure migration SQL ran successfully

### **Error: "Model not found"**
→ Run `npx prisma generate` again (Step 3)

### **Error: "Cannot find module '@/lib/db'"**
→ Check that `lib/db.ts` exists and exports `db`

### **Queries not working**
→ Check console errors, verify table names match

---

## 📁 Files to Check

1. **Schema:** `prisma/schema.prisma` (lines 96-189)
2. **Migration:** `prisma/migrations/20250123000000_drizzle_to_prisma/migration.sql`
3. **Database Client:** `lib/db.ts` (should export Prisma client)

---

**Start with Step 1 and work through each step!**
