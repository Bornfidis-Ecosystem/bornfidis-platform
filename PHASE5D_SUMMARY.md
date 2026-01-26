# Phase 5D: Completion + Payout Release Guardrails

## Overview

Phase 5D adds critical guardrails to the payout system, ensuring jobs are completed before payouts are released and giving admins control over payout holds. This prevents premature payouts and provides a safety mechanism for dispute resolution.

## What Was Built

### 1. Database Schema Updates

**File:** `supabase/migration-phase5d-completion-payout-guardrails.sql`

**booking_inquiries additions:**
- `job_completed_at` (TIMESTAMP) - When job was marked complete
- `job_completed_by` (TEXT) - 'chef' or 'admin'
- `payout_hold` (BOOLEAN) - Whether payout is on hold
- `payout_hold_reason` (TEXT) - Reason for hold
- `payout_released_at` (TIMESTAMP) - When hold was released

**booking_chefs additions:**
- `payout_status` (TEXT) - 'pending' | 'on_hold' | 'paid' | 'failed'
- `payout_error` (TEXT) - Error message if payout failed
- `transfer_id` (TEXT) - Stripe transfer ID (replaces stripe_transfer_id)

**Indexes:**
- `idx_booking_job_completed_at` - For filtering completed jobs
- `idx_booking_payout_hold` - For filtering held payouts
- `idx_booking_payout_released_at` - For tracking releases
- `idx_booking_chefs_payout_status` - For filtering by payout status

### 2. Chef Portal - Mark Job Complete

**File:** `app/chef/portal/[token]/ChefPortalClient.tsx` (updated)

**Features:**
- "Mark Job Complete" button on each booking card
- Only shows for bookings not yet completed
- Sets `job_completed_at` and `job_completed_by='chef'`
- Shows completion status with date
- Displays "Awaiting Admin" status when chef marks complete

**API Route:**
- `POST /api/chef/portal/[token]/mark-complete` - Chef marks job complete

### 3. Admin Booking Detail - Completion & Hold Controls

**File:** `app/admin/bookings/[id]/BookingDetailClient.tsx` (updated)

**Features:**
- **Job Completion Status:**
  - Shows completion date and who completed it
  - "Confirm Completion" button if chef marked complete
  - Admin can also mark complete directly

- **Payout Hold Controls:**
  - Toggle checkbox to put payout on hold
  - Required reason when enabling hold
  - Shows hold status badge
  - Displays hold reason

- **Release Payout Button:**
  - Only shows when payout is on hold
  - Removes hold and attempts payout
  - Respects all payout eligibility checks

**API Routes:**
- `POST /api/admin/bookings/[id]/confirm-completion` - Admin confirms completion
- `POST /api/admin/bookings/[id]/payout-hold` - Set/remove payout hold
- `POST /api/admin/bookings/[id]/release-payout` - Release hold and trigger payout

### 4. Enhanced Payout Trigger Logic

**File:** `lib/payout-engine.ts` (updated)

**New Checks (in order):**
1. ✅ Chef assigned (existing)
2. ✅ Not already paid (existing)
3. ✅ **Job completed** (`job_completed_at` must be set) - **NEW**
4. ✅ **Payout not on hold** (`payout_hold = false`) - **NEW**
5. ✅ Fully paid (existing)
6. ✅ Chef eligible (existing)

**Payout Flow:**
```
1. Check booking_chefs for assignment
2. Verify not already paid (check transfer_id)
3. Check payout_hold = false
4. Check job_completed_at is set
5. Check fully_paid_at is set
6. Verify chef Stripe Connect status
7. Create chef_payouts ledger entry
8. Create Stripe transfer
9. Update booking_chefs.payout_status = 'paid'
10. Update booking_inquiries
```

### 5. Admin Payouts Page

**Files:**
- `app/admin/payouts/page.tsx` - Server component
- `app/admin/payouts/PayoutsClient.tsx` - Client component

**Features:**
- **Stats Dashboard:**
  - Total payouts
  - Pending count
  - Paid count
  - Failed count
  - Total amount paid out

- **Payouts Table:**
  - Booking name and date
  - Chef name and email
  - Payout amount
  - Status badge (pending/paid/failed)
  - Created date
  - Paid date (if paid)
  - Stripe transfer ID
  - Hold status indicator
  - Job completion indicator

