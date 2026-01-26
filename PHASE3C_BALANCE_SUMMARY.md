# Phase 3C: Final Balance Payments

## Overview

Phase 3C enables full quote totals calculation and final balance payments after deposit is paid. The flow is: quote total → deposit paid → request balance → balance paid → fully paid.

## What Was Built

### 1. Database Schema

**File:** `supabase/migration-phase3c-balance.sql`

**New columns added to `booking_inquiries` table:**
- `quote_subtotal_cents` (INTEGER, default 0, NOT NULL)
- `quote_tax_cents` (INTEGER, default 0, NOT NULL)
- `quote_service_fee_cents` (INTEGER, default 0, NOT NULL)
- `quote_total_cents` (INTEGER, default 0, NOT NULL)
- `deposit_percentage` (INTEGER, default 30, NOT NULL)
- `balance_amount_cents` (INTEGER, default 0, NOT NULL)
- `balance_paid_at` (TIMESTAMP WITH TIME ZONE, nullable)
- `fully_paid_at` (TIMESTAMP WITH TIME ZONE, nullable)
- `quote_notes` (TEXT, nullable)
- `quote_line_items` (JSONB, default '[]', NOT NULL) - Stores line items as JSON array
- `stripe_balance_session_id` (TEXT, nullable)
- `stripe_balance_payment_intent_id` (TEXT, nullable)

**Indexes created:**
- `idx_booking_quote_total_cents` - For querying by total
- `idx_booking_balance_paid_at` - For payment date queries
- `idx_booking_fully_paid_at` - For fully paid status queries

### 2. Types

**File:** `types/booking.ts`

**Updated `BookingInquiry` interface with Phase 3C fields:**
- All quote fields use `quote_` prefix
- `quote_line_items` as `QuoteLineItem[]` (parsed from JSONB)
- `deposit_percentage` (not `deposit_percent`)
- `quote_service_fee_cents` (not `service_fee_cents`)
- Balance payment fields: `stripe_balance_session_id`, `stripe_balance_payment_intent_id`

### 3. Server Actions

**File:** `app/admin/bookings/actions.ts`

**New Function: `updateBookingQuote(id, payload)`**

**Payload:**
```typescript
{
  quote_line_items: QuoteLineItem[]
  quote_notes?: string | null
  quote_tax_cents: number
  quote_service_fee_cents: number
  quote_subtotal_cents: number
  quote_total_cents: number
  deposit_percentage: number
}
```

**Functionality:**
- Validates line items and totals
- Calculates `deposit_amount_cents = round(quote_total_cents * deposit_percentage / 100)`
- Calculates `balance_amount_cents = max(quote_total_cents - deposit_amount_cents, 0)`
- Stores `quote_line_items` as JSONB
- Requires admin authentication
- Returns updated booking

### 4. Admin UI - Quote Builder

**File:** `app/admin/bookings/[id]/BookingDetailClient.tsx`

**Features:**
- **Line Items Editor:**
  - Add/remove items
  - Edit: title, description, quantity, unit price
  - Auto-calculates line totals
  - Real-time subtotal calculation

- **Quote Configuration:**
  - Quote Notes (textarea)
  - Tax (USD input)
  - Service Fee (USD input)
  - Deposit Percentage (default 30%, editable)

- **Totals Panel:**
  - Subtotal
  - Tax
  - Service Fee
  - Total
  - Deposit (calculated from percentage)
  - Deposit Paid (if applicable)
  - Balance Due

- **Payment Status Panel:**
  - Deposit Paid: Yes/No
  - Balance Paid: Yes/No
  - Fully Paid: Yes/No
  - Total amount
  - Deposit amount
  - Balance amount

- **Action Buttons:**
  - **Save Quote** - Persists line items + totals
  - **Send Deposit** - Creates deposit payment (if quote saved and Stripe configured)
  - **Request Balance** - Creates balance payment (if deposit paid and balance > 0)
  - **Stripe Not Configured** - Shows if Stripe missing

- **Success/Error Messages:**
  - Shows payment success/cancel messages from URL params
  - Auto-clears after 5 seconds

### 5. Balance Payment API Route

**File:** `app/api/stripe/create-balance-session/route.ts`

**Endpoint:** `POST /api/stripe/create-balance-session`

**Authentication:** Admin-only (Phase 3C requirement)

**Request Body:**
```json
{
  "booking_id": "uuid"
}
```

**Functionality:**
- Validates admin authentication
- Checks Stripe configuration
- Fetches booking with Phase 3C fields (`quote_total_cents`, `deposit_percentage`, etc.)
- Validates:
  - `quote_total_cents > 0`
  - Deposit is paid (`paid_at` not null OR `status = 'booked'`)
  - Balance not already paid (`balance_paid_at` is null)
  - Balance amount > 0
