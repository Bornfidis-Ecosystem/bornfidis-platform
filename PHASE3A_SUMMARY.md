# Phase 3A: Quote + Deposit Invoice Engine

## Overview

Phase 3A adds comprehensive quote management and deposit payment functionality to the admin booking detail page. Admins can now create quotes with line items, generate PDFs, create Stripe payment links, and track payment status.

## What Was Built

### 1. Database Schema (Supabase)

**File:** `supabase/migration-phase3a.sql`

**Changes to `booking_inquiries` table:**
- `quote_currency` (TEXT, default 'USD')
- `quote_subtotal_cents` (INTEGER, default 0)
- `quote_tax_cents` (INTEGER, default 0)
- `quote_total_cents` (INTEGER, default 0)
- `quote_deposit_cents` (INTEGER, default 0)
- `quote_sent_at` (TIMESTAMP WITH TIME ZONE, nullable)
- `stripe_payment_link_url` (TEXT, nullable)
- `stripe_invoice_id` (TEXT, nullable) - stores Stripe Checkout Session ID
- `stripe_payment_status` (TEXT, nullable) - 'unpaid' | 'paid' | 'void' | 'n/a'
- `quote_pdf_url` (TEXT, nullable) - reserved for future PDF storage

**New table: `booking_quote_items`**
- Stores individual line items for each quote
- Fields: id, booking_id (FK), title, description, quantity, unit_price_cents, line_total_cents, sort_order, created_at
- Cascade delete when booking is deleted

**RLS Policies:**
- Service role has full access (all operations server-side)
- No direct client access (secure by design)

### 2. Types & Validation

**Files:**
- `types/quote.ts` - QuoteItem, QuoteDraft, QuoteTotals, BookingQuote interfaces
- `lib/validation.ts` - Added `quoteItemSchema` and `quoteDraftSchema` (Zod)

**Money Utilities (`lib/money.ts`):**
- `centsToDollars()` - Convert cents to dollars
- `dollarsToCents()` - Convert dollars to cents (rounded)
- `formatMoney()` - Format cents as currency string (e.g., "$1,234.56")
- `formatMoneyPlain()` - Format without currency symbol
- `parseDollarsToCents()` - Parse dollar string to cents

### 3. Server Actions

**File:** `app/admin/bookings/quote-actions.ts`

**Functions:**
1. **`getQuote(bookingId)`**
   - Fetches booking quote fields + all quote items
   - Returns `BookingQuote` object
   - Requires authentication

2. **`saveQuote(bookingId, draft)`**
   - Validates input with Zod
   - Recomputes totals server-side (security)
   - Upserts quote items (delete all + insert new)
   - Updates booking totals and deposit
   - Returns updated quote

3. **`markQuoteSent(bookingId)`**
   - Sets `quote_sent_at = now()`
   - Sets `status = 'quoted'`
   - Requires authentication

4. **`createStripeDepositLink(bookingId)`**
   - Checks if Stripe is configured
   - Creates Stripe Checkout Session for deposit
   - Saves session URL and ID to booking
   - Returns checkout URL
   - Returns error if Stripe not configured

### 4. Stripe Integration

**File:** `lib/stripe.ts`

- `getStripe()` - Returns Stripe instance if configured, null otherwise
- `isStripeConfigured()` - Checks if `STRIPE_SECRET_KEY` is set
- Safe, optional - app works without Stripe

**Implementation:**
- Uses Stripe Checkout Sessions (recommended approach)
- One-time payment for deposit amount
- Metadata includes booking_id for webhook handling (future)

### 5. PDF Generation

**File:** `components/pdf/QuotePdf.tsx`

- Uses `@react-pdf/renderer` for client-side PDF generation
- Branded with navy + gold colors
- Includes:
  - Company header
  - Client information
  - Event details
  - Line items table
  - Totals (subtotal, tax, total, deposit)
  - Notes section
  - Next steps copy
- Downloads locally (no server storage required)

### 6. Admin UI

**File:** `app/admin/bookings/[id]/QuoteSection.tsx`

**Features:**
- **Line Items Table:**
  - Add/remove items
  - Edit title, description, quantity, unit price
  - Auto-calculates line totals
  - Real-time subtotal calculation

- **Quote Notes:**
  - Textarea for customer-facing notes
  - Stored in `admin_notes` field (shared with admin notes for now)

- **Tax & Deposit:**
  - Tax input (dollars)
  - Deposit percentage (default 30%, editable)
  - Auto-calculates deposit from total

- **Totals Panel:**
  - Displays subtotal, tax, total, deposit
  - Navy + gold styling

- **Action Buttons:**
  1. **Save Quote** - Saves to database
  2. **Generate PDF** - Downloads PDF quote
  3. **Create Deposit Link** - Creates Stripe checkout (if configured)
  4. **Mark as Quote Sent** - Sets sent timestamp and status
  5. **View Payment Link** - Opens existing Stripe link (if exists)

- **Payment Status Display:**
  - Shows current payment status (unpaid/paid/void/n/a)
  - Color-coded (green for paid, orange for unpaid)

**Integration:**
- Added to `app/admin/bookings/[id]/page.tsx` as new section
- Appears below "Admin Management" section

