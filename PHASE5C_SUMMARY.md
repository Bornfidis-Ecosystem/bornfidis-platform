# Phase 5C: Chef Assignment & Earnings Engine

## Overview

Phase 5C completes the chef assignment and earnings system with a simplified `booking_chefs` table, interactive payout slider, automatic payout recalculation, and a comprehensive chef dashboard. This provides a streamlined workflow for assigning chefs to bookings and managing payouts.

## What Was Built

### 1. Database Schema

**File:** `supabase/migration-phase5c-chef-assignment-earnings.sql`

**New Table: `booking_chefs`**
- Simplified chef assignment tracking
- `payout_percentage` - Customizable split (default 70%)
- `payout_amount_cents` - Calculated payout amount
- `status` - assigned | completed | paid
- `stripe_transfer_id` - Transfer tracking
- UNIQUE constraint on `booking_id` (one chef per booking)

**Key Features:**
- Cleaner structure than `booking_assignments`
- Direct payout amount storage
- Status tracking for assignment lifecycle

### 2. Admin Booking Detail - Assign Chef Section

**File:** `app/admin/bookings/[id]/BookingDetailClient.tsx` (updated)

**Features:**
- **Chef Selection Dropdown** - Lists all active/approved chefs
- **Payout Split Slider** - Interactive slider (0-100%) with real-time calculation
  - Default: 70% chef / 30% platform
  - Visual feedback with green/gold colors
  - Live calculation of payout amounts
- **Assignment Management:**
  - Assign new chef
  - Update payout percentage
  - Remove assignment
- **Payout Preview** - Shows breakdown:
  - Booking Total
  - Chef Payout (with percentage)
  - Platform Fee (with percentage)

**API Routes:**
- `POST /api/admin/bookings/[id]/assign-chef-v2` - Assign with custom payout %
- `GET /api/admin/bookings/[id]/booking-chef` - Get assignment
- `PATCH /api/admin/bookings/[id]/booking-chef` - Update payout %
- `DELETE /api/admin/bookings/[id]/booking-chef` - Remove assignment

### 3. Auto-Calculate Payout on Quote Changes

**File:** `app/admin/bookings/actions.ts` (updated)

**Functions Enhanced:**
- `updateBookingQuote()` - Auto-recalculates chef payout when quote total changes
- `updateQuoteSummary()` - Auto-recalculates chef payout when totals change

**Behavior:**
- When quote total changes, system checks if chef is assigned
- If assigned, recalculates `payout_amount_cents` based on stored `payout_percentage`
- Updates both `booking_chefs` and `booking_inquiries` tables
- Maintains consistency across all quote updates

### 4. Enhanced Stripe Payout Automation

**File:** `lib/payout-engine.ts` (updated)

**Improvements:**
- Uses `booking_chefs` table as primary source
- Checks `booking_chefs.status` for idempotency
- Updates `booking_chefs` when payout completes
- Maintains backward compatibility with `booking_inquiries` fields

**Flow:**
1. Check `booking_chefs` for assignment
2. Verify booking is fully paid
3. Check chef eligibility (Connect status, payouts enabled)
4. Create `chef_payouts` ledger entry
5. Create Stripe transfer
6. Update `booking_chefs.status = 'paid'`
7. Update `booking_inquiries` for backward compatibility

### 5. Chef Dashboard

**Files:**
- `app/chef/dashboard/[token]/page.tsx` - Server component
- `app/chef/dashboard/[token]/ChefDashboardClient.tsx` - Client component

**Features:**
- **Token-Based Access** - Uses `chef_portal_token` (same as portal)
- **Stripe Account Status** - Shows Connect status and payouts enabled
- **Earnings Summary:**
  - Total Paid Out
  - Pending Payouts
  - Upcoming Bookings Value
- **Upcoming Bookings** - List of future events with:
  - Event details (name, date, location, guests)
  - Booking total
  - Chef payout amount
  - Assignment status
- **Completed Bookings** - Past events with:
  - Same details as upcoming
  - Payment status
  - Paid date (if paid)