- Uses stored `balance_amount_cents` if available, otherwise calculates
- Creates Stripe Checkout Session:
  - One-time payment for balance amount
  - Metadata: `{ booking_id, payment_type: 'balance' }`
- Saves `stripe_balance_session_id` to booking
- Returns checkout URL

### 6. Webhook Updates

**File:** `app/api/stripe/webhook/route.ts`

**Updated to handle balance payments:**

**Deposit Payment (Phase 3A):**
- `metadata.payment_type === 'deposit'`
- Sets `stripe_payment_intent_id`, `status='booked'`, `paid_at`

**Balance Payment (Phase 3C):**
- `metadata.payment_type === 'balance'`
- Sets `stripe_balance_payment_intent_id`, `balance_paid_at`, `fully_paid_at`

**Backward Compatibility:**
- Still supports `metadata.kind` and `metadata.type` for Phase 3A/3B

## Environment Variables

### Required

```env
# Stripe Secret Key
STRIPE_SECRET_KEY=sk_test_...  # or sk_live_... for production

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_...

# Site URL (for redirect URLs)
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # or your production URL
```

## Database Migration

### How to Run

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase3c-balance.sql`
3. Paste and run
4. Verify:
   ```sql
   -- Check columns were added
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'booking_inquiries' 
   AND column_name IN ('quote_subtotal_cents', 'quote_tax_cents', 'quote_service_fee_cents', 
                       'quote_total_cents', 'deposit_percentage', 'balance_amount_cents', 
                       'balance_paid_at', 'fully_paid_at', 'quote_notes', 'quote_line_items',
                       'stripe_balance_session_id', 'stripe_balance_payment_intent_id');

   -- Check indexes
   SELECT indexname FROM pg_indexes 
   WHERE tablename = 'booking_inquiries' 
   AND indexname LIKE '%quote%' OR indexname LIKE '%balance%';
   ```

## Webhook Setup

### Local Development

1. **Start webhook forwarding:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

2. **Copy webhook secret** (starts with `whsec_`) and add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **Test webhook:**
   ```bash
   stripe trigger checkout.session.completed
   ```

### Production

1. **Add webhook endpoint in Stripe Dashboard:**
   - Go to Developers → Webhooks
   - Endpoint URL: `https://your-domain.com/api/stripe/webhook`
   - Select event: `checkout.session.completed`
   - Copy "Signing secret"

2. **Add to production environment variables:**
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

## Testing Instructions

### 1. Test Quote Creation

1. Navigate to `/admin/bookings/[id]`
2. Scroll to "Quote Builder" section
3. Click "Add Item"
4. Fill in:
   - Title: "Catering Service"
   - Quantity: 1
   - Unit Price: 1000.00
5. Add more items as needed
6. Enter Tax: 80.00
7. Enter Service Fee: 50.00
8. Set Deposit %: 30
9. Add Quote Notes (optional)
10. Click "Save Quote"
11. Verify success message
12. Refresh page - quote persists ✓

**Expected Result:**
- Line items saved as JSONB
- Totals calculated correctly
- Deposit and balance amounts calculated
- Quote summary saved

### 2. Test Totals Calculation

1. Create quote with:
   - Subtotal: $1,000
   - Tax: $80
   - Service Fee: $50
   - Deposit %: 30%
2. Verify totals:
   - Total: $1,130
   - Deposit (30%): $339
   - Balance: $791

### 3. Test Deposit Payment (Phase 3A)

1. Save a quote with total > $0
2. Click "Send Deposit" (if quote saved)
3. Enter deposit amount
4. Complete payment in Stripe Checkout
5. Verify:
   - Deposit Paid: Yes ✓
   - `paid_at` is set ✓
   - Status: 'booked' ✓

### 4. Test Balance Payment

**Prerequisites:**
- Quote saved with total > $0
- Deposit paid (Phase 3A)

1. Navigate to booking detail page
2. Scroll to "Quote Builder"
3. Verify:
   - Deposit Paid: Yes
   - Balance Due > $0
   - "Request Balance" button enabled
4. Click "Request Balance"
5. Complete payment in Stripe Checkout
6. Verify:
   - Redirects back with `?payment=success`
   - Success message appears
   - Balance Paid: Yes ✓
   - Fully Paid: Yes ✓
   - `balance_paid_at` is set ✓
   - `fully_paid_at` is set ✓
   - `stripe_balance_payment_intent_id` is set ✓

### 5. Test Payment Status Panel

1. **No payments:**
   - Deposit Paid: No
   - Balance Paid: No
   - Fully Paid: No

2. **Deposit only:**
   - Deposit Paid: Yes
   - Balance Paid: No
   - Fully Paid: No

3. **Both paid:**
   - Deposit Paid: Yes
   - Balance Paid: Yes
   - Fully Paid: Yes

### 6. Test Edge Cases

1. **No quote yet:**
   - "Send Deposit" and "Request Balance" buttons hidden or disabled
   - Shows "No items yet" message

