# Update Remaining Admin Routes

## Quick Update Script

To update all remaining admin routes, use this pattern:

### Find and Replace Pattern

**Find:**
```typescript
import { requireAuth } from '@/lib/auth'
```

**Replace:**
```typescript
import { requireAdmin } from '@/lib/requireAdmin'
```

**Find:**
```typescript
    await requireAuth()
```

**Replace:**
```typescript
    // Check admin access
    const authError = await requireAdmin(request)
    if (authError) return authError
```

---

## Files to Update

All files in `app/api/admin/**/route.ts` that use `requireAuth()` should be updated to use `requireAdmin(request)`.

### Example Update

**Before:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    // ... rest of code
  } catch (error) {
    // ...
  }
}
```

**After:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const authError = await requireAdmin(request)
    if (authError) return authError
    
    // ... rest of code
  } catch (error) {
    // ...
  }
}
```

---

## Benefits

1. ✅ Consistent admin protection across all routes
2. ✅ Proper role checking (not just email)
3. ✅ Clear error messages (401 vs 403)
4. ✅ Non-throwing (better error handling)

---

## Testing

After updating routes, test:
1. Unauthenticated request → 401
2. Authenticated non-admin → 403
3. Authenticated admin → 200
