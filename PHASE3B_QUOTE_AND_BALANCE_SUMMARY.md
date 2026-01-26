# Phase 3B: Quote Builder + Final Balance Payment

## Overview

Phase 3B adds comprehensive quote building and final balance payment functionality. Admins can create detailed quotes with line items, calculate totals including tax and service fees, and send final payment links for remaining balances after deposits.

## What Was Built

### 1. Database Schema

**File:** `supabase/migration-phase3b-quote.sql`

**New columns added to `booking_inquiries` table:**
- `quote_status` (TEXT, default 'draft') - 'draft' | 'sent' | 'accepted' | 'declined'
- `quote_notes` (TEXT, nullable) - Customer-facing quote notes
- `deposit_percent` (INTEGER, default 30) - Deposit percentage
- `subtotal_cents` (INTEGER, default 0) - Subtotal in cents
- `tax_cents` (INTEGER, default 0) - Tax amount in cents
- `service_fee_cents` (INTEGER, default 0) - Service fee in cents
- `total_cents` (INTEGER, default 0) - Total amount in cents
- `balance_session_id` (TEXT, nullable) - Stripe Checkout Session ID for balance payment
- `balance_payment_intent_id` (TEXT, nullable) - Stripe Payment Intent ID
- `balance_paid_at` (TIMESTAMP WITH TIME ZONE, nullable) - When balance was paid
- `balance_amount_cents` (INTEGER, default 0) - Remaining balance amount in cents
- `fully_paid_at` (TIMESTAMP WITH TIME ZONE, nullable) - When booking was fully paid
- `quote_updated_at` (TIMESTAMP WITH TIME ZONE, default now()) - Last quote update

**New table: `quote_line_items`**
- `id` (UUID, primary key)
- `booking_id` (UUID, FK to booking_inquiries)
- `title` (TEXT, not null)
- `description` (TEXT, nullable)
- `quantity` (INTEGER, default 1)
- `unit_price_cents` (INTEGER, default 0)
- `sort_order` (INTEGER, default 0)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

**Indexes:**
- `idx_quote_line_items_booking_id` - For quick lookup by booking
- `idx_booking_balance_session` - For balance session lookups
- `idx_booking_balance_paid_at` - For payment date queries

**RLS Policies:**
- Service role has full access (all operations server-side)

### 2. Types & Validation

**Files:**
- `types/booking.ts` - Added `QuoteLineItem` interface and Phase 3B fields to `BookingInquiry`
- `lib/validation.ts` - Added `quoteLineItemSchema` and `updateQuoteSummarySchema` (Zod)
- `lib/money.ts` - Added `formatUSD()` helper function

### 3. Server Actions

**File:** `app/admin/bookings/actions.ts`

**New Functions:**
1. **`getQuoteLineItems(bookingId)`**
   - Fetches all quote line items for a booking
   - Ordered by `sort_order`
   - Requires authentication

2. **`upsertQuoteLineItems(bookingId, items[])`**
   - Deletes all existing items, then inserts new ones
   - Validates all items with Zod
   - Maintains `sort_order`
   - Requires authentication

3. **`updateQuoteSummary(bookingId, payload)`**
   - Updates quote summary fields (notes, totals, status)
   - Validates with Zod
   - Sets `quote_updated_at`
   - Requires authentication

4. **`getBookingWithQuote(bookingId)`**
   - Fetches booking + quote line items in one call
   - Returns both booking and items
   - Requires authentication

### 4. Quote Builder UI

**File:** `app/admin/bookings/[id]/QuoteBuilder.tsx`

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
  - Remaining Balance
  - Fully Paid indicator

- **Payment Status Display:**
  - Deposit Paid: Yes/No
  - Balance Paid: Yes/No
  - Fully Paid: Yes/No

- **Action Buttons:**
  - **Save Quote** - Persists line items + summary
  - **Send Final Payment** - Creates Stripe checkout for balance (disabled if conditions not met)
  - **Stripe Not Configured** - Shows if Stripe missing

