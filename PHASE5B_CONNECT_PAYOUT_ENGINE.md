# Phase 5B: Stripe Connect Onboarding + Payout Engine

## Overview

Phase 5B implements complete Stripe Connect Express onboarding for chef partners, automated payout processing, and a chef portal for tracking earnings. This enables seamless payment distribution to chef partners after bookings are fully paid.

## Key Features

1. **Stripe Connect Express Account Creation** - Automatic account creation on chef approval
2. **Onboarding Link Generation** - Secure links with email delivery
3. **Status Tracking** - Real-time status badges (Pending / Approved / Onboarding Required / Connected)
4. **Automated Payouts** - Automatic payout processing after booking completion
5. **Chef Portal** - Token-based portal for chefs to view earnings and bookings
6. **Webhook Integration** - Real-time status updates via Stripe webhooks

## Environment Variables

### Required

```env
STRIPE_SECRET_KEY=sk_test_... # or sk_live_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # or production URL
STRIPE_WEBHOOK_SECRET=whsec_... # For webhook verification
```

### Optional

```env
RESEND_API_KEY=re_... # For sending onboarding emails
RESEND_FROM_EMAIL=Bornfidis Provisions <noreply@bornfidis.com>
```

**Note:** `STRIPE_CONNECT_CLIENT_ID` is **NOT** required for Express accounts. It's only needed for OAuth flow, which we're not using.

## Database Migration

Run the Phase 5B migration:

```sql
-- Execute in Supabase SQL Editor
-- File: supabase/migration-phase5b-chef-onboarding-payouts.sql
```

This adds:
- Stripe Connect fields to `chefs` table
- Payout tracking fields to `booking_inquiries`
- `chef_payouts` ledger table (for idempotency)

## API Endpoints

### Admin Routes (Require Authentication)

#### `POST /api/stripe/connect/create-account`
Creates a Stripe Express account for a chef.

**Request:**
```json
{
  "chef_id": "uuid",
  "chef_email": "chef@example.com",
  "chef_name": "Chef Name"
}
```

**Response:**
```json
{
  "success": true,
  "account_id": "acct_xxx",
  "message": "Stripe account created successfully"
}
```

#### `POST /api/stripe/connect/create-onboarding-link`
Creates an onboarding link for a chef's Stripe account.

**Request:**
```json
{
  "chef_id": "uuid",
  "send_email": true
}
```

**Response:**
```json
{
  "success": true,
  "onboarding_url": "https://connect.stripe.com/...",
  "expires_at": "2024-01-18T12:00:00Z",
  "email_sent": true
}
```

#### `POST /api/admin/chefs/[id]/approve`
Approves chef and creates Stripe account (if not exists).

#### `POST /api/admin/bookings/[id]/assign-chef`
Assigns chef to booking.

#### `POST /api/admin/bookings/[id]/run-payout`
Manually triggers payout (idempotent).

### Chef Portal Routes (Token-Based)

#### `GET /api/chef/[token]/account-link`
Gets or creates onboarding link for chef portal.

### Webhook Routes

#### `POST /api/stripe/webhook`
Handles:
- `checkout.session.completed` - Triggers automatic payout
- `account.updated` - Updates chef Connect status

## Workflow

### 1. Chef Approval & Account Creation

1. Admin clicks "Approve" on chef application
2. System creates Stripe Express account (`acct_xxx`)
3. Stores `stripe_connect_account_id` on chef record
4. Sets status to `approved`
5. Sets `stripe_connect_status` to `pending`

### 2. Onboarding Link Generation

1. Admin clicks "Send Onboarding Link" (or system auto-generates)
2. System creates Stripe onboarding link
3. Link expires in 24 hours
4. Email sent to chef (if `RESEND_API_KEY` configured)
5. Link stored on chef record

### 3. Chef Completes Onboarding

1. Chef clicks onboarding link
2. Completes Stripe onboarding flow
3. Stripe sends `account.updated` webhook
4. System updates:
   - `stripe_connect_status` → `connected`
   - `payouts_enabled` → `true`
   - `stripe_onboarded_at` → timestamp
   - `status` → `active` (if was `approved`)

### 4. Booking Assignment & Payout

1. Admin assigns chef to booking
2. System calculates payout (70% default)
3. Customer completes payment
4. Webhook triggers automatic payout
5. System creates Stripe transfer
6. Updates booking and payout ledger

## Admin Status Badges

The admin chefs page shows combined status badges:

- **Pending** - Application submitted, awaiting approval
- **Approved** - Approved but no Stripe account yet
- **Onboarding Required** - Stripe account created, onboarding not complete
- **Connected** - Fully onboarded and ready for payouts
- **Rejected** - Application rejected
- **Inactive** - Chef marked inactive

## Testing Steps

### 1. Setup Stripe CLI

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy webhook secret to .env.local
# STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Test Chef Approval

1. Submit chef application at `/chef/apply`
2. Go to `/admin/chefs`
3. Click "Approve" on pending chef
4. Verify:
   - Stripe account created (`acct_xxx`)
   - Status changed to "Approved"
   - `stripe_connect_account_id` stored in database

```sql
SELECT id, name, stripe_connect_account_id, stripe_connect_status, status 
FROM chefs 
WHERE email = 'test@example.com';
```

### 3. Test Onboarding Link

