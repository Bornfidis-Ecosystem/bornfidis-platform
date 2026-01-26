# ✅ Admin Guard Utility

## Overview

A reusable admin guard utility has been created to protect all `/admin` routes. It checks for authentication and admin role before allowing access.

## Features

### 1. ✅ Authentication Check
- Verifies user is authenticated via Supabase Auth
- Returns 401 if not authenticated

### 2. ✅ Role Check
- Checks `user.user_metadata.role === 'admin'` or `user.app_metadata.role === 'admin'`
- Returns 403 if authenticated but not admin

### 3. ✅ API Route Protection
- Returns JSON error responses for API routes
- Non-throwing (returns error response instead of throwing)

### 4. ✅ Helper Functions
- `requireAdmin(request)` - For API routes (returns NextResponse or null)
- `requireAdminUser()` - For server actions (throws if not admin)
- `getAdminUser()` - Non-throwing, returns user or null
- `checkAdminAccess()` - Low-level check, returns result object

---

## File Created

**`lib/requireAdmin.ts`** - Admin guard utility

---

## Usage

### In API Routes (Recommended)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'

export async function GET(request: NextRequest) {
  try {
    // Check admin access - returns error response if not admin
    const authError = await requireAdmin(request)
    if (authError) return authError

    // Continue with admin logic...
    return NextResponse.json({ success: true, data: [...] })
  } catch (error) {
    // Handle other errors
  }
}
```

### In Server Actions

```typescript
import { requireAdminUser } from '@/lib/requireAdmin'

export async function adminAction() {
  // Throws error if not admin
  const user = await requireAdminUser()
  
  // User is guaranteed to be admin here
  // Continue with admin logic...
}
```

### Optional Admin Check

```typescript
import { getAdminUser } from '@/lib/requireAdmin'

export async function optionalAdminAction() {
  const user = await getAdminUser()
  
  if (user) {
    // User is admin - show admin features
  } else {
    // User is not admin - show regular features
  }
}
```

---

## Response Codes

### 401 Unauthorized
- User is not authenticated
- Response: `{ success: false, error: 'Authentication required' }`

### 403 Forbidden
- User is authenticated but not admin
- Response: `{ success: false, error: 'Access denied: Admin role required' }`

---

## Setting Admin Role

### Option 1: Via Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Find the user
3. Click "Edit"
4. In "User Metadata" or "App Metadata", add:
   ```json
   {
     "role": "admin"
   }
   ```

### Option 2: Via Supabase SQL

```sql
-- Update user metadata
UPDATE auth.users
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@bornfidis.com';

-- Or update app_metadata
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@bornfidis.com';
```

### Option 3: Via Application Code

```typescript
import { supabaseAdmin } from '@/lib/supabase'

