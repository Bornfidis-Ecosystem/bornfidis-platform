# Drizzle to Prisma Migration Guide

## ✅ Completed

### 1. Prisma Installation
- ✅ Prisma and @prisma/client already installed (v6.19.2)
- ✅ Schema file updated with new models

### 2. Schema Conversion
All Drizzle tables have been converted to Prisma models:

#### **User Model**
```prisma
model User {
  id          String    @id @default(uuid())
  openId      String?   @map("open_id")
  name        String?
  email       String?
  loginMethod String?   @map("login_method")
  role        String?
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  lastSignedIn DateTime? @map("last_signed_in")
  
  @@schema("public")
  @@map("users")
}
```

#### **Submission Model**
```prisma
model Submission {
  id         String    @id @default(uuid())
  type       String?
  name       String?
  phone      String?
  email      String?
  location   String?
  acres      Float?
  crops      String?
  experience String?
  language   String?
  wasOffline Boolean?  @default(false) @map("was_offline")
  createdAt  DateTime  @default(now()) @map("created_at")
  
  @@schema("public")
  @@map("submissions")
}
```

#### **Phase Model** (with relation to Months)
```prisma
model Phase {
  id         String    @id @default(uuid())
  number     Int?
  title      String?
  description String?  @db.Text
  startMonth String?   @map("start_month")
  endMonth   String?   @map("end_month")
  status     String?
  
  months     Month[]  // One-to-many relation
  
  @@schema("public")
  @@map("phases")
}
```

#### **Month Model** (with relations)
```prisma
model Month {
  id         String    @id @default(uuid())
  phaseId    String?   @map("phase_id")
  number     Int?
  title      String?
  objectives String?   @db.Text
  status     String?
  
  phase        Phase?        @relation(fields: [phaseId], references: [id], onDelete: Cascade)
  deliverables Deliverable[] // One-to-many
  metrics      Metric[]       // One-to-many
  
  @@schema("public")
  @@map("months")
}
```

#### **Deliverable Model**
```prisma
model Deliverable {
  id          String   @id @default(uuid())
  monthId     String?  @map("month_id")
  title       String?
  description String?  @db.Text
  completed   Boolean? @default(false)
  
  month       Month?   @relation(fields: [monthId], references: [id], onDelete: Cascade)
  
  @@schema("public")
  @@map("deliverables")
}
```

#### **Metric Model**
```prisma
model Metric {
  id       String   @id @default(uuid())
  monthId  String?  @map("month_id")
  name     String?
  target   Float?
  actual   Float?
  unit     String?
  
  month    Month?   @relation(fields: [monthId], references: [id], onDelete: Cascade)
  
  @@schema("public")
  @@map("metrics")
}
```

## 🔄 Query Conversion Examples

### **Drizzle → Prisma Conversions**

#### **SELECT (Find Many)**
```typescript
// Drizzle
const users = await db.select().from(users);

// Prisma
const users = await db.user.findMany();
```

#### **SELECT (Find One)**
```typescript
// Drizzle
const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

// Prisma
const user = await db.user.findUnique({
  where: { id: userId }
});
```

#### **INSERT**
```typescript
// Drizzle
await db.insert(users).values({
  openId: '...',
  name: 'John',
  email: 'john@example.com'
});

// Prisma
await db.user.create({
  data: {
    openId: '...',
    name: 'John',
    email: 'john@example.com'
  }
});
```

#### **UPDATE**
```typescript
// Drizzle
await db.update(users)
  .set({ name: 'Jane', updatedAt: new Date() })
  .where(eq(users.id, userId));

// Prisma
await db.user.update({
  where: { id: userId },
  data: { name: 'Jane' } // updatedAt is automatic
});
```

#### **DELETE**
```typescript
// Drizzle
await db.delete(users).where(eq(users.id, userId));

// Prisma
await db.user.delete({
  where: { id: userId }
});
```

