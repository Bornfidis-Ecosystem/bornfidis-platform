# Phase 5B: Chef Onboarding + Payout Engine

## Overview

Phase 5B completes the Chef Partner Network by implementing Stripe Connect onboarding, automated payout processing, and a chef portal for tracking earnings and bookings. This enables seamless payment distribution to chef partners after bookings are fully paid.

## What Was Built

### 1. Database Schema Updates

**File:** `supabase/migration-phase5b-chef-onboarding-payouts.sql`

**Chefs Table Additions:**
- `stripe_connect_account_id` - Stripe Express account ID
- `stripe_connect_status` - Status enum: `not_connected | pending | connected | restricted`
- `stripe_onboarded_at` - Timestamp when onboarding completed
- `payouts_enabled` - Boolean flag for payout eligibility
- `chef_portal_token` - Unique token for chef portal access

**Booking Inquiries Additions:**
- `assigned_chef_id` - Direct chef assignment (Phase 5B)
- `chef_payout_amount_cents` - Calculated payout amount
- `chef_payout_status` - Status: `not_applicable | pending | paid | blocked`
- `chef_payout_blockers` - Array of blocker reasons
- `chef_payout_paid_at` - When payout was completed
- `stripe_transfer_id` - Stripe transfer ID for audit trail

**New Table: `chef_payouts`**
- Ledger table for all payouts
- `booking_id` is UNIQUE (idempotency guarantee)
- Tracks status, transfer IDs, errors
- Audit trail for all payout attempts

### 2. Stripe Connect Integration

**File:** `lib/stripe-connect.ts` (updated)

**Enhanced Functions:**
- `createOnboardingLink()` - Now supports refresh_url
- `getAccountStatus()` - Returns detailed Connect status
- `createChefPayout()` - Creates Stripe transfers

**New API Routes:**
- `POST /api/admin/chefs/[id]/start-onboarding` - Admin initiates onboarding
- `GET /api/chef/[token]/account-link` - Chef portal gets onboarding link

### 3. Payout Engine

**File:** `lib/payout-engine.ts`

**Function:** `tryPayoutForBooking(bookingId)`

**Features:**
- **Idempotent:** Checks `chef_payouts` table before creating transfer
- **Validation:** Checks booking fully paid, chef assigned, chef eligible
- **Blockers:** Returns detailed blocker reasons if payout cannot proceed
- **Automatic Calculation:** Uses chef's `payout_percentage` (default 70%)
- **Audit Trail:** Creates ledger entry before transfer, updates after

**Payout Flow:**
1. Check if payout already exists (idempotency)
2. Validate booking is fully paid
3. Validate chef is assigned and eligible
4. Check chef Connect status and payouts_enabled
5. Create ledger entry (idempotency check)
6. Create Stripe transfer
7. Update ledger and booking records

### 4. Webhook Updates

**File:** `app/api/stripe/webhook/route.ts`

**New Event Handlers:**