2. **Deposit not paid:**
   - "Request Balance" button disabled
   - Error message if attempted

3. **Balance already paid:**
   - "Request Balance" button hidden
   - Shows "Fully Paid" status

4. **Stripe not configured:**
   - Buttons show "Stripe Not Configured"
   - Buttons disabled

5. **No balance due:**
   - "Request Balance" button hidden
   - Shows "Fully Paid" in totals

## Payment Flow

```
1. Admin creates quote with line items
   ↓
2. Admin saves quote (totals calculated)
   - deposit_amount_cents = round(total * deposit_percentage / 100)
   - balance_amount_cents = max(total - deposit, 0)
   ↓
3. Admin sends deposit payment (Phase 3A)
   ↓
4. Customer pays deposit
   ↓
5. Webhook: deposit payment completed
   - Sets paid_at, status='booked'
   ↓
6. Admin clicks "Request Balance"
   ↓
7. Stripe Checkout for balance
   ↓
8. Customer pays balance
   ↓
9. Webhook: balance payment completed
   - Sets balance_paid_at
   - Sets fully_paid_at
   - Sets stripe_balance_payment_intent_id
   ↓
10. Booking is fully paid
```

## Security Features

1. **Authentication Required:**
   - All server actions require `requireAuth()`
   - Balance payment API requires admin authentication

2. **Server-side Validation:**
   - All totals calculated server-side
   - Line items validated before save
   - Deposit and balance amounts computed server-side

3. **Webhook Signature Verification:**
   - Verifies Stripe webhook signature
   - Prevents unauthorized webhook calls

4. **No Client Secrets:**
   - Stripe keys only on server
   - All database operations use service role

## Files Created/Modified

### New Files
- `supabase/migration-phase3c-balance.sql`
- `PHASE3C_BALANCE_SUMMARY.md`

### Modified Files
- `types/booking.ts` - Added Phase 3C fields
- `app/admin/bookings/actions.ts` - Added `updateBookingQuote` function
- `app/admin/bookings/[id]/BookingDetailClient.tsx` - Added full Quote Builder UI
- `app/api/stripe/create-balance-session/route.ts` - Updated for Phase 3C fields
- `app/api/stripe/webhook/route.ts` - Updated to handle balance payments

## Known Limitations

1. **JSONB Storage:**
   - Line items stored as JSONB (not normalized)
   - No version history
   - Updates overwrite previous quote

2. **Partial Payments:**
   - Not supported in this phase
   - Only deposit + final balance

3. **Quote Revisions:**
   - No version history
   - Updates overwrite previous quote

## Troubleshooting

### Quote Not Saving

1. **Check validation errors:**
   - Ensure all line items have title and price > 0
   - Check browser console for errors

2. **Check server logs:**
   - Look for validation errors
   - Check database connection

3. **Verify JSONB storage:**
   ```sql
   SELECT quote_line_items FROM booking_inquiries WHERE id = 'booking-id';
   ```

### Balance Payment Not Working

1. **Verify deposit is paid:**
   ```sql
   SELECT paid_at, deposit_amount_cents, status 
   FROM booking_inquiries 
   WHERE id = 'booking-id';
   ```

2. **Check balance amount:**
   ```sql
   SELECT quote_total_cents, deposit_amount_cents, balance_amount_cents,
          (quote_total_cents - COALESCE(deposit_amount_cents, 0)) as calculated_balance
   FROM booking_inquiries 
   WHERE id = 'booking-id';
   ```

3. **Verify Stripe configuration:**
   - Check `STRIPE_SECRET_KEY` is set
   - Check API route logs for errors

### Webhook Not Updating Balance

1. **Check webhook logs:**
   - Stripe Dashboard → Webhooks → Recent events
   - Look for failed events

2. **Verify metadata:**
   - Check `metadata.payment_type === 'balance'`
   - Check `metadata.booking_id` is set

3. **Check server logs:**
   - Look for webhook processing errors
   - Verify database update succeeded

## Success Criteria

✅ Admins can create quotes with line items  
✅ Totals calculated correctly (subtotal, tax, service fee, total, deposit, balance)  
✅ Quotes persist in database (JSONB storage)  
✅ Deposit payment works (Phase 3A)  
✅ Balance payment works after deposit  
✅ Webhook updates booking correctly  
✅ Payment status indicators work  
✅ All actions require authentication  
✅ Server-side validation and security  
✅ No breaking changes to Phase 1-3A  

---

## Quick Start Checklist

- [ ] Run database migration: `supabase/migration-phase3c-balance.sql`
- [ ] Set environment variables: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`
- [ ] Start dev server: `npm run dev`
- [ ] Test create quote: Add items, save quote
- [ ] Test deposit payment: Send deposit, complete payment
- [ ] Test balance payment: Request balance, complete payment
- [ ] Verify booking shows fully paid

**Phase 3C Complete** ✅
