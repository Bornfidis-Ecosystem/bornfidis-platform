# ✅ Chef-Farmer Matching Foundation

## Overview

Foundation for chef-farmer matching system that allows chefs to post their ingredient needs, which can later be matched with farmers' available crops.

## Implementation

### 1. ✅ Prisma Model: ChefNeed

**Location:** `prisma/schema.prisma`

**Fields:**
- `id`: UUID (primary key)
- `chefId`: String (foreign key to chefs table)
- `crop`: String (crop name, e.g., "tomatoes", "onions")
- `quantity`: Float (required quantity)
- `frequency`: String (delivery frequency: "weekly", "biweekly", "monthly", "custom")
- `startDate`: Date (when need starts)
- `endDate`: Date? (optional, when need ends)
- `createdAt`: DateTime (auto-generated)
- `updatedAt`: DateTime (auto-updated)

**Model Definition:**
```prisma
model ChefNeed {
  id        String   @id @default(uuid())
  chefId    String   @map("chef_id")
  crop      String
  quantity  Float
  frequency String
  startDate DateTime @map("start_date") @db.Date
  endDate   DateTime? @map("end_date") @db.Date
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("chef_needs")
  @@schema("public")
}
```

### 2. ✅ Chef Authentication Helper

**Location:** `lib/chef-auth.ts`

**Functions:**
- `getAuthenticatedChef()`: Verifies chef authentication via Supabase Auth
  - Checks if user is authenticated
  - Verifies user email matches a chef in the database
  - Ensures chef status is "approved" or "active"
  - Returns `{ chefId: string }` or `null`

- `requireChefAuth(request)`: API route guard
  - Returns `NextResponse` error if not authenticated
  - Returns `null` if authenticated (allows route to proceed)

**Authentication Flow:**
1. Get authenticated user from Supabase Auth
2. Query chefs table by user email
3. Verify chef exists and is approved/active
4. Return chef ID for use in API routes

### 3. ✅ API Routes

#### POST /api/chef/needs

**Purpose:** Create a new chef need

**Authentication:** Required (chef must be authenticated)

**Request Body:**
```json
{
  "crop": "tomatoes",
  "quantity": 10.5,
  "frequency": "weekly",
  "startDate": "2026-02-01",
  "endDate": "2026-12-31" // optional
}
```

**Validation:**
- `crop`: Required, min 1 character
- `quantity`: Required, must be positive number
- `frequency`: Required, must be one of: "weekly", "biweekly", "monthly", "custom"
- `startDate`: Required, must be today or in the future (YYYY-MM-DD format)
- `endDate`: Optional, must be after startDate if provided

**Response (Success):**
```json
{
  "success": true,
  "chefNeed": {
    "id": "uuid",
    "chefId": "chef-uuid",
    "crop": "tomatoes",
    "quantity": 10.5,
    "frequency": "weekly",
    "startDate": "2026-02-01",
    "endDate": "2026-12-31",
    "createdAt": "2026-01-23T10:00:00Z",
    "updatedAt": "2026-01-23T10:00:00Z"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "quantity",
      "message": "Quantity must be positive"
    }
  ]
}
```

#### GET /api/chef/needs

**Purpose:** Get all needs for the authenticated chef

**Authentication:** Required (chef must be authenticated)

**Query Parameters:**
- `activeOnly` (optional): If "true", only returns needs that are currently active (startDate <= today AND (endDate is null OR endDate >= today))
- `crop` (optional): Filter by crop name (case-insensitive partial match)

**Response (Success):**
```json
{
  "success": true,
  "chefNeeds": [
    {
      "id": "uuid",
      "chefId": "chef-uuid",
      "crop": "tomatoes",
      "quantity": 10.5,
      "frequency": "weekly",
      "startDate": "2026-02-01",
      "endDate": "2026-12-31",
      "createdAt": "2026-01-23T10:00:00Z",
      "updatedAt": "2026-01-23T10:00:00Z"
    }
  ]
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Authentication required. Please log in as a chef."
}
```

---

## Security

✅ **Authentication Required:**
- All routes require chef authentication via Supabase Auth
- Chef must be approved/active to access routes
- Chef can only create/view their own needs

✅ **Input Validation:**
- Zod schema validation for all inputs
- Date validation (startDate must be future, endDate must be after startDate)
- Quantity must be positive
- Frequency must be from allowed enum values

✅ **Data Isolation:**
- Chefs can only see their own needs
- `chefId` is automatically set from authenticated chef
- No way to create needs for other chefs

---

## Database Migration

**Next Steps:**
1. Run `npx prisma generate` to generate Prisma Client with new model
2. Run `npx prisma db push` to sync schema to database (or create migration)

**SQL Equivalent:**
```sql
CREATE TABLE chef_needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id TEXT NOT NULL,
  crop TEXT NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chef_needs_chef_id ON chef_needs(chef_id);
CREATE INDEX idx_chef_needs_crop ON chef_needs(crop);
CREATE INDEX idx_chef_needs_dates ON chef_needs(start_date, end_date);
```

---

## Usage Examples

### Create a Chef Need

```typescript
const response = await fetch('/api/chef/needs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Supabase Auth token automatically included via cookies
  },
  body: JSON.stringify({
    crop: 'tomatoes',
    quantity: 20,
    frequency: 'weekly',
    startDate: '2026-02-01',
    endDate: '2026-12-31',
  }),
})

const data = await response.json()
if (data.success) {
  console.log('Chef need created:', data.chefNeed)
}
```

### Get All Chef Needs

```typescript
const response = await fetch('/api/chef/needs')
const data = await response.json()
if (data.success) {
  console.log('Chef needs:', data.chefNeeds)
}
```

### Get Active Needs Only

```typescript
const response = await fetch('/api/chef/needs?activeOnly=true')
const data = await response.json()
if (data.success) {
  console.log('Active needs:', data.chefNeeds)
}
```

### Filter by Crop

```typescript
const response = await fetch('/api/chef/needs?crop=tomato')
const data = await response.json()
if (data.success) {
  console.log('Tomato needs:', data.chefNeeds)
}
```

---

## Future Enhancements

1. **Matching Algorithm:**
   - Match chef needs with farmer crops
   - Consider location, quantity, timing
   - Create match suggestions

2. **Additional Fields:**
   - `location`: Where chef needs delivery
   - `preferredPrice`: Price range chef is willing to pay
   - `notes`: Additional requirements or preferences

3. **Status Management:**
   - `status`: "active", "fulfilled", "cancelled"
   - `fulfilledAt`: When need was fulfilled
   - `matchedFarmerId`: Which farmer fulfilled the need

4. **Notifications:**
   - Notify chefs when farmers have matching crops
   - Notify farmers when chefs post new needs

5. **Admin Dashboard:**
   - View all chef needs
   - Manage matches
   - Analytics and reporting

---

## ✅ Complete!

The chef-farmer matching foundation is now:
- ✅ ChefNeed model added to Prisma schema
- ✅ Chef authentication helper created
- ✅ POST /api/chef/needs route with validation
- ✅ GET /api/chef/needs route with filtering
- ✅ Input validation using Zod
- ✅ Restricted to authenticated chefs only
- ✅ Chefs can only access their own needs

**Next Step:** Run `npx prisma db push` to sync the schema to the database.