#### `checkout.session.completed` (Enhanced)
- Keeps existing deposit/balance logic
- **After balance payment:** Automatically triggers `tryPayoutForBooking()`
- Payout runs in background (doesn't fail webhook if payout fails)

#### `account.updated` (New)
- Handles Stripe Connect account status changes
- Updates chef `stripe_connect_status`:
  - `connected` - charges_enabled && payouts_enabled
  - `restricted` - details_submitted but payouts disabled
  - `pending` - details_submitted but not fully enabled
- Sets `payouts_enabled` flag
- Sets `stripe_onboarded_at` when fully connected
- Auto-updates chef status to `active` if approved and connected

### 5. Admin UI Updates

**File:** `app/admin/bookings/[id]/BookingDetailClient.tsx`

**Chef Assignment Section:**
- Shows currently assigned chef (if any)
- Dropdown to select/change chef
- Displays payout calculation preview
- Assignment notes field

**Payout Panel:**
- Shows payout status (pending/paid/blocked)
- Displays payout amount
- Shows Stripe transfer ID (if paid)
- Lists blockers (if blocked)
- "Run Payout Now" button (only when eligible)
- Status badges and indicators

**Chef List Updates:**
- "Start Onboarding" button for approved chefs
- Opens Stripe onboarding in new tab
- Shows Connect status in table

### 6. Chef Portal

**Files:**
- `app/chef/portal/[token]/page.tsx` - Server component
- `app/chef/portal/[token]/ChefPortalClient.tsx` - Client component

**Features:**
- **Token-Based Access:** Secure portal token (no auth required)
- **Stripe Status Card:**
  - Shows Connect status badge
  - Payouts enabled indicator
  - "Continue Onboarding" button if not connected
- **Earnings Snapshot:**
  - Total paid out
  - Pending payouts count
  - Blocked payouts count
- **Bookings List:**
  - All assigned bookings
  - Event details, dates, locations
  - Payout amounts
  - Payout status badges

**Styling:**
- Forest green (#1a5f3f) + Gold (#FFBC00) branding
- Premium spacing and typography
- Responsive design

### 7. API Routes

**Admin Routes:**
- `POST /api/admin/chefs/[id]/start-onboarding` - Start Stripe onboarding
- `POST /api/admin/bookings/[id]/assign-chef` - Assign chef (updated for Phase 5B)
- `POST /api/admin/bookings/[id]/run-payout` - Manually trigger payout
- `GET /api/admin/chefs/[id]` - Get chef details

**Chef Portal Routes:**
- `GET /api/chef/[token]/account-link` - Get/create onboarding link

## Database Migration

**To apply migration:**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase5b-chef-onboarding-payouts.sql`
3. Run the migration
4. Verify:
   ```sql
   -- Check new columns
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'chefs' 
   AND column_name LIKE '%connect%' OR column_name LIKE '%portal%';
   
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'booking_inquiries' 
   AND column_name LIKE '%chef%' OR column_name LIKE '%payout%';
   
   -- Check new table
   SELECT * FROM chef_payouts LIMIT 1;
   ```

## Environment Variables

**Required:**
```env
STRIPE_SECRET_KEY=sk_test_... # or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # or production URL
```

**Optional:**
```env
RESEND_API_KEY=re_... # For email notifications
```

## Workflow

### Chef Onboarding Flow

1. **Chef Applies** (`/chef/apply`)
   - Application submitted
   - Status: `pending`

2. **Admin Approves** (`/admin/chefs`)
   - Admin clicks "Approve"
   - Stripe Express account created
   - Onboarding link generated
   - Status: `approved`
   - `stripe_connect_status`: `pending`

3. **Admin Starts Onboarding** (`/admin/chefs`)
   - Admin clicks "Start Onboarding"
   - Opens Stripe onboarding link
   - Chef completes onboarding

4. **Webhook Updates Status** (`account.updated`)
   - Stripe sends webhook
   - System updates `stripe_connect_status` to `connected`
   - Sets `payouts_enabled = true`
   - Sets `stripe_onboarded_at`
   - Updates chef status to `active`

### Booking Assignment & Payout Flow

1. **Admin Assigns Chef** (Booking detail page)
   - Select chef from dropdown
   - System calculates payout (70% default)
   - Updates `assigned_chef_id` and `chef_payout_amount_cents`
   - Sets `chef_payout_status = 'pending'`

2. **Customer Pays Balance**
   - Stripe webhook: `checkout.session.completed`
   - System marks booking `fully_paid_at`
   - **Automatically triggers payout**

3. **Payout Engine Runs**
   - Validates eligibility
   - Creates `chef_payouts` ledger entry
   - Creates Stripe transfer
   - Updates booking: `chef_payout_status = 'paid'`
   - Stores `stripe_transfer_id`

4. **Chef Views Earnings** (`/chef/portal/[token]`)
   - Sees total paid out
   - Views all assigned bookings
   - Checks payout status

## Testing with Stripe CLI

### Setup Stripe CLI

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### Test Scenarios

#### 1. Chef Onboarding

```bash
# 1. Create test chef application
# Visit /chef/apply and submit

# 2. Approve chef in admin
# Visit /admin/chefs, click "Approve"

# 3. Start onboarding
# Click "Start Onboarding", complete Stripe flow

# 4. Simulate account.updated webhook
stripe trigger account.updated \
  --override account.id=acct_xxx \
  --override account.charges_enabled=true \
  --override account.payouts_enabled=true

# 5. Verify chef status updated
# Check database: SELECT stripe_connect_status, payouts_enabled FROM chefs WHERE id = '...'
```

#### 2. Booking Payout

```bash
# 1. Assign chef to booking (via admin UI)

# 2. Complete booking payment (via Stripe Checkout)

# 3. Webhook automatically triggers payout
# Check logs for: "✅ Chef payout processed"

# 4. Verify payout created
# Database: SELECT * FROM chef_payouts WHERE booking_id = '...'
# Database: SELECT chef_payout_status, stripe_transfer_id FROM booking_inquiries WHERE id = '...'

# 5. Test idempotency: Re-send webhook
stripe trigger checkout.session.completed \
  --override session.metadata.booking_id=xxx \
  --override session.metadata.payment_type=balance

# Verify: No duplicate transfers created
```

#### 3. Manual Payout Trigger

```bash
# 1. Assign chef to fully paid booking

# 2. Click "Run Payout Now" in admin UI

# 3. Verify payout processed
# Check response for transfer_id
# Verify database updated
```

## Testing Checklist

### 1. Chef Onboarding

- [ ] Submit chef application
- [ ] Admin approves chef
- [ ] Admin clicks "Start Onboarding"
- [ ] Onboarding link opens in new tab
- [ ] Complete Stripe onboarding
- [ ] Verify `account.updated` webhook received
- [ ] Check chef status: `stripe_connect_status = 'connected'`
- [ ] Check: `payouts_enabled = true`
- [ ] Check: `stripe_onboarded_at` is set
- [ ] Check chef status: `status = 'active'`

### 2. Booking Assignment

- [ ] Navigate to booking detail page
- [ ] Select chef from dropdown
- [ ] Verify payout calculation shown (70% default)
- [ ] Click "Assign Chef"
- [ ] Verify booking updated: `assigned_chef_id` set
- [ ] Verify: `chef_payout_status = 'pending'`
- [ ] Verify: `chef_payout_amount_cents` calculated

### 3. Automatic Payout

- [ ] Assign chef to booking
- [ ] Complete balance payment
- [ ] Verify webhook processes payment
- [ ] Verify payout triggered automatically
- [ ] Check `chef_payouts` table: entry created
- [ ] Check booking: `chef_payout_status = 'paid'`
- [ ] Check booking: `stripe_transfer_id` set
- [ ] Verify Stripe dashboard: transfer created

### 4. Manual Payout

- [ ] Assign chef to fully paid booking
- [ ] Click "Run Payout Now"
- [ ] Verify payout processed
- [ ] Check transfer ID in response
- [ ] Verify database updated

### 5. Idempotency

- [ ] Complete booking payment
- [ ] Verify payout created
- [ ] Re-send webhook (simulate duplicate)
- [ ] Verify: No duplicate transfer created
- [ ] Verify: No duplicate `chef_payouts` entry
- [ ] Verify: Existing payout record used

### 6. Chef Portal

- [ ] Get chef portal token from database
- [ ] Visit `/chef/portal/[token]`
- [ ] Verify Stripe status displayed
- [ ] Verify earnings summary
- [ ] Verify bookings list
- [ ] Click "Continue Onboarding" (if not connected)
- [ ] Verify onboarding link works

### 7. Payout Blockers

- [ ] Assign chef without Stripe account
- [ ] Try to payout → Verify blocked
- [ ] Check blockers array populated
- [ ] Complete Stripe onboarding
- [ ] Try payout again → Should succeed

## API Route Summary

### Admin Routes (Require Auth)
- `POST /api/admin/chefs/[id]/start-onboarding` - Start onboarding
- `POST /api/admin/bookings/[id]/assign-chef` - Assign chef
- `POST /api/admin/bookings/[id]/run-payout` - Manual payout
- `GET /api/admin/chefs/[id]` - Get chef details

### Chef Portal Routes (Token-Based)
- `GET /api/chef/[token]/account-link` - Get onboarding link

### Webhook Routes
- `POST /api/stripe/webhook` - Handles:
  - `checkout.session.completed` (triggers payout)
  - `account.updated` (updates Connect status)

## Files Created

1. `supabase/migration-phase5b-chef-onboarding-payouts.sql` - Database migration
2. `lib/payout-engine.ts` - Payout engine logic
3. `app/api/admin/chefs/[id]/start-onboarding/route.ts` - Start onboarding API
4. `app/api/chef/[token]/account-link/route.ts` - Get onboarding link API
5. `app/api/admin/bookings/[id]/run-payout/route.ts` - Manual payout API
6. `app/api/admin/chefs/[id]/route.ts` - Get chef API
7. `app/chef/portal/[token]/page.tsx` - Chef portal page
8. `app/chef/portal/[token]/ChefPortalClient.tsx` - Chef portal client
9. `PHASE5B_CHEF_ONBOARDING_PAYOUTS.md` - This documentation

## Files Modified

1. `types/chef.ts` - Added Phase 5B fields
2. `types/booking.ts` - Added payout fields
3. `lib/stripe-connect.ts` - Enhanced functions
4. `app/api/stripe/webhook/route.ts` - Added payout trigger and account.updated
5. `app/api/admin/bookings/[id]/assign-chef/route.ts` - Updated for Phase 5B
6. `app/admin/bookings/[id]/BookingDetailClient.tsx` - Added payout panel
7. `app/admin/chefs/ChefListClient.tsx` - Added "Start Onboarding" button
8. `app/admin/chefs/actions.ts` - Updated getActiveChefs

## Stripe Webhook Setup

### Local Development

1. Install Stripe CLI
2. Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Copy webhook signing secret
4. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

### Production

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `account.updated` (for Connect)
4. Copy webhook signing secret
5. Add to production environment variables

## Troubleshooting

### Payout Not Triggering

**Symptoms:** Booking fully paid but payout not processed

**Solutions:**
1. Check webhook logs: `stripe listen --print-json`
2. Verify webhook secret is correct
3. Check booking: `SELECT fully_paid_at, assigned_chef_id FROM booking_inquiries WHERE id = '...'`
4. Check chef: `SELECT stripe_connect_status, payouts_enabled FROM chefs WHERE id = '...'`
5. Manually trigger: Click "Run Payout Now" button
6. Check server logs for payout errors

### Chef Status Not Updating

**Symptoms:** Chef completes onboarding but status stays `pending`

**Solutions:**
1. Verify `account.updated` webhook is configured
2. Check webhook logs for account.updated events
3. Manually trigger: `stripe trigger account.updated`
4. Check database: `SELECT stripe_connect_status FROM chefs WHERE id = '...'`
5. Verify Stripe account: `charges_enabled` and `payouts_enabled` both true

### Duplicate Payouts

**Symptoms:** Multiple transfers for same booking

**Solutions:**
1. Check `chef_payouts` table: Should have UNIQUE constraint on `booking_id`
2. Verify idempotency check in `tryPayoutForBooking()`
3. Check for race conditions (webhook + manual trigger)
4. Review payout ledger: `SELECT * FROM chef_payouts WHERE booking_id = '...'`

### Onboarding Link Expired

**Symptoms:** Link doesn't work or shows expired

**Solutions:**
1. Links expire after 24 hours
2. Generate new link: Click "Start Onboarding" again
3. Or use chef portal: Click "Continue Onboarding"
4. Check: `SELECT stripe_onboarding_link_expires_at FROM chefs WHERE id = '...'`

## Security Notes

- Chef portal uses secure tokens (64-character random)
- Tokens are unique per chef
- Portal routes validate token before returning data
- Admin routes require authentication
- Payout calculations are server-side only
- Idempotency prevents duplicate payouts
- All Stripe operations use server-side API keys

## Next Steps (Future Enhancements)

1. **Payout Scheduling:** Batch payouts weekly/monthly
2. **Payout Reports:** Detailed earnings reports for chefs
3. **Tax Documentation:** Generate 1099 forms
4. **Multi-Currency:** Support non-USD payouts
5. **Payout Notifications:** Email chefs when payout completes
6. **Payout History:** Detailed history in chef portal
7. **Dispute Handling:** Handle failed transfers and retries

## Support

For issues or questions:
1. Check server logs for detailed errors
2. Verify database migration was applied
3. Check Stripe dashboard for account/transfer status
4. Use Stripe CLI to test webhooks locally
5. Review this documentation for troubleshooting steps