#### **Relations (Include)**
```typescript
// Drizzle (manual joins)
const phase = await db.select()
  .from(phases)
  .leftJoin(months, eq(phases.id, months.phaseId))
  .where(eq(phases.id, phaseId));

// Prisma (automatic relations)
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

#### **Filtering**
```typescript
// Drizzle
const submissions = await db.select()
  .from(submissions)
  .where(and(
    eq(submissions.type, 'farmer'),
    isNotNull(submissions.email)
  ))
  .orderBy(desc(submissions.createdAt));

// Prisma
const submissions = await db.submission.findMany({
  where: {
    type: 'farmer',
    email: { not: null }
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

## 📋 Migration Steps

### **Step 1: Apply Database Migration**

**Option A: Via Prisma (if connection works)**
```bash
npx prisma migrate dev --name drizzle_to_prisma
```

**Option B: Manual SQL (Recommended)**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of: `prisma/migrations/20250123000000_drizzle_to_prisma/migration.sql`
3. Paste and run in SQL Editor

### **Step 2: Generate Prisma Client**
```bash
npx prisma generate
```

### **Step 3: Update Database Query Files**

Find all files using Drizzle and convert to Prisma:

**Search for Drizzle usage:**
```bash
# Search for drizzle imports
grep -r "from.*drizzle" .
grep -r "import.*drizzle" .
```

**Common patterns to replace:**
- `db.select().from(table)` → `db.table.findMany()`
- `db.insert(table).values()` → `db.table.create()`
- `db.update(table).set()` → `db.table.update()`
- `db.delete(table)` → `db.table.delete()`

### **Step 4: Update Imports**

**Before (Drizzle):**
```typescript
import { db } from '@/lib/drizzle-db';
import { users, submissions } from '@/lib/drizzle/schema';
```

**After (Prisma):**
```typescript
import { db } from '@/lib/db';
// No need to import models - they're in db.user, db.submission, etc.
```

## 🔍 Finding Files to Update

Search for these patterns in your codebase:

```bash
# Find Drizzle imports
grep -r "drizzle" --include="*.ts" --include="*.tsx" .

# Find table references
grep -r "from(users)" --include="*.ts" .
grep -r "from(submissions)" --include="*.ts" .
grep -r "from(phases)" --include="*.ts" .
```

## 📝 Field Type Mappings

| Drizzle Type | Prisma Type | Notes |
|--------------|-------------|-------|
| `text()` | `String` | Text fields |
| `integer()` | `Int` | Whole numbers |
| `real()` / `double()` | `Float` | Decimal numbers |
| `boolean()` | `Boolean` | True/false |
| `timestamp()` | `DateTime` | Timestamps |
| `uuid()` | `String @id @default(uuid())` | Primary keys |

## ✅ Verification Checklist

- [ ] Migration SQL applied to database
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] All Drizzle imports replaced with Prisma
- [ ] All queries converted to Prisma syntax
- [ ] Relations tested (include statements)
- [ ] Test queries work correctly

## 🚨 Important Notes

1. **Cascade Deletes**: 
   - Deleting a `Phase` will cascade delete all `Month` records
   - Deleting a `Month` will cascade delete all `Deliverable` and `Metric` records

2. **Timestamps**:
   - `createdAt` is auto-set on create
   - `updatedAt` is auto-updated on update (no need to set manually)

3. **Nullable Fields**: 
   - All fields except `id` are nullable by default
   - Adjust `?` markers if you need required fields

4. **Table Names**: 
   - Prisma uses camelCase model names (`User`, `Submission`)
   - Database uses snake_case table names (`users`, `submissions`)
   - `@@map` directives handle the mapping

## 📚 Next Steps

1. **Apply migration** (SQL file or Prisma migrate)
2. **Generate client** (`npx prisma generate`)
3. **Find and update** all Drizzle query files
4. **Test queries** to ensure they work
5. **Remove Drizzle dependencies** from package.json (if no longer needed)

---

**Migration SQL Location:** `prisma/migrations/20250123000000_drizzle_to_prisma/migration.sql`  
**Schema File:** `prisma/schema.prisma` (lines 96-189)
