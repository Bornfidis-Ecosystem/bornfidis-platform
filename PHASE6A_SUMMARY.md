# Phase 6A: Island Harvest Hub – Farmer & Producer Network

## Overview

Phase 6A extends the Bornfidis Provisions platform to include a regenerative supplier network. Farmers and producers can apply to join, get approved by admins, onboard with Stripe Connect, and receive payouts when bookings are completed. This creates a complete supply chain ecosystem that supports local regenerative agriculture.

## What Was Built

### 1. Database Schema

**File:** `supabase/migration-phase6a-farmer-network.sql`

**New Table: `farmers`**
- Basic info: name, email, phone, location, parish, country
- Regenerative practices description
- Products: crops, proteins, processing capabilities (arrays)
- Certifications array
- Status: pending | approved | inactive
- Stripe Connect integration (same pattern as chefs)
- Portal token for secure access
- Default payout percentage: 60%

**New Table: `booking_farmers`**
- Many-to-many relationship with bookings
- Role-based assignment: produce, fish, meat, dairy, spice, beverage
- Payout configuration per assignment
- Payout status tracking: pending | on_hold | paid | failed
- Transfer ID for Stripe tracking
- UNIQUE constraint: (booking_id, farmer_id, role) - allows multiple roles per farmer

**Key Features:**
- Supports multiple farmers per booking
- Each farmer can have different roles
- Independent payout tracking per assignment
- Same Stripe Connect pattern as chefs

### 2. Public Farmer Application Form

**Files:**
- `app/farm/apply/page.tsx` - Application page
- `app/farm/apply/FarmerApplicationForm.tsx` - Form component
- `app/farm/apply/thank-you/page.tsx` - Thank you page
- `app/api/farm/apply/route.ts` - Application submission API

