# Phase 3A: Stripe Deposit Payments

## Overview

Phase 3A adds direct deposit payment functionality to the admin booking detail page. Admins can send deposit payment links to customers via Stripe Checkout, and payments are automatically tracked via webhooks.

## What Was Built

### 1. Database Schema

**File:** `supabase/migration-phase3a-deposit.sql`

**New columns added to `booking_inquiries` table:**
- `stripe_session_id` (TEXT, nullable) - Stripe Checkout Session ID
- `stripe_payment_intent_id` (TEXT, nullable) - Stripe Payment Intent ID (from completed session)
- `deposit_amount_cents` (INTEGER, nullable) - Amount of deposit paid (in cents)
- `paid_at` (TIMESTAMP WITH TIME ZONE, nullable) - Timestamp when payment was completed

**Indexes created:**
- `idx_booking_stripe_session` - For quick lookup by session ID
- `idx_booking_paid_at` - For payment date queries

### 2. Admin UI - Deposit Modal

**File:** `app/admin/bookings/[id]/BookingDetailClient.tsx`

**Features:**
- **"Send Deposit" button** - Appears in Admin Management section (only if not paid)
- **Deposit Modal:**
  - Amount input (USD)
  - Internal notes textarea (optional)
  - Create Payment Link button
  - Cancel button
- **Payment Status Display:**
  - Shows "✓ Paid on [date]" if payment completed
  - Shows "Payment link created (pending payment)" if session exists but not paid
  - Displays deposit amount if paid

**Design:**
- Navy + Gold branding
- Clean, professional modal
- Mobile-responsive
- Loading states and error handling

### 3. API Route - Create Deposit Session

**File:** `app/api/stripe/create-deposit-session/route.ts`

**Endpoint:** `POST /api/stripe/create-deposit-session`

**Authentication:** Required (admin only)

**Request Body:**
```json
{
  "booking_id": "uuid",
  "amount": 100.00,
  "customer_email": "customer@example.com",
  "customer_name": "John Doe",
  "internal_notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://checkout.stripe.com/...",
  "session_id": "cs_..."
}
```

**Functionality:**
- Validates admin authentication
- Checks Stripe configuration
- Verifies booking exists
- Creates Stripe Checkout Session
- Saves session ID and deposit amount to booking
- Returns checkout URL for redirect

### 4. Webhook Handler

**File:** `app/api/stripe/webhook/route.ts`

**Endpoint:** `POST /api/stripe/webhook`

**Authentication:** Webhook signature verification (Stripe)

**Handles Event:** `checkout.session.completed`

**Functionality:**
- Verifies webhook signature
- Extracts booking_id from session metadata
- Updates booking:
  - Sets `stripe_payment_intent_id`
  - Sets `status = 'booked'`
  - Sets `paid_at = now()`
- Logs errors for debugging

### 5. Admin Dashboard Stats

**File:** `app/admin/bookings/page.tsx`

**Stats automatically reflect payments:**
- **Pending:** Counts bookings with status 'pending' or 'New'
- **Booked:** Counts bookings with status 'booked' or 'Confirmed'
- Stats update automatically when webhook sets status to 'booked'

## Environment Variables

### Required

```env
# Stripe Secret Key (from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_...  # or sk_live_... for production

# Stripe Webhook Secret (from Stripe Dashboard → Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...

# Site URL (for redirect URLs)
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # or your production URL
```

### How to Get Stripe Keys

1. **Stripe Secret Key:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Navigate to Developers → API keys
   - Copy "Secret key" (use test key for development)

2. **Stripe Webhook Secret:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - Set endpoint URL: `https://your-domain.com/api/stripe/webhook`
   - Select event: `checkout.session.completed`
   - Copy "Signing secret" (starts with `whsec_`)

## Database Migration

### How to Run

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase3a-deposit.sql`
3. Paste and run
4. Verify:
   ```sql
   -- Check columns were added
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'booking_inquiries' 
   AND column_name IN ('stripe_session_id', 'stripe_payment_intent_id', 'deposit_amount_cents', 'paid_at');
   ```

## Webhook Setup Instructions

### Local Development (using Stripe CLI)

1. **Install Stripe CLI:**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows (using Scoop)
   scoop install stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   
   This will output a webhook signing secret (starts with `whsec_`). Add it to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

4. **Trigger test events:**
   ```bash
   stripe trigger checkout.session.completed
   ```

### Production Setup

1. **Deploy your app** (e.g., to Vercel)

2. **Add webhook endpoint in Stripe Dashboard:**
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://your-domain.com/api/stripe/webhook`
   - Select event: `checkout.session.completed`
   - Copy the "Signing secret"

3. **Add to production environment variables:**
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

## Testing Instructions

### 1. Test Deposit Creation