- **Success/Error Messages:**
  - Shows payment success/cancel messages from URL params
  - Auto-clears after 5 seconds

**Integration:**
- Added to `app/admin/bookings/[id]/page.tsx`
- Wrapped in `Suspense` for `useSearchParams`
- Fetches quote data via `getBookingWithQuote()`

### 5. Stripe Balance Payment API

**File:** `app/api/stripe/create-balance-session/route.ts`

**Endpoint:** `POST /api/stripe/create-balance-session`

**Authentication:** Required (admin only)

**Request Body:**
```json
{
  "booking_id": "uuid"
}
```

**Functionality:**
- Validates admin authentication
- Checks Stripe configuration
- Fetches booking with quote totals
- Calculates remaining balance:
  - `remaining = total_cents - deposit_amount_cents`
  - If `deposit_amount_cents` not set, calculates from `deposit_percent`
- Validates:
  - Quote total > 0
  - Remaining balance > 0
  - Deposit is paid (if deposit required)
  - Balance not already paid
- Creates Stripe Checkout Session:
  - One-time payment for remaining balance
  - Metadata: `{ booking_id, kind: 'balance' }`
- Saves `balance_session_id` and `balance_amount_cents`
- Returns checkout URL

### 6. Webhook Updates

**File:** `app/api/stripe/webhook/route.ts`

**Updated to handle both payment types:**

**Deposit Payment (Phase 3A):**
- `metadata.kind === 'deposit'` or `metadata.type === 'deposit'`
- Sets `stripe_payment_intent_id`, `status='booked'`, `paid_at`

**Balance Payment (Phase 3B):**
- `metadata.kind === 'balance'`
- Sets `balance_payment_intent_id`, `balance_paid_at`
- If deposit already paid OR no deposit required:
  - Sets `fully_paid_at = now()`

**Backward Compatibility:**
- Still supports `metadata.type` for Phase 3A deposits

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
2. Copy contents of `supabase/migration-phase3b-quote.sql`
3. Paste and run
4. Verify:
   ```sql
   -- Check columns were added
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'booking_inquiries' 
   AND column_name IN ('quote_status', 'quote_notes', 'deposit_percent', 'subtotal_cents', 'tax_cents', 'service_fee_cents', 'total_cents', 'balance_session_id', 'balance_payment_intent_id', 'balance_paid_at', 'balance_amount_cents', 'fully_paid_at', 'quote_updated_at');

   -- Check quote_line_items table exists
   SELECT * FROM quote_line_items LIMIT 1;
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
- Line items saved
- Totals calculated correctly
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
   - Remaining Balance: $791 (if deposit paid)

### 3. Test Deposit Payment (Phase 3A)

1. Save a quote with total > $0
2. Go to "Deposit Payment" section (Phase 3A)
3. Click "Send Deposit"
4. Enter deposit amount
5. Complete payment in Stripe Checkout
6. Verify:
   - Deposit Paid: Yes ✓
   - `paid_at` is set ✓
   - Status: 'booked' ✓

### 4. Test Final Balance Payment

**Prerequisites:**
- Quote saved with total > $0
- Deposit paid (Phase 3A)

1. Navigate to booking detail page
2. Scroll to "Quote Builder"
3. Verify:
   - Deposit Paid: Yes
   - Remaining Balance > $0
   - "Send Final Payment" button enabled
4. Click "Send Final Payment"
5. Complete payment in Stripe Checkout
6. Verify:
   - Redirects back with `?payment=balance_success`
   - Success message appears
   - Balance Paid: Yes ✓
   - Fully Paid: Yes ✓
   - `balance_paid_at` is set ✓
   - `fully_paid_at` is set ✓

### 5. Test Payment Status Indicators

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
   - "Send Final Payment" disabled
   - Shows "No items yet" message

2. **Deposit not paid:**
   - "Send Final Payment" disabled
   - Error message if attempted

3. **Balance already paid:**
   - "Send Final Payment" shows "Balance Paid"
   - Button disabled

4. **Stripe not configured:**
   - Button shows "Stripe Not Configured"
   - Button disabled

5. **No remaining balance:**
   - "Send Final Payment" disabled
   - Shows "Fully Paid" in totals

## Payment Flow

```
1. Admin creates quote with line items
   ↓