**Styling:**
- Forest green (#1a5f3f) + Gold (#FFBC00) branding
- Clean, professional layout
- Responsive tables
- Status badges

### 6. Type Definitions

**File:** `types/booking-chef.ts`

**New Types:**
- `BookingChefStatus` - assigned | completed | paid
- `BookingChef` - Complete interface for booking_chefs records

## Database Migration

**To apply migration:**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase5c-chef-assignment-earnings.sql`
3. Run the migration
4. Verify table created:
   ```sql
   SELECT * FROM booking_chefs LIMIT 1;
   ```

## API Routes

### Admin Routes (Require Authentication)

#### `POST /api/admin/bookings/[id]/assign-chef-v2`
Assign chef with custom payout percentage.

**Request:**
```json
{
  "chef_id": "uuid",
  "payout_percentage": 70,
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "booking_chef": {
    "id": "uuid",
    "payout_percentage": 70,
    "payout_amount_cents": 7000,
    "platform_fee_cents": 3000
  }
}
```

#### `GET /api/admin/bookings/[id]/booking-chef`
Get current chef assignment.

#### `PATCH /api/admin/bookings/[id]/booking-chef`
Update payout percentage or notes.

**Request:**
```json
{
  "payout_percentage": 75,
  "notes": "Updated notes"
}
```

#### `DELETE /api/admin/bookings/[id]/booking-chef`
Remove chef assignment.

## Workflow

### 1. Assign Chef to Booking

1. Admin navigates to booking detail page
2. Scrolls to "Chef Assignment & Payout" section
3. Selects chef from dropdown
4. Adjusts payout slider (default 70%)
5. Views real-time payout calculation
6. Clicks "Assign Chef"
7. System creates `booking_chefs` record
8. Payout amount calculated and stored

### 2. Quote Changes Auto-Recalculate Payout

1. Admin updates quote (line items, totals)
2. System checks if chef is assigned
3. If assigned, recalculates payout:
   - `payout_amount_cents = quote_total_cents * payout_percentage / 100`
4. Updates `booking_chefs.payout_amount_cents`
5. Updates `booking_inquiries.chef_payout_amount_cents`

### 3. Automatic Payout on Balance Payment

1. Customer completes balance payment
2. Webhook: `checkout.session.completed`
3. System marks booking `fully_paid_at`
4. **Automatically triggers payout:**
   - Checks `booking_chefs` for assignment
   - Validates chef eligibility
   - Creates Stripe transfer
   - Updates `booking_chefs.status = 'paid'`
   - Updates `chef_payouts` ledger

### 4. Chef Views Dashboard

1. Chef receives portal token (from admin)
2. Visits `/chef/dashboard/[token]`
3. Views:
   - Stripe Connect status
   - Earnings summary
   - Upcoming bookings
   - Completed bookings with payout status

## Testing Checklist

### 1. Chef Assignment

- [ ] Navigate to booking detail page
- [ ] Select chef from dropdown
- [ ] Adjust payout slider (try different percentages)
- [ ] Verify payout calculation updates in real-time
- [ ] Click "Assign Chef"
- [ ] Verify assignment created in database
- [ ] Check `booking_chefs` table: `SELECT * FROM booking_chefs WHERE booking_id = '...'`

### 2. Auto-Recalculate Payout

- [ ] Assign chef to booking
- [ ] Update quote total (add/remove line items)
- [ ] Save quote
- [ ] Verify payout amount recalculated:
  ```sql
  SELECT payout_amount_cents, payout_percentage 
  FROM booking_chefs 
  WHERE booking_id = '...';
  ```
- [ ] Verify calculation: `payout_amount_cents = quote_total_cents * payout_percentage / 100`

### 3. Update Payout Percentage

- [ ] With chef assigned, adjust slider
- [ ] Click "Update Payout Split"
- [ ] Verify `payout_percentage` updated in database
- [ ] Verify `payout_amount_cents` recalculated

### 4. Automatic Payout

- [ ] Assign chef to booking
- [ ] Complete balance payment
- [ ] Verify webhook processes payment
- [ ] Verify payout triggered automatically
- [ ] Check `booking_chefs.status = 'paid'`
- [ ] Check `chef_payouts` entry created
- [ ] Check Stripe transfer created
- [ ] Verify `stripe_transfer_id` stored

### 5. Chef Dashboard

- [ ] Get chef portal token:
  ```sql
  SELECT chef_portal_token FROM chefs WHERE id = '...';
  ```
- [ ] Visit `/chef/dashboard/[token]`
- [ ] Verify Stripe status displayed
- [ ] Verify earnings summary
- [ ] Verify upcoming bookings list
- [ ] Verify completed bookings list
- [ ] Check payout amounts are correct

### 6. Remove Assignment

- [ ] With chef assigned, click "Remove"
- [ ] Confirm removal
- [ ] Verify `booking_chefs` record deleted
- [ ] Verify `booking_inquiries.assigned_chef_id` cleared

## Files Created

1. `supabase/migration-phase5c-chef-assignment-earnings.sql` - Database migration
2. `types/booking-chef.ts` - TypeScript types
3. `app/api/admin/bookings/[id]/assign-chef-v2/route.ts` - Assign chef API
4. `app/api/admin/bookings/[id]/booking-chef/route.ts` - Get/Update/Delete assignment API
5. `app/chef/dashboard/[token]/page.tsx` - Chef dashboard page
6. `app/chef/dashboard/[token]/ChefDashboardClient.tsx` - Chef dashboard client
7. `PHASE5C_SUMMARY.md` - This documentation

## Files Modified

1. `app/admin/bookings/[id]/BookingDetailClient.tsx` - Added payout slider and Phase 5C assignment UI
2. `app/admin/bookings/actions.ts` - Added auto-calculate payout in `updateBookingQuote` and `updateQuoteSummary`
3. `lib/payout-engine.ts` - Updated to use `booking_chefs` table

## Key Improvements Over Phase 5B

1. **Simplified Table Structure** - `booking_chefs` is cleaner than `booking_assignments`
2. **Interactive Payout Slider** - Visual, real-time payout adjustment
3. **Auto-Recalculate** - Payout updates automatically when quote changes
4. **Better Status Tracking** - Clear status flow: assigned → completed → paid
5. **Chef Dashboard** - Dedicated dashboard for chefs to view earnings

## Payout Calculation Logic

**When Quote Changes:**
```typescript
if (bookingChef exists) {
  payout_amount_cents = quote_total_cents * bookingChef.payout_percentage / 100
  update booking_chefs.payout_amount_cents
  update booking_inquiries.chef_payout_amount_cents
}
```

**When Assigning Chef:**
```typescript
payout_amount_cents = quote_total_cents * payout_percentage / 100
create booking_chefs record with calculated amount
```

## Security Notes

- All admin routes require authentication
- Chef dashboard uses secure token-based access
- Payout calculations are server-side only
- Idempotency prevents duplicate payouts
- UNIQUE constraint prevents multiple chef assignments

## Troubleshooting

### Payout Not Auto-Recalculating

**Problem:** Quote changes but payout amount doesn't update

**Solution:**
1. Verify `booking_chefs` record exists: `SELECT * FROM booking_chefs WHERE booking_id = '...'`
2. Check server logs for errors in `updateBookingQuote`
3. Verify quote total is being updated correctly

### Slider Not Working

**Problem:** Payout slider doesn't update amounts

**Solution:**
1. Check browser console for JavaScript errors
2. Verify `bookingTotalCents > 0`
3. Check React state updates

### Chef Dashboard Not Loading

**Problem:** Dashboard shows "Invalid Link"

**Solution:**
1. Verify token is correct: `SELECT chef_portal_token FROM chefs WHERE id = '...'`
2. Check token matches URL: `/chef/dashboard/[token]`
3. Verify chef exists in database

## Next Steps (Future Enhancements)

1. **Multi-Chef Assignments** - Support multiple chefs per booking
2. **Payout Scheduling** - Batch payouts weekly/monthly
3. **Earnings Reports** - Detailed PDF reports for chefs
4. **Tax Documentation** - Generate 1099 forms
5. **Payout Notifications** - Email chefs when payout completes
6. **Availability Integration** - Check chef availability before assignment

## Support

For issues:
1. Check server logs for detailed errors
2. Verify database migration was applied
3. Check `booking_chefs` table for assignment records
4. Verify Stripe Connect is enabled
5. Review this documentation for troubleshooting steps