- **Actions:**
  - "Retry" button for failed payouts
  - "View Booking" link for pending payouts
  - Respects idempotency (won't create duplicate transfers)

**Route:** `/admin/payouts`

## Database Migration

**To apply migration:**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase5d-completion-payout-guardrails.sql`
3. Run the migration
4. Verify fields added:
   ```sql
   SELECT job_completed_at, payout_hold, payout_status 
   FROM booking_inquiries 
   LIMIT 1;
   
   SELECT payout_status, transfer_id 
   FROM booking_chefs 
   LIMIT 1;
   ```

## Workflow

### 1. Chef Marks Job Complete

1. Chef logs into portal (`/chef/portal/[token]`)
2. Views assigned bookings
3. Clicks "Mark Job Complete" on completed booking
4. System sets `job_completed_at` and `job_completed_by='chef'`
5. Status shows "Awaiting Admin" confirmation

### 2. Admin Confirms Completion

1. Admin views booking detail page
2. Sees "Job Completion" section
3. If chef marked complete, sees "Confirm Completion" button
4. Clicks to confirm
5. System updates `job_completed_by='admin'` (or sets if not set)

### 3. Admin Puts Payout On Hold

1. Admin views booking detail page
2. Scrolls to "Job Completion & Payout Controls"
3. Checks "Put Payout On Hold" checkbox
4. Enters reason (required)
5. System sets `payout_hold=true` and `payout_hold_reason`
6. Updates `booking_chefs.payout_status='on_hold'`
7. Payout engine will block payout until hold released

### 4. Admin Releases Payout

1. Admin views booking with payout on hold
2. Clicks "Release Payout" button
3. System sets `payout_hold=false`, clears reason
4. Sets `payout_released_at=now()`
5. Updates `booking_chefs.payout_status='pending'`
6. **Automatically triggers payout** if all conditions met:
   - Fully paid
   - Job completed
   - Chef eligible
   - Not already paid

### 5. Automatic Payout (After Release)

1. Balance payment completes → `fully_paid_at` set
2. Webhook triggers payout engine
3. Engine checks:
   - ✅ Job completed? (`job_completed_at`)
   - ✅ Not on hold? (`payout_hold = false`)
   - ✅ Fully paid? (`fully_paid_at`)
   - ✅ Chef eligible?
4. If all pass → Create Stripe transfer
5. Update `booking_chefs.payout_status='paid'`

## API Routes

### Chef Routes (Token-Based)

#### `POST /api/chef/portal/[token]/mark-complete`
Mark job as complete (chef only).

**Request:**
```json
{
  "booking_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job marked as complete",
  "job_completed_at": "2024-01-15T10:30:00Z"
}
```

### Admin Routes (Require Authentication)

#### `POST /api/admin/bookings/[id]/confirm-completion`
Admin confirms job completion.

**Response:**
```json
{
  "success": true,
  "message": "Job completion confirmed",
  "job_completed_at": "2024-01-15T10:30:00Z"
}
```

#### `POST /api/admin/bookings/[id]/payout-hold`
Set or remove payout hold.

**Request:**
```json
{
  "hold": true,
  "reason": "Customer dispute - investigating"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payout put on hold",
  "payout_hold": true,
  "payout_hold_reason": "Customer dispute - investigating"
}
```

#### `POST /api/admin/bookings/[id]/release-payout`
Release payout hold and trigger payout.

**Response:**
```json
{
  "success": true,
  "message": "Payout released and processed",
  "payoutId": "uuid",
  "transferId": "tr_xxx"
}
```

## Testing Checklist

### 1. Chef Marks Job Complete

- [ ] Navigate to chef portal (`/chef/portal/[token]`)
- [ ] View assigned bookings
- [ ] Click "Mark Job Complete" on a booking
- [ ] Verify success message
- [ ] Verify booking shows "Awaiting Admin" status
- [ ] Check database: `SELECT job_completed_at, job_completed_by FROM booking_inquiries WHERE id = '...'`
- [ ] Verify `job_completed_by = 'chef'`

### 2. Admin Confirms Completion

- [ ] Navigate to booking detail page
- [ ] Verify "Job Completion" section shows chef completion
- [ ] Click "Confirm Completion"
- [ ] Verify status updates
- [ ] Check database: `SELECT job_completed_by FROM booking_inquiries WHERE id = '...'`
- [ ] Verify `job_completed_by = 'admin'` (or was already set)

### 3. Payout Hold

- [ ] Navigate to booking detail page
- [ ] Scroll to "Job Completion & Payout Controls"
- [ ] Check "Put Payout On Hold" checkbox
- [ ] Enter reason: "Testing hold functionality"
- [ ] Verify hold is set
- [ ] Check database:
  ```sql
  SELECT payout_hold, payout_hold_reason 
  FROM booking_inquiries 
  WHERE id = '...';
  ```
- [ ] Verify `payout_hold = true`
- [ ] Check `booking_chefs.payout_status = 'on_hold'`

### 4. Payout Blocked by Hold

- [ ] With payout on hold, complete balance payment
- [ ] Verify webhook processes payment
- [ ] Check payout engine logs
- [ ] Verify payout is **blocked** with message: "Payout on hold: [reason]"
- [ ] Check `chef_payouts` table - should not have new entry
- [ ] Check `booking_chefs.payout_status = 'on_hold'`

### 5. Release Payout

- [ ] With payout on hold, click "Release Payout"
- [ ] Confirm release
- [ ] Verify hold is removed
- [ ] Check database: `payout_hold = false`, `payout_released_at` set
- [ ] Verify payout is triggered automatically
- [ ] Check `booking_chefs.payout_status = 'paid'`
- [ ] Check Stripe transfer created

### 6. Payout Blocked by Incomplete Job

- [ ] Assign chef to booking
- [ ] Complete balance payment (fully paid)
- [ ] **Do NOT mark job complete**
- [ ] Verify webhook processes payment
- [ ] Check payout engine logs
- [ ] Verify payout is **blocked** with message: "Job must be completed before payout can be processed"
- [ ] Mark job complete
- [ ] Verify payout is now triggered

### 7. Admin Payouts Page

- [ ] Navigate to `/admin/payouts`
- [ ] Verify stats dashboard shows correct counts
- [ ] Verify payouts table displays all payouts
- [ ] Check status badges are correct
- [ ] For failed payout, click "Retry"
- [ ] Verify retry respects idempotency (won't create duplicate)
- [ ] Verify payout processes if eligible

### 8. Edge Cases

- [ ] **Chef marks complete twice:** Should show "already completed" error
- [ ] **Admin confirms without chef marking:** Should set `job_completed_by='admin'`
- [ ] **Hold without reason:** Should require reason input
- [ ] **Release hold when not eligible:** Should show blockers
- [ ] **Retry failed payout:** Should respect idempotency
- [ ] **Multiple hold/release cycles:** Should work correctly

## Files Created

1. `supabase/migration-phase5d-completion-payout-guardrails.sql` - Database migration
2. `app/api/chef/portal/[token]/mark-complete/route.ts` - Chef mark complete API
3. `app/api/admin/bookings/[id]/confirm-completion/route.ts` - Admin confirm completion API
4. `app/api/admin/bookings/[id]/payout-hold/route.ts` - Payout hold API
5. `app/api/admin/bookings/[id]/release-payout/route.ts` - Release payout API
6. `app/admin/payouts/page.tsx` - Admin payouts page
7. `app/admin/payouts/PayoutsClient.tsx` - Payouts client component
8. `PHASE5D_SUMMARY.md` - This documentation

## Files Modified

1. `types/booking.ts` - Added Phase 5D fields
2. `types/booking-chef.ts` - Added `payout_status`, `payout_error`, `transfer_id`
3. `app/chef/portal/[token]/page.tsx` - Added completion status to booking data
4. `app/chef/portal/[token]/ChefPortalClient.tsx` - Added "Mark Job Complete" button
5. `app/admin/bookings/[id]/BookingDetailClient.tsx` - Added completion and hold controls
6. `lib/payout-engine.ts` - Added completion and hold checks

## Key Improvements

1. **Job Completion Tracking** - Prevents payouts before work is done
2. **Payout Hold System** - Admin control for disputes/issues
3. **Enhanced Status Tracking** - Clear visibility into payout state
4. **Automatic Payout After Release** - Streamlined workflow
5. **Admin Payouts Dashboard** - Centralized payout management
6. **Idempotent Retries** - Safe retry mechanism for failed payouts

## Payout Eligibility Matrix

| Condition | Required | Blocks If Missing |
|-----------|----------|-------------------|
| Chef assigned | ✅ | Yes |
| Fully paid | ✅ | Yes |
| **Job completed** | ✅ | **Yes** |
| **Payout not on hold** | ✅ | **Yes** |
| Chef Stripe connected | ✅ | Yes |
| Chef payouts enabled | ✅ | Yes |
| Not already paid | ✅ | Yes (idempotency) |

## Security Notes

- Chef portal uses token-based authentication
- Admin routes require authentication
- Payout hold can only be set/removed by admins
- Job completion can be set by chef or admin
- All payout operations respect idempotency
- Transfer IDs prevent duplicate payouts

## Troubleshooting

### Payout Not Triggering After Release

**Problem:** Release payout but no transfer created

**Solution:**
1. Check payout engine logs for blockers
2. Verify `job_completed_at` is set
3. Verify `payout_hold = false`
4. Verify `fully_paid_at` is set
5. Check chef Stripe Connect status
6. Verify `transfer_id` is null (not already paid)

### Hold Not Showing in UI

**Problem:** Payout hold set but not visible

**Solution:**
1. Refresh booking detail page
2. Check database: `SELECT payout_hold FROM booking_inquiries WHERE id = '...'`
3. Verify `booking_chefs.payout_status = 'on_hold'`
4. Check browser console for errors

### Retry Creates Duplicate Transfer

**Problem:** Retry button creates duplicate Stripe transfer

**Solution:**
1. Check idempotency logic in payout engine
2. Verify `transfer_id` is checked before creating transfer
3. Check `chef_payouts` table for existing paid record
4. Verify UNIQUE constraint on `booking_id` in `chef_payouts`

## Next Steps (Future Enhancements)

1. **Completion Photos** - Chef uploads photos as proof of completion
2. **Customer Confirmation** - Customer confirms job completion
3. **Automatic Hold Triggers** - Auto-hold on customer complaints
4. **Payout Scheduling** - Batch payouts weekly/monthly
5. **Completion Templates** - Standardized completion checklists
6. **Dispute Resolution** - Built-in dispute workflow

## Support

For issues:
1. Check server logs for detailed errors
2. Verify database migration was applied
3. Check `job_completed_at` and `payout_hold` fields
4. Review payout engine logs for blockers
5. Verify Stripe Connect is enabled
6. Review this documentation for troubleshooting steps