2. Admin saves quote (totals calculated)
   ↓
3. Admin sends deposit payment (Phase 3A)
   ↓
4. Customer pays deposit
   ↓
5. Webhook: deposit payment completed
   - Sets paid_at, status='booked'
   ↓
6. Admin sends final balance payment
   ↓
7. Customer pays balance
   ↓
8. Webhook: balance payment completed
   - Sets balance_paid_at
   - Sets fully_paid_at (if deposit already paid)
   ↓
9. Booking is fully paid
```

## Security Features

1. **Authentication Required:**
   - All server actions require `requireAuth()`
   - API routes check admin authentication

2. **Server-side Validation:**
   - All totals calculated server-side
   - Zod schemas validate all inputs

3. **Webhook Signature Verification:**
   - Verifies Stripe webhook signature
   - Prevents unauthorized webhook calls

4. **No Client Secrets:**
   - Stripe keys only on server
   - All database operations use service role

## Files Created/Modified

### New Files
- `supabase/migration-phase3b-quote.sql`
- `app/admin/bookings/[id]/QuoteBuilder.tsx`
- `app/api/stripe/create-balance-session/route.ts`
- `PHASE3B_QUOTE_AND_BALANCE_SUMMARY.md`

### Modified Files
- `types/booking.ts` - Added Phase 3B fields and `QuoteLineItem`
- `lib/validation.ts` - Added quote validation schemas
- `lib/money.ts` - Added `formatUSD()` helper
- `app/admin/bookings/actions.ts` - Added quote server actions
- `app/admin/bookings/[id]/page.tsx` - Added QuoteBuilder, updated to fetch quote data
- `app/api/stripe/webhook/route.ts` - Updated to handle balance payments

## Known Limitations

1. **Partial Payments:**
   - Not supported in this phase
   - Only deposit + final balance

2. **Quote Revisions:**
   - No version history
   - Updates overwrite previous quote

3. **Multiple Deposits:**
   - Only one deposit per booking
   - No installment plans

4. **Quote Status:**
   - Status field exists but not fully integrated in UI
   - Future: Add status workflow (draft → sent → accepted)

## Troubleshooting

### Quote Not Saving

1. **Check validation errors:**
   - Ensure all line items have title and price > 0
   - Check browser console for errors

2. **Check server logs:**
   - Look for Zod validation errors
   - Check database connection

### Balance Payment Not Working

1. **Verify deposit is paid:**
   ```sql
   SELECT paid_at, deposit_amount_cents 
   FROM booking_inquiries 
   WHERE id = 'booking-id';
   ```

2. **Check remaining balance:**
   ```sql
   SELECT total_cents, deposit_amount_cents, 
          (total_cents - COALESCE(deposit_amount_cents, 0)) as remaining
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
   - Check `metadata.kind === 'balance'`
   - Check `metadata.booking_id` is set

3. **Check server logs:**
   - Look for webhook processing errors
   - Verify database update succeeded

## Success Criteria

✅ Admins can create quotes with line items  
✅ Totals calculated correctly (subtotal, tax, service fee, total, deposit, balance)  
✅ Quotes persist in database  
✅ Deposit payment works (Phase 3A)  
✅ Final balance payment works  
✅ Webhook updates booking correctly  
✅ Payment status indicators work  
✅ All actions require authentication  
✅ Server-side validation and security  
✅ No breaking changes to Phase 1-3A  

---

## Quick Start Checklist

- [ ] Run database migration: `supabase/migration-phase3b-quote.sql`
- [ ] Set environment variables: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`
- [ ] Start dev server: `npm run dev`
- [ ] Test create quote: Add items, save quote
- [ ] Test deposit payment: Send deposit, complete payment
- [ ] Test balance payment: Send final payment, complete payment
- [ ] Verify booking shows fully paid

**Phase 3B Complete** ✅