1. Click "Send Onboarding Link" button
2. Verify:
   - Onboarding link opens in new tab
   - Email sent (if Resend configured)
   - Link stored in database

```sql
SELECT stripe_onboarding_link, stripe_onboarding_link_expires_at 
FROM chefs 
WHERE id = 'chef_id';
```

### 4. Test Webhook (account.updated)

```bash
# Simulate account.updated webhook
stripe trigger account.updated \
  --override account.id=acct_xxx \
  --override account.details_submitted=true \
  --override account.charges_enabled=true \
  --override account.payouts_enabled=true
```

Verify:
- Chef status updated to "Connected"
- `payouts_enabled = true`
- `stripe_onboarded_at` set
- Chef status changed to `active`

```sql
SELECT stripe_connect_status, payouts_enabled, stripe_onboarded_at, status 
FROM chefs 
WHERE stripe_connect_account_id = 'acct_xxx';
```

### 5. Test Booking Assignment

1. Create a booking with quote total
2. Go to booking detail page
3. Assign chef from dropdown
4. Verify:
   - `assigned_chef_id` set
   - `chef_payout_amount_cents` calculated
   - `chef_payout_status = 'pending'`

### 6. Test Automatic Payout

1. Complete booking payment (deposit + balance)
2. Webhook automatically triggers payout
3. Verify:
   - `chef_payouts` entry created
   - Stripe transfer created
   - Booking `chef_payout_status = 'paid'`
   - `stripe_transfer_id` stored

```sql
-- Check payout ledger
SELECT * FROM chef_payouts WHERE booking_id = 'booking_id';

-- Check booking
SELECT chef_payout_status, stripe_transfer_id, chef_payout_paid_at 
FROM booking_inquiries 
WHERE id = 'booking_id';
```

### 7. Test Manual Payout

1. Assign chef to fully paid booking
2. Click "Run Payout Now" button
3. Verify payout processed immediately

### 8. Test Idempotency

1. Complete booking payment
2. Verify payout created
3. Re-send webhook (simulate duplicate)
4. Verify:
   - No duplicate transfer created
   - No duplicate `chef_payouts` entry
   - Existing payout record used

### 9. Test Chef Portal

1. Get chef portal token:
```sql
SELECT chef_portal_token FROM chefs WHERE id = 'chef_id';
```

2. Visit `/chef/portal/[token]`
3. Verify:
   - Stripe status displayed
   - Earnings summary shown
   - Bookings list displayed
   - Onboarding link works (if not connected)

## Troubleshooting

### Onboarding Link Not Working

**Problem:** Link expired or invalid

**Solution:**
1. Links expire after 24 hours
2. Generate new link: Click "Send Onboarding Link"
3. Check expiration: `SELECT stripe_onboarding_link_expires_at FROM chefs WHERE id = '...'`

### Webhook Not Updating Status

**Problem:** Chef completes onboarding but status doesn't update

**Solution:**
1. Verify webhook is configured in Stripe Dashboard
2. Check webhook logs: `stripe listen --print-json`
3. Manually trigger: `stripe trigger account.updated`
4. Check server logs for errors

### Payout Not Triggering

**Problem:** Booking fully paid but payout not processed

**Solution:**
1. Check booking: `SELECT fully_paid_at, assigned_chef_id FROM booking_inquiries WHERE id = '...'`
2. Check chef: `SELECT stripe_connect_status, payouts_enabled FROM chefs WHERE id = '...'`
3. Check webhook logs
4. Manually trigger: Click "Run Payout Now"

### Email Not Sending

**Problem:** Onboarding email not received

**Solution:**
1. Check `RESEND_API_KEY` is set
2. Check Resend dashboard for email status
3. Check spam folder
4. Verify email address is valid
5. Check server logs for email errors

### Duplicate Payouts

**Problem:** Multiple transfers for same booking

**Solution:**
1. Check `chef_payouts` table has UNIQUE constraint on `booking_id`
2. Verify idempotency check in `tryPayoutForBooking()`
3. Review payout ledger for duplicates

## Security Notes

- All admin routes require authentication
- Chef portal uses secure tokens (64-character random)
- Payout calculations are server-side only
- Idempotency prevents duplicate payouts
- Webhook signature verification required
- All Stripe operations use server-side API keys

## Files Created/Modified

### New Files
- `app/api/stripe/connect/create-account/route.ts`
- `app/api/stripe/connect/create-onboarding-link/route.ts`
- `lib/env-validation.ts`
- `PHASE5B_CONNECT_PAYOUT_ENGINE.md` (this file)

### Modified Files
- `lib/email.ts` - Added `sendChefOnboardingEmail()`
- `app/admin/chefs/ChefListClient.tsx` - Added status badges and "Send Onboarding Link" button
- `app/api/admin/chefs/[id]/approve/route.ts` - Added env validation
- `app/api/stripe/webhook/route.ts` - Enhanced `account.updated` handler

## Next Steps

1. **Payout Scheduling:** Batch payouts weekly/monthly
2. **Payout Reports:** Detailed earnings reports
3. **Tax Documentation:** Generate 1099 forms
4. **Notifications:** Email chefs when payout completes
5. **Dispute Handling:** Handle failed transfers and retries

## Support

For issues:
1. Check server logs for detailed errors
2. Verify database migration was applied
3. Check Stripe dashboard for account/transfer status
4. Use Stripe CLI to test webhooks locally
5. Review this documentation for troubleshooting steps
