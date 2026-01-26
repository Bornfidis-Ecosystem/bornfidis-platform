# Phase 3C: Final Balance Payments and Invoicing

## Overview

Phase 3C adds invoice generation and a public client portal for customers to view their booking invoice and pay the remaining balance after deposit. This completes the payment flow with professional invoicing and customer self-service.

## What Was Built

### 1. Database Schema

**File:** `supabase/migration-phase3c-invoice.sql`

**New column added to `booking_inquiries` table:**
- `invoice_pdf_url` (TEXT, nullable) - URL for stored invoice PDF (future use)

**Note:** `balance_amount_cents`, `balance_paid_at`, and `fully_paid_at` were already added in Phase 3B.

### 2. Invoice PDF Generator

**File:** `components/pdf/InvoicePdf.tsx`

**Features:**
- Professional invoice layout with Bornfidis Provisions branding
- Navy + Gold color scheme
- Includes:
  - Company header
  - Invoice number and date
  - Client information
  - Event details
  - Line items table
  - Totals (subtotal, tax, service fee, total)
  - Payment summary (deposit received, balance due)
  - Payment status indicators
  - Notes section
  - Blessing footer (Numbers 6:24-26)
- Uses `@react-pdf/renderer` for client-side PDF generation

### 3. Client Portal

**Files:**
- `app/booking/[id]/page.tsx` - Server component (public access)
- `app/booking/[id]/BookingInvoiceClient.tsx` - Client component

**Features:**
- **Public Access:** No authentication required (accessible via booking UUID)
- **Invoice Display:**
  - Invoice number and date
  - Client information
  - Event details
  - Line items table
  - Totals breakdown
  - Payment summary
  - Payment status indicators
- **Actions:**
  - Download Invoice PDF button
  - Pay Balance button (if balance due and deposit paid)
  - Payment status display
- **Blessing Footer:** Faith-anchored message

**Security:**
- Uses booking UUID (reasonably secure)
- Validates booking exists before displaying
- Only shows payment button when conditions are met

### 4. Admin UI Updates

**File:** `app/admin/bookings/[id]/QuoteBuilder.tsx`

**Added:**
- "Download Invoice PDF" button
- Generates invoice PDF with current quote data
- Available after quote is saved

### 5. API Route Updates

**File:** `app/api/stripe/create-balance-session/route.ts`

**Updated:**
- Now supports both authenticated (admin) and public (client portal) access
- Validates booking exists for public access
- Maintains security by checking booking validity

### 6. Type Updates

**File:** `types/booking.ts`

**Added:**
- `invoice_pdf_url?: string` - For future PDF storage

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
2. Copy contents of `supabase/migration-phase3c-invoice.sql`
3. Paste and run
4. Verify:
   ```sql
   -- Check column was added
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'booking_inquiries' 
   AND column_name = 'invoice_pdf_url';
   ```

## Client Portal Access

### URL Format

```
https://your-domain.com/booking/[booking-id]
```

Example:
```
https://your-domain.com/booking/123e4567-e89b-12d3-a456-426614174000
```

### Sharing with Customers

1. **After quote is created:**
   - Admin saves quote with line items
   - Admin can share the booking URL with customer

2. **Customer Experience:**
   - Customer visits `/booking/[id]`
   - Views invoice with all details
   - Downloads PDF invoice
   - Pays balance (if deposit already paid)

3. **Security:**
   - Booking UUID is reasonably secure (128-bit)
   - No authentication required (convenient for customers)
   - Future: Can add email verification or token-based access

## Testing Instructions

### 1. Test Invoice Generation

1. Navigate to `/admin/bookings/[id]`
2. Create and save a quote with line items
3. Click "Download Invoice PDF"
4. Verify PDF downloads with:
   - Company branding ✓
   - Client info ✓
   - Line items ✓
   - Totals ✓
   - Payment summary ✓
   - Blessing footer ✓

### 2. Test Client Portal

1. **Get booking ID:**
   - From admin dashboard, copy a booking ID
   - Or use: `SELECT id FROM booking_inquiries LIMIT 1;`

2. **Access client portal:**
   - Navigate to `/booking/[id]`
   - Verify invoice displays correctly ✓

3. **Test payment flow:**
   - Ensure deposit is paid (Phase 3A)
   - Ensure quote has balance due
   - Click "Pay Balance" button
   - Complete payment in Stripe Checkout
   - Verify redirects back and shows success

### 3. Test Payment Status

1. **Before deposit:**
   - Deposit Paid: No
   - Balance Paid: No
   - Fully Paid: No
   - "Pay Balance" button hidden

2. **After deposit:**
   - Deposit Paid: Yes
   - Balance Paid: No
   - Fully Paid: No
   - "Pay Balance" button visible (if balance > 0)