## Dependencies Added

**package.json:**
```json
{
  "@react-pdf/renderer": "^3.4.4",
  "stripe": "^14.21.0"
}
```

Install with:
```bash
npm install @react-pdf/renderer stripe
```

## Environment Variables

### Required (for Stripe)
```env
STRIPE_SECRET_KEY=sk_test_...  # Your Stripe secret key
```

### Optional
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Used for Stripe redirect URLs
```

**Note:** The app works without Stripe. If `STRIPE_SECRET_KEY` is not set:
- "Create Deposit Link" button shows as disabled
- Tooltip explains Stripe is not configured
- All other quote features work normally

## Database Migration

### How to Run

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase3a.sql`
3. Paste and run
4. Verify:
   - New columns added to `booking_inquiries`
   - `booking_quote_items` table created
   - Indexes created
   - RLS policies applied

### Verification Query

```sql
-- Check columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'booking_inquiries' 
AND column_name LIKE 'quote%' OR column_name LIKE 'stripe%';

-- Check quote_items table exists
SELECT * FROM booking_quote_items LIMIT 1;
```

## Testing Checklist

### ✅ Basic Quote Creation
1. Navigate to `/admin/bookings/[id]`
2. Scroll to "Quote & Deposit" section
3. Click "Add Item"
4. Fill in: Title, Quantity, Unit Price
5. Add tax (optional)
6. Adjust deposit percentage
7. Click "Save Quote"
8. Refresh page - quote persists ✓

### ✅ PDF Generation
1. Create a quote with at least one item
2. Click "Generate PDF"
3. PDF downloads with:
   - Company branding ✓
   - Client info ✓
   - Line items ✓
   - Totals ✓
   - Notes ✓

### ✅ Stripe Integration (if configured)
1. Save a quote with deposit > $0
2. Click "Create Deposit Link"
3. Stripe checkout opens in new tab ✓
4. Payment link saved to booking ✓
5. "View Payment Link" button appears ✓

### ✅ Stripe Not Configured (fallback)
1. Ensure `STRIPE_SECRET_KEY` is not set
2. "Create Deposit Link" button shows as disabled ✓
3. Tooltip explains Stripe is not configured ✓
4. All other features work normally ✓

### ✅ Mark Quote Sent
1. Save a quote
2. Click "Mark as Quote Sent"
3. Status updates to "quoted" ✓
4. "Sent on [date]" indicator appears ✓
5. Button becomes disabled ✓

### ✅ Payment Status
1. After creating Stripe link, payment status shows "UNPAID" ✓
2. (Future: Webhook updates status to "PAID" after payment)

## Security Features

1. **Server-side validation** - All totals recalculated server-side
2. **Authentication required** - All actions require `requireAuth()`
3. **Service role access** - Database operations use service role key
4. **No client secrets** - Stripe key only on server
5. **RLS policies** - Database-level security

## Known Limitations

1. **Quote Notes Storage:**
   - Currently stored in `admin_notes` field (shared with admin notes)
   - Future: Add separate `quote_notes` column if needed

2. **PDF Storage:**
   - PDFs generated client-side, not stored
   - `quote_pdf_url` column reserved for future server-side storage

3. **Payment Webhooks:**
   - Stripe payment status not automatically updated
   - Future: Add webhook handler to update status on payment

4. **Email Integration:**
   - "Email quote" feature not implemented (Phase 3B?)
   - Resend integration ready for future use

## Future Enhancements (Phase 3B+)

1. **Email Quote to Customer:**
   - Use Resend to send PDF as attachment
   - Include payment link in email

2. **Payment Webhooks:**
   - Stripe webhook handler
   - Auto-update payment status
   - Send confirmation emails

3. **Quote Templates:**
   - Pre-defined line items
   - Quick quote generation

4. **Quote History:**
   - Track quote revisions
   - Version control

5. **Invoice Generation:**
   - Full invoice after deposit
   - Final payment tracking

## Files Created/Modified

### New Files
- `supabase/migration-phase3a.sql`
- `types/quote.ts`
- `lib/money.ts`
- `lib/stripe.ts`
- `app/admin/bookings/quote-actions.ts`
- `components/pdf/QuotePdf.tsx`
- `app/admin/bookings/[id]/QuoteSection.tsx`
- `PHASE3A_SUMMARY.md`

### Modified Files
- `package.json` - Added dependencies
- `lib/validation.ts` - Added quote schemas
- `types/booking.ts` - Added quote fields to interface
- `app/admin/bookings/[id]/page.tsx` - Added QuoteSection

## Success Criteria

✅ Admins can create quotes with line items  
✅ Quotes persist in database  
✅ PDFs generate and download  
✅ Stripe integration works (if configured)  
✅ App works without Stripe (graceful fallback)  
✅ Payment status tracked  
✅ Quote sent status tracked  
✅ All actions require authentication  
✅ Server-side validation and security  

## Support

For issues or questions:
1. Check `TROUBLESHOOTING.md` for common issues
2. Verify environment variables are set correctly
3. Check Supabase migration was run successfully
4. Review server logs for errors

---

**Phase 3A Complete** ✅