**Features:**
- **Island Harvest Hub Branding** - Forest green (#1a5f3f) + Gold (#FFBC00)
- **Comprehensive Form:**
  - Basic information (name, email, phone, location)
  - Regenerative practices description
  - Products arrays (crops, proteins, processing capabilities)
  - Certifications array
  - Social links (website, Instagram)
- **Dynamic Array Inputs** - Press Enter to add items, click × to remove
- **Validation** - Zod schema validation
- **Thank You Page** - Confirmation with scripture

**Route:** `/farm/apply`

### 3. Admin Farmers Management

**Files:**
- `app/admin/farmers/page.tsx` - Admin farmers list page
- `app/admin/farmers/FarmerListClient.tsx` - Client component
- `app/admin/farmers/actions.ts` - Server actions

**Features:**
- **List All Farmers** - Table view with status, location, Stripe status
- **Approve/Reject** - Admin actions for pending applications
- **Stripe Connect Integration:**
  - Auto-creates Stripe Express account on approval
  - Shows onboarding status
  - "Send Onboarding" button for approved farmers
- **Status Badges:**
  - Pending (yellow)
  - Approved (blue)
  - Connected (green)
  - Onboarding Required (orange)
  - Inactive (gray)

**API Routes:**
- `POST /api/admin/farmers/[id]/approve` - Approve farmer + create Stripe account
- `POST /api/admin/farmers/[id]/reject` - Reject application
- `POST /api/admin/farmers/[id]/send-onboarding` - Send onboarding link
- `GET /api/admin/farmers/active` - Get active farmers for dropdowns

**Route:** `/admin/farmers`

### 4. Booking Integration - Farmer Assignment

**File:** `app/admin/bookings/[id]/BookingDetailClient.tsx` (updated)

**Features:**
- **Assign Farmers Section:**
  - Dropdown to select farmer
  - Role selector (produce, fish, meat, dairy, spice, beverage)
  - Payout percentage slider (0-100%, default 60%)
  - Real-time payout calculation
  - Assignment notes
- **Assigned Farmers List:**
  - Shows all assigned farmers with roles
  - Displays payout amount and percentage
  - Shows payout status (pending/paid/on_hold/failed)
  - Remove button for each assignment
- **Multiple Assignments:**
  - Can assign multiple farmers to one booking
  - Each farmer can have different roles
  - Independent payout tracking per assignment

**API Routes:**
- `POST /api/admin/bookings/[id]/assign-farmer` - Assign farmer with role and payout %
- `GET /api/admin/bookings/[id]/booking-farmers` - Get all assigned farmers
- `DELETE /api/admin/bookings/[id]/booking-farmers/[id]` - Remove assignment

### 5. Auto-Calculate Farmer Payouts

**File:** `app/admin/bookings/actions.ts` (updated)

**Functions Enhanced:**
- `updateBookingQuote()` - Auto-recalculates farmer payouts when quote total changes
- `updateQuoteSummary()` - Auto-recalculates farmer payouts when totals change

**Behavior:**
- When quote total changes, system checks for assigned farmers
- Recalculates `payout_amount_cents` for each farmer based on stored `payout_percent`
- Updates all `booking_farmers` records
- Maintains consistency across all quote updates

### 6. Farmer Payout Engine

**File:** `lib/farmer-payout-engine.ts`

**Functions:**
- `tryPayoutForBookingFarmer(bookingFarmerId)` - Process payout for single farmer assignment
- `tryPayoutsForBooking(bookingId)` - Process payouts for all farmers on a booking

**Payout Eligibility Checks:**
1. ✅ Farmer assigned
2. ✅ Not already paid (idempotency)
3. ✅ Payout not on hold
4. ✅ Job completed (`job_completed_at`)
5. ✅ Booking payout not on hold (`payout_hold = false`)
6. ✅ Fully paid (`fully_paid_at`)
7. ✅ Farmer Stripe Connect connected
8. ✅ Farmer payouts enabled

**Flow:**
```
1. Check booking_farmers for assignment
2. Verify not already paid (check transfer_id)
3. Check payout_status != 'on_hold'
4. Check booking.job_completed_at
5. Check booking.payout_hold = false
6. Check booking.fully_paid_at
7. Verify farmer Stripe Connect status
8. Create Stripe transfer
9. Update booking_farmers.payout_status = 'paid'
```

### 7. Webhook Integration

**File:** `app/api/stripe/webhook/route.ts` (updated)

**Enhancement:**
- After balance payment completes and chef payout is triggered
- **Also triggers farmer payouts** for all assigned farmers
- Processes all eligible farmer assignments in parallel
- Logs success/failure for each farmer payout

## Database Migration

**To apply migration:**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase6a-farmer-network.sql`
3. Run the migration
4. Verify tables created:
   ```sql
   SELECT * FROM farmers LIMIT 1;
   SELECT * FROM booking_farmers LIMIT 1;
   ```

## Workflow

### 1. Farmer Applies

1. Farmer visits `/farm/apply`
2. Fills out application form:
   - Basic information
   - Regenerative practices description
   - Products (crops, proteins, processing)
   - Certifications
3. Submits application
4. System creates `farmers` record with `status='pending'`

### 2. Admin Approves Farmer

1. Admin navigates to `/admin/farmers`
2. Views pending applications
3. Clicks "Approve" on farmer
4. System:
   - Sets `status='approved'`
   - Creates Stripe Express account
   - Generates onboarding link
   - Sets `stripe_connect_status='pending'`

### 3. Farmer Onboards with Stripe

1. Admin sends onboarding link to farmer
2. Farmer completes Stripe Express onboarding
3. Webhook `account.updated` updates:
   - `stripe_connect_status='connected'`
   - `payouts_enabled=true`
   - `stripe_onboarded_at=now()`

### 4. Admin Assigns Farmers to Booking

1. Admin navigates to booking detail page
2. Scrolls to "Assign Farmers & Producers" section
3. Selects farmer from dropdown
4. Chooses role (produce, fish, meat, etc.)
5. Adjusts payout slider (default 60%)
6. Views real-time payout calculation
7. Clicks "Assign Farmer"
8. System creates `booking_farmers` record
9. Can assign multiple farmers with different roles

### 5. Quote Changes Auto-Recalculate Payouts

1. Admin updates quote (line items, totals)
2. System checks for assigned farmers
3. Recalculates payout for each farmer:
   - `payout_amount_cents = quote_total_cents * payout_percent / 100`
4. Updates all `booking_farmers` records

### 6. Automatic Farmer Payouts

1. Customer completes balance payment
2. Webhook: `checkout.session.completed`
3. System marks booking `fully_paid_at`
4. **Automatically triggers:**
   - Chef payout (if assigned)
   - **Farmer payouts** (for all assigned farmers)
5. For each farmer:
   - Checks eligibility (completion, hold, Stripe status)
   - Creates Stripe transfer
   - Updates `booking_farmers.payout_status='paid'`

## API Routes

### Public Routes

#### `POST /api/farm/apply`
Submit farmer application.

**Request:**
```json
{
  "name": "Green Valley Farm",
  "email": "farmer@example.com",
  "phone": "876-123-4567",
  "location": "St. Elizabeth, Jamaica",
  "parish": "St. Elizabeth",
  "country": "Jamaica",
  "regenerative_practices": "We use organic methods...",
  "crops": ["Tomatoes", "Callaloo"],
  "proteins": ["Goat"],
  "certifications": ["Organic"]
}
```

### Admin Routes (Require Authentication)

#### `POST /api/admin/farmers/[id]/approve`
Approve farmer and create Stripe account.

**Response:**
```json
{
  "success": true,
  "message": "Farmer approved successfully",
  "onboarding_url": "https://connect.stripe.com/..."
}
```

#### `POST /api/admin/bookings/[id]/assign-farmer`
Assign farmer to booking.

**Request:**
```json
{
  "farmer_id": "uuid",
  "role": "produce",
  "payout_percent": 60,
  "notes": "Local organic produce"
}
```

**Response:**
```json
{
  "success": true,
  "booking_farmer": {
    "id": "uuid",
    "payout_percent": 60,
    "payout_amount_cents": 6000
  }
}
```

## Testing Checklist

### 1. Farmer Application

- [ ] Navigate to `/farm/apply`
- [ ] Fill out application form
- [ ] Add crops, proteins, certifications (press Enter)
- [ ] Submit application
- [ ] Verify redirect to thank you page
- [ ] Check database: `SELECT * FROM farmers WHERE email = '...'`
- [ ] Verify `status = 'pending'`

### 2. Admin Approve Farmer

- [ ] Navigate to `/admin/farmers`
- [ ] View pending farmer application
- [ ] Click "Approve"
- [ ] Verify success message
- [ ] Check database:
  ```sql
  SELECT status, stripe_account_id, stripe_connect_status 
  FROM farmers 
  WHERE id = '...';
  ```
- [ ] Verify `status = 'approved'`, `stripe_account_id` set, `stripe_connect_status = 'pending'`

### 3. Assign Farmers to Booking

- [ ] Navigate to booking detail page
- [ ] Scroll to "Assign Farmers & Producers"
- [ ] Select farmer from dropdown
- [ ] Choose role (e.g., "produce")
- [ ] Adjust payout slider (try different percentages)
- [ ] Verify payout calculation updates
- [ ] Click "Assign Farmer"
- [ ] Verify farmer appears in assigned list
- [ ] Assign second farmer with different role
- [ ] Check database:
  ```sql
  SELECT * FROM booking_farmers WHERE booking_id = '...';
  ```

### 4. Auto-Recalculate Farmer Payouts

- [ ] Assign farmer to booking
- [ ] Update quote total (add/remove line items)
- [ ] Save quote
- [ ] Verify farmer payout recalculated:
  ```sql
  SELECT payout_amount_cents, payout_percent 
  FROM booking_farmers 
  WHERE booking_id = '...';
  ```
- [ ] Verify calculation: `payout_amount_cents = quote_total_cents * payout_percent / 100`

### 5. Automatic Farmer Payouts

- [ ] Assign farmer to booking
- [ ] Mark job complete (chef or admin)
- [ ] Complete balance payment
- [ ] Verify webhook processes payment
- [ ] Check payout engine logs
- [ ] Verify farmer payout triggered automatically
- [ ] Check `booking_farmers.payout_status = 'paid'`
- [ ] Check Stripe transfer created
- [ ] Verify `transfer_id` stored

### 6. Multiple Farmers Per Booking

- [ ] Assign farmer as "produce"
- [ ] Assign different farmer as "fish"
- [ ] Assign same farmer as "spice" (different role)
- [ ] Verify all assignments saved
- [ ] Complete booking payment
- [ ] Verify all eligible farmers receive payouts

### 7. Payout Hold Blocks Farmers

- [ ] Assign farmer to booking
- [ ] Put booking payout on hold
- [ ] Complete balance payment
- [ ] Verify farmer payout is blocked
- [ ] Check `booking_farmers.payout_status = 'on_hold'` or remains 'pending'
- [ ] Release hold
- [ ] Verify farmer payout is triggered

### 8. Edge Cases

- [ ] **Farmer not Stripe connected:** Payout should be blocked
- [ ] **Job not completed:** Payout should be blocked
- [ ] **Multiple roles same farmer:** Should create separate assignments
- [ ] **Remove assignment:** Should delete `booking_farmers` record
- [ ] **Quote total = 0:** Should show error when assigning

## Files Created

1. `supabase/migration-phase6a-farmer-network.sql` - Database migration
2. `types/farmer.ts` - TypeScript types
3. `app/farm/apply/page.tsx` - Application page
4. `app/farm/apply/FarmerApplicationForm.tsx` - Form component
5. `app/farm/apply/thank-you/page.tsx` - Thank you page
6. `app/api/farm/apply/route.ts` - Application API
7. `app/admin/farmers/page.tsx` - Admin farmers page
8. `app/admin/farmers/FarmerListClient.tsx` - Farmers list client
9. `app/admin/farmers/actions.ts` - Server actions
10. `app/api/admin/farmers/[id]/approve/route.ts` - Approve API
11. `app/api/admin/farmers/[id]/reject/route.ts` - Reject API
12. `app/api/admin/farmers/[id]/send-onboarding/route.ts` - Onboarding API
13. `app/api/admin/farmers/active/route.ts` - Active farmers API
14. `app/api/admin/bookings/[id]/assign-farmer/route.ts` - Assign farmer API
15. `app/api/admin/bookings/[id]/booking-farmers/route.ts` - Get/Delete assignments API
16. `lib/farmer-payout-engine.ts` - Farmer payout engine
17. `PHASE6A_SUMMARY.md` - This documentation

## Files Modified

1. `lib/validation.ts` - Added `farmerApplicationSchema`
2. `app/admin/bookings/[id]/BookingDetailClient.tsx` - Added farmer assignment section
3. `app/admin/bookings/actions.ts` - Added auto-calculate farmer payouts
4. `app/api/stripe/webhook/route.ts` - Added farmer payout triggers

## Key Features

1. **Regenerative Focus** - Application form emphasizes regenerative practices
2. **Role-Based Assignment** - Farmers assigned by product type (produce, fish, meat, etc.)
3. **Multiple Assignments** - Multiple farmers can be assigned to one booking
4. **Independent Payouts** - Each farmer assignment has its own payout tracking
5. **Auto-Recalculate** - Payouts update automatically when quote changes
6. **Stripe Connect Integration** - Same pattern as chefs for consistency
7. **Automatic Payouts** - Triggers after booking completion and payment

## Payout Calculation Logic

**When Quote Changes:**
```typescript
for each booking_farmer {
  payout_amount_cents = quote_total_cents * booking_farmer.payout_percent / 100
  update booking_farmers.payout_amount_cents
}
```

**When Assigning Farmer:**
```typescript
payout_amount_cents = quote_total_cents * payout_percent / 100
create booking_farmers record with calculated amount
```

## Farmer Payout Eligibility Matrix

| Condition | Required | Blocks If Missing |
|-----------|----------|-------------------|
| Farmer assigned | ✅ | Yes |
| Fully paid | ✅ | Yes |
| Job completed | ✅ | Yes |
| Payout not on hold (booking) | ✅ | Yes |
| Payout not on hold (farmer) | ✅ | Yes |
| Farmer Stripe connected | ✅ | Yes |
| Farmer payouts enabled | ✅ | Yes |
| Not already paid | ✅ | Yes (idempotency) |

## Security Notes

- Public application form uses Zod validation
- Admin routes require authentication
- Farmer assignments respect booking permissions
- Payout operations respect idempotency
- Transfer IDs prevent duplicate payouts
- UNIQUE constraint prevents duplicate assignments

## Troubleshooting

### Farmer Payout Not Triggering

**Problem:** Balance paid but farmer payout not processed

**Solution:**
1. Check webhook logs for farmer payout attempts
2. Verify `job_completed_at` is set
3. Verify `payout_hold = false` on booking
4. Check farmer Stripe Connect status
5. Verify `booking_farmers.payout_status = 'pending'`
6. Check `transfer_id` is null (not already paid)

### Cannot Assign Same Farmer Twice

**Problem:** Error when assigning same farmer with different role

**Solution:**
- This is expected behavior - UNIQUE constraint on (booking_id, farmer_id, role)
- To assign same farmer with different role, use different role value
- To change role, remove existing assignment and create new one

### Payout Amount Incorrect

**Problem:** Farmer payout amount doesn't match expected calculation

**Solution:**
1. Check `payout_percent` in `booking_farmers` table
2. Check `quote_total_cents` in `booking_inquiries` table
3. Verify calculation: `payout_amount_cents = quote_total_cents * payout_percent / 100`
4. Check if quote was updated after assignment (should auto-recalculate)

## Next Steps (Future Enhancements)

1. **Farmer Portal** - Dashboard for farmers to view assignments and earnings
2. **Product Catalog** - Farmers can list available products
3. **Seasonal Availability** - Track when products are in season
4. **Direct Messaging** - Communication between admin and farmers
5. **Bulk Assignments** - Assign multiple farmers at once
6. **Payout Reports** - Detailed payout history and tax documents
7. **Certification Verification** - Verify and track certifications
8. **Regenerative Impact Tracking** - Measure and report impact metrics

## Support

For issues:
1. Check server logs for detailed errors
2. Verify database migration was applied
3. Check `farmers` and `booking_farmers` tables
4. Verify Stripe Connect is enabled
5. Review payout engine logs for blockers
6. Check webhook logs for farmer payout attempts
7. Review this documentation for troubleshooting steps