3. **After balance payment:**
   - Deposit Paid: Yes
   - Balance Paid: Yes
   - Fully Paid: Yes
   - "Pay Balance" button shows "Balance Paid ✓"

### 4. Test Edge Cases

1. **No quote yet:**
   - Client portal shows "No items"
   - Payment button hidden

2. **No balance due:**
   - Payment button hidden
   - Shows "Fully Paid ✓"

3. **Deposit not paid:**
   - Payment button hidden
   - Shows error if attempted

4. **Invalid booking ID:**
   - Shows 404 page
   - No data exposed

## Payment Flow

```
1. Admin creates quote
   ↓
2. Admin saves quote
   ↓
3. Admin sends deposit payment (Phase 3A)
   ↓
4. Customer pays deposit
   ↓
5. Admin shares booking URL: /booking/[id]
   ↓
6. Customer views invoice
   ↓
7. Customer clicks "Pay Balance"
   ↓
8. Stripe Checkout for balance
   ↓
9. Customer completes payment
   ↓
10. Webhook: balance payment completed
    - Sets balance_paid_at
    - Sets fully_paid_at
   ↓
11. Customer sees "Balance Paid ✓"
```

## Security Features

1. **Public Access:**
   - Booking UUID provides reasonable security
   - No sensitive admin data exposed
   - Only booking and quote data shown

2. **Payment Validation:**
   - Validates deposit is paid before balance payment
   - Validates balance > 0
   - Validates balance not already paid

3. **API Security:**
   - Booking validation for public access
   - Admin authentication for admin access
   - Stripe webhook signature verification

## Files Created/Modified

### New Files
- `supabase/migration-phase3c-invoice.sql`
- `components/pdf/InvoicePdf.tsx`
- `app/booking/[id]/page.tsx`
- `app/booking/[id]/BookingInvoiceClient.tsx`
- `PHASE3C_FINAL_BALANCE_SUMMARY.md`

### Modified Files
- `types/booking.ts` - Added `invoice_pdf_url` field
- `app/admin/bookings/[id]/QuoteBuilder.tsx` - Added invoice PDF download
- `app/api/stripe/create-balance-session/route.ts` - Added public access support

## Known Limitations

1. **Public Access Security:**
   - Currently relies on UUID security only
   - Future: Add email verification or token-based access

2. **PDF Storage:**
   - PDFs generated client-side (not stored)
   - `invoice_pdf_url` field reserved for future server-side storage

3. **Email Integration:**
   - No automatic email sending yet
   - Admin must manually share booking URL
   - Future: Auto-send invoice email with link

## Future Enhancements

1. **Email Integration:**
   - Auto-send invoice email to customer
   - Include booking URL in email
   - Use Resend API (already configured)

2. **PDF Storage:**
   - Store generated PDFs on server
   - Update `invoice_pdf_url` with stored URL
   - Serve PDFs from CDN

3. **Enhanced Security:**
   - Add email verification for client portal
   - Token-based access links
   - Expiring access tokens

4. **Payment Reminders:**
   - Automated reminders for unpaid balances
   - Email notifications

## Troubleshooting

### Client Portal Not Loading

1. **Check booking ID:**
   ```sql
   SELECT id FROM booking_inquiries WHERE id = 'your-id';
   ```

2. **Check server logs:**
   - Look for database errors
   - Verify Supabase connection

3. **Check URL format:**
   - Ensure UUID format is correct
   - No extra characters or spaces

### Invoice PDF Not Generating

1. **Check line items:**
   - Ensure quote has line items
   - Verify items have valid data

2. **Check browser console:**
   - Look for PDF generation errors
   - Check @react-pdf/renderer version

### Payment Button Not Showing

1. **Check conditions:**
   - Deposit must be paid (`paid_at` is set)
   - Balance must be > 0
   - Balance must not be paid (`balance_paid_at` is null)

2. **Verify quote totals:**
   ```sql
   SELECT total_cents, deposit_amount_cents, 
          (total_cents - COALESCE(deposit_amount_cents, 0)) as balance
   FROM booking_inquiries 
   WHERE id = 'booking-id';
   ```

## Success Criteria

✅ Invoice PDF generates with all details  
✅ Client portal displays invoice correctly  
✅ Payment button shows when conditions are met  
✅ Balance payment works from client portal  
✅ Payment status updates correctly  
✅ Blessing footer displays  
✅ No breaking changes to Phase 1-3B  
✅ Public access works securely  

---

## Quick Start Checklist

- [ ] Run database migration: `supabase/migration-phase3c-invoice.sql`
- [ ] Set environment variables: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`
- [ ] Start dev server: `npm run dev`
- [ ] Test invoice generation: Create quote, download PDF
- [ ] Test client portal: Navigate to `/booking/[id]`
- [ ] Test balance payment: Pay balance from client portal
- [ ] Verify payment status updates correctly

**Phase 3C Complete** ✅
