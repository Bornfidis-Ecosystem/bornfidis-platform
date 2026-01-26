# Clear Drizzle to Prisma Migration Instructions

## ✅ Step 1: Verify Prisma Schema

The schema is already updated. Verify it's correct:

```bash
npx prisma format
```

Should output: `Formatted prisma\schema.prisma` ✅

## ✅ Step 2: Apply Database Migration

### Option A: Via Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Copy and Run Migration**
   - Open file: `prisma/migrations/20250123000000_drizzle_to_prisma/migration.sql`
   - Copy ALL contents
   - Paste into SQL Editor
   - Click "Run" or press `Ctrl+Enter`

4. **Verify Tables Created**
   - Go to "Table Editor" in Supabase
   - You should see: `users`, `submissions`, `phases`, `months`, `deliverables`, `metrics`

### Option B: Via Prisma (if database connection works)

```powershell
npx prisma migrate dev --name drizzle_to_prisma
```

## ✅ Step 3: Generate Prisma Client

```powershell
npx prisma generate
```

Expected output:
```
✔ Generated Prisma Client (v6.19.2)
```

## ✅ Step 4: Find Files Using Drizzle

Since `grep` doesn't work in PowerShell, use these commands:

### Find Drizzle Imports

```powershell
# Find files importing drizzle
Select-String -Path "*.ts","*.tsx" -Pattern "drizzle" -Recurse | Select-Object Path, LineNumber, Line
```

### Find Specific Table References

```powershell
# Find users table usage
Select-String -Path "*.ts","*.tsx" -Pattern "from\(users\)|\.from\(users\)" -Recurse

# Find submissions table usage
Select-String -Path "*.ts","*.tsx" -Pattern "from\(submissions\)|\.from\(submissions\)" -Recurse

# Find phases table usage
Select-String -Path "*.ts","*.tsx" -Pattern "from\(phases\)|\.from\(phases\)" -Recurse
```

### Find Database Query Files

```powershell
# Find files with database queries
Select-String -Path "*.ts","*.tsx" -Pattern "db\.select|db\.insert|db\.update|db\.delete" -Recurse | Select-Object Path -Unique
```

## ✅ Step 5: Update Query Files

For each file found, convert Drizzle queries to Prisma:

### Common Conversions

#### **SELECT (Find Many)**
```typescript
// BEFORE (Drizzle)
import { db } from '@/lib/drizzle-db';
import { users } from '@/lib/drizzle/schema';

const allUsers = await db.select().from(users);

// AFTER (Prisma)
import { db } from '@/lib/db';

const allUsers = await db.user.findMany();
```

#### **SELECT (Find One)**
```typescript
// BEFORE (Drizzle)
const user = await db.select()
  .from(users)
  .where(eq(users.id, userId))
  .limit(1);

// AFTER (Prisma)
const user = await db.user.findUnique({
  where: { id: userId }
});
```

#### **INSERT**
```typescript
// BEFORE (Drizzle)
await db.insert(users).values({
  openId: 'openid123',
  name: 'John Doe',
  email: 'john@example.com'
});

// AFTER (Prisma)
await db.user.create({
  data: {
    openId: 'openid123',
    name: 'John Doe',
    email: 'john@example.com'
  }
});
```

#### **UPDATE**
```typescript
// BEFORE (Drizzle)
await db.update(users)
  .set({ name: 'Jane Doe', updatedAt: new Date() })
  .where(eq(users.id, userId));

// AFTER (Prisma)
await db.user.update({
  where: { id: userId },
  data: { name: 'Jane Doe' }
  // updatedAt is automatic - no need to set
});
```

#### **DELETE**
```typescript
// BEFORE (Drizzle)
await db.delete(users).where(eq(users.id, userId));

// AFTER (Prisma)
await db.user.delete({
  where: { id: userId }
});
```

#### **With Relations (Phases → Months → Deliverables)**
```typescript
// BEFORE (Drizzle)
const phase = await db.select()
  .from(phases)
  .leftJoin(months, eq(phases.id, months.phaseId))
  .leftJoin(deliverables, eq(months.id, deliverables.monthId))
  .where(eq(phases.id, phaseId));

// AFTER (Prisma)
const phase = await db.phase.findUnique({
  where: { id: phaseId },
  include: {
    months: {
      include: {
        deliverables: true,
        metrics: true
      }
    }
  }
});
```

## ✅ Step 6: Update Imports

**Remove Drizzle imports:**
```typescript
// REMOVE these lines
import { db } from '@/lib/drizzle-db';
import { users, submissions, phases } from '@/lib/drizzle/schema';
import { eq, and, or } from 'drizzle-orm';
```

**Add Prisma import:**
```typescript
// ADD this line
import { db } from '@/lib/db';
```

## ✅ Step 7: Test Your Changes

After updating files, test queries:

```typescript
// Test in a route or component
import { db } from '@/lib/db';

// Test User query
const users = await db.user.findMany();
console.log('Users:', users);

// Test Submission query
const submissions = await db.submission.findMany({
  where: { type: 'farmer' },
  orderBy: { createdAt: 'desc' }
});

// Test Phase with relations
const phase = await db.phase.findUnique({
  where: { id: 'test-id' },
  include: {
    months: {
      include: {
        deliverables: true,
        metrics: true
      }
    }
  }
});
```

## ✅ Step 8: Remove Drizzle Dependencies (Optional)

Once all queries are converted, remove Drizzle from package.json:

```powershell
npm uninstall drizzle-orm drizzle-kit
```

## 📋 Quick Checklist

- [ ] Migration SQL applied to database
- [ ] Prisma client generated
- [ ] Found all Drizzle usage files
- [ ] Converted all SELECT queries
- [ ] Converted all INSERT queries
- [ ] Converted all UPDATE queries
- [ ] Converted all DELETE queries
- [ ] Updated all imports
- [ ] Tested queries work
- [ ] Removed Drizzle dependencies (optional)

## 🆘 Troubleshooting

### **Error: "Table doesn't exist"**
- Make sure migration SQL was run in Supabase
- Check Table Editor to verify tables exist

### **Error: "Model not found"**
- Run `npx prisma generate` again
- Restart your dev server

### **Error: "Cannot find module '@/lib/db'"**
- Verify `lib/db.ts` exists and exports `db`
- Check import path is correct

## 📚 Reference Files

- **Schema:** `prisma/schema.prisma`
- **Migration SQL:** `prisma/migrations/20250123000000_drizzle_to_prisma/migration.sql`
- **Full Guide:** `DRIZZLE_TO_PRISMA_MIGRATION.md`

---

**Start with Step 1 and work through each step in order.**