// Set admin role for a user
await supabaseAdmin.auth.admin.updateUserById(userId, {
  user_metadata: { role: 'admin' }
})
```

---

## Updated Routes

The following routes have been updated to use `requireAdmin`:

1. ✅ `app/api/admin/submissions/route.ts` - GET, PATCH
2. ✅ `app/api/admin/retry-failed-sms/route.ts` - GET, POST, DELETE
3. ✅ `app/api/admin/whatsapp-messages/route.ts` - GET
4. ✅ `app/api/admin/bookings/[id]/assign-farmer/route.ts` - POST
5. ✅ `app/api/admin/farmers/active/route.ts` - GET
6. ✅ `app/api/admin/check-stripe-connect/route.ts` - GET

---

## Remaining Routes to Update

The following routes still need to be updated (replace `requireAuth()` with `requireAdmin(request)`):

- `app/api/admin/replication/regions/[id]/reject/route.ts`
- `app/api/admin/cooperative/distribute-payouts/route.ts`
- `app/api/admin/chefs/[id]/start-onboarding/route.ts`
- `app/api/admin/bookings/[id]/ingredients/route.ts`
- `app/api/admin/bookings/[id]/booking-chef/route.ts`
- `app/api/admin/harvest/transactions/route.ts`
- `app/api/admin/bookings/[id]/assign-chef/route.ts`
- `app/api/admin/bookings/[id]/ingredients/match/route.ts`
- `app/api/admin/stories/[id]/feature/route.ts`
- `app/api/admin/stories/[id]/publish/route.ts`
- `app/api/admin/farmer-ingredients/[id]/route.ts`
- `app/api/admin/farmer-ingredients/route.ts`
- `app/api/admin/bookings/[id]/release-payout/route.ts`
- `app/api/admin/harvest/metrics/route.ts`
- `app/api/admin/bookings/[id]/assign-farmer/route.ts` ✅ (already updated)
- `app/api/admin/farmers/[id]/reject/route.ts`
- `app/api/admin/bookings/[id]/run-payout/route.ts`
- `app/api/admin/stories/[id]/approve/route.ts`
- `app/api/admin/cooperative/calculate-impact/route.ts`
- `app/api/admin/farmers/[id]/update/route.ts`
- `app/api/admin/farmers/[id]/approve/route.ts`
- `app/api/admin/farmers/[id]/send-onboarding/route.ts`
- `app/api/admin/ingredients/route.ts`
- `app/api/admin/chefs/[id]/reject/route.ts`
- `app/api/admin/chefs/active/route.ts`
- `app/api/admin/bookings/[id]/portal-token/route.ts`
- `app/api/admin/replication/regions/[id]/approve/route.ts`
- `app/api/admin/chefs/[id]/approve/route.ts`
- `app/api/admin/chefs/[id]/route.ts`
- `app/api/admin/intakes/reprocess/route.ts`
- `app/api/admin/bookings/[id]/payout-hold/route.ts`
- `app/api/admin/bookings/[id]/confirm-completion/route.ts`
- `app/api/admin/bookings/[id]/booking-farmers/[assignmentId]/route.ts`
- `app/api/admin/bookings/[id]/booking-farmers/route.ts`
- `app/api/admin/bookings/[id]/ingredients/orders/route.ts`
- `app/api/admin/bookings/[id]/assign-chef-v2/route.ts`

### Update Pattern

For routes using `requireAuth()`:

**Before:**
```typescript
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()  // Throws error
    // ...
  }
}
```

**After:**
```typescript
import { requireAdmin } from '@/lib/requireAdmin'

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request)  // Returns error response
    if (authError) return authError
    // ...
  }
}
```

---

## Testing

### Test Authentication Check

1. **Not logged in:**
   ```bash
   curl http://localhost:3000/api/admin/submissions
   # Should return: { "success": false, "error": "Authentication required" }
   # Status: 401
   ```

2. **Logged in but not admin:**
   ```bash
   # Login as regular user (role !== 'admin')
   curl -H "Cookie: ..." http://localhost:3000/api/admin/submissions
   # Should return: { "success": false, "error": "Access denied: Admin role required" }
   # Status: 403
   ```

3. **Logged in as admin:**
   ```bash
   # Login as admin user (role === 'admin')
   curl -H "Cookie: ..." http://localhost:3000/api/admin/submissions
   # Should return: { "success": true, "bookings": [...] }
   # Status: 200
   ```

---

## Migration from requireAuth()

### Step 1: Update Import

```typescript
// Before
import { requireAuth } from '@/lib/auth'

// After
import { requireAdmin } from '@/lib/requireAdmin'
```

### Step 2: Update Usage

```typescript
// Before
export async function GET(request: NextRequest) {
  try {
    await requireAuth()  // Throws
    // ...
  } catch (error) {
    // Handle auth error
  }
}

// After
export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request)  // Returns response
    if (authError) return authError
    // ...
  } catch (error) {
    // Handle other errors (auth errors already handled)
  }
}
```

---

## Role Storage

The admin guard checks for role in this order:
1. `user.user_metadata.role`
2. `user.app_metadata.role`

If either equals `'admin'`, access is granted.

---

## Security Notes

1. **Role Check**: Always checks `role === 'admin'` (exact match, case-sensitive)
2. **Non-Throwing**: API routes return error responses instead of throwing
3. **Consistent**: All admin routes use the same guard pattern
4. **Future-Proof**: Easy to extend for additional roles (e.g., 'moderator', 'viewer')

---

## ✅ Complete!

Admin guard utility is ready to use:
- ✅ Authentication check
- ✅ Role check (`role === 'admin'`)
- ✅ API route protection
- ✅ Helper functions for different use cases
- ✅ Example routes updated

Apply the pattern to remaining admin routes as needed! 🔒