1. Navigate to `/admin/bookings/[id]`
2. Scroll to "Deposit Payment" section
3. Click "Send Deposit"
4. Enter amount (e.g., `100.00`)
5. Add optional notes
6. Click "Create Payment Link"
7. Should redirect to Stripe Checkout

**Expected Result:**
- Modal closes
- Redirects to Stripe Checkout
- Booking record updated with `stripe_session_id` and `deposit_amount_cents`

### 2. Test Payment Completion (Local)

1. **Start webhook forwarding:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

2. **Create a deposit link** (from step 1)

3. **Complete payment in Stripe Checkout:**
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC
   - Any ZIP code

4. **Check webhook logs:**
   - Should see `checkout.session.completed` event
   - Should see "✅ Payment completed for booking [id]"

5. **Verify booking updated:**
   - Refresh booking detail page
   - Should show "✓ Paid on [date]"
   - Status should be "booked"
   - `stripe_payment_intent_id` should be set
   - `paid_at` should be set

### 3. Test Dashboard Stats

1. **Before payment:**
   - Check dashboard stats
   - Note "Pending" and "Booked" counts

2. **After payment:**
   - Refresh dashboard
   - "Booked" count should increase
   - "Pending" count should decrease

### 4. Test Error Handling

1. **Without Stripe configured:**
   - Remove `STRIPE_SECRET_KEY` from `.env.local`
   - Try to create deposit
   - Should show error: "Stripe is not configured"

2. **Invalid amount:**
   - Try to create deposit with amount `0` or negative
   - Should show validation error

3. **Missing booking:**
   - Try to create deposit with invalid booking_id
   - Should show "Booking not found"

## Security Features

1. **Authentication Required:**
   - All API routes require admin authentication
   - Uses `getServerAuthUser()` to verify admin access

2. **Webhook Signature Verification:**
   - Verifies Stripe webhook signature
   - Prevents unauthorized webhook calls

3. **Server-side Validation:**
   - All amounts validated server-side
   - Booking existence verified before payment creation

4. **No Client Secrets:**
   - Stripe keys only on server
   - Webhook secret only on server

## Payment Flow

```
1. Admin clicks "Send Deposit"
   ↓
2. Admin enters amount and notes
   ↓
3. POST /api/stripe/create-deposit-session
   - Creates Stripe Checkout Session
   - Saves session_id and deposit_amount_cents
   ↓
4. Redirect to Stripe Checkout
   ↓
5. Customer completes payment
   ↓
6. Stripe sends webhook: checkout.session.completed
   ↓
7. POST /api/stripe/webhook
   - Verifies signature
   - Updates booking: status='booked', paid_at=now()
   ↓
8. Admin sees "✓ Paid" on booking detail page
```

## Files Created/Modified

### New Files
- `supabase/migration-phase3a-deposit.sql`
- `app/api/stripe/create-deposit-session/route.ts`
- `app/api/stripe/webhook/route.ts`
- `PHASE3A_DEPOSIT_SUMMARY.md`

### Modified Files
- `app/admin/bookings/[id]/BookingDetailClient.tsx` - Added deposit modal
- `types/booking.ts` - Added deposit payment fields

## Known Limitations

1. **Webhook Reliability:**
   - Stripe retries failed webhooks automatically
   - Consider adding idempotency checks for production

2. **Payment Status:**
   - Status only updates via webhook
   - No manual status override (intentional)

3. **Multiple Payments:**
   - Currently supports one deposit per booking
   - Future: Add support for multiple payments/installments

## Troubleshooting

### Webhook Not Working

1. **Check webhook secret:**
   ```bash
   # Verify it's set correctly
   echo $STRIPE_WEBHOOK_SECRET
   ```

2. **Check webhook logs:**
   - Stripe Dashboard → Developers → Webhooks
   - Click on your endpoint
   - View "Recent events" for errors

3. **Test webhook locally:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   stripe trigger checkout.session.completed
   ```

### Payment Not Updating Status

1. **Check webhook endpoint:**
   - Verify URL is correct in Stripe Dashboard
   - Check if endpoint is receiving events

2. **Check server logs:**
   - Look for webhook processing errors
   - Verify database update succeeded

3. **Manual check:**
   ```sql
   SELECT id, stripe_session_id, stripe_payment_intent_id, status, paid_at
   FROM booking_inquiries
   WHERE stripe_session_id IS NOT NULL;
   ```

## Success Criteria

✅ Admins can create deposit payment links  
✅ Payments redirect to Stripe Checkout  
✅ Webhook updates booking status automatically  
✅ Dashboard stats reflect payments  
✅ Payment status displayed on booking detail page  
✅ All actions require authentication  
✅ Webhook signature verified  
✅ No breaking changes to existing features  

---

**Phase 3A Deposit Payments Complete** ✅
