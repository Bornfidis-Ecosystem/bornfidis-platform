# Phase 4A: Final Balance Payments & Invoicing

## Overview

Phase 4A completes the payment and invoicing system by adding automated invoice email delivery, enhanced webhook handling, and a Download Invoice button in the admin UI. This phase builds on Phase 3C's balance payment functionality.

## What Was Built

### 1. Enhanced Webhook Handler

**File:** `app/api/stripe/webhook/route.ts`

**Enhancements:**
- **Balance Payment Processing:**
  - Sets `paid_at` timestamp when balance is paid (Phase 4A requirement)
  - Sets `balance_paid_at` and `fully_paid_at` timestamps
  - Stores `stripe_balance_payment_intent_id`
  
- **Automated Invoice Email:**
  - Automatically sends invoice email to customer after balance payment
  - Includes payment summary (total, deposit paid, balance paid)
  - Includes blessing footer (Numbers 6:24-26)
  - Gracefully handles email failures (doesn't fail webhook)

**Flow:**
1. Stripe sends `checkout.session.completed` event
2. Webhook verifies signature and extracts metadata
3. If `payment_type === 'balance'`:
   - Updates booking with payment timestamps
   - Fetches booking data for email
   - Sends invoice email via Resend
   - Logs success/failure

### 2. Invoice Email Function

**File:** `lib/email.ts`

**New Function:** `sendInvoiceEmail()`

**Features:**
- Sends professional invoice email to customer
- Includes payment summary (total, deposit, balance)
- Includes invoice number and date
- Includes blessing footer
- Supports PDF attachment (future: when PDF storage is implemented)
- Safe error handling (returns success/failure without throwing)

**Email Template:**
- Navy + Gold branding
- Payment summary box
- Status indicator (Fully Paid ✓)
- Blessing footer with scripture

### 3. Download Invoice Button

**File:** `app/admin/bookings/[id]/BookingDetailClient.tsx`

**New Feature:**
- "Download Invoice" button appears when booking is fully paid
- Uses `PDFDownloadLink` from `@react-pdf/renderer`
- Generates invoice PDF on-demand
- Button styling: Green background (indicates completion)
- Includes loading state during PDF generation

**Conditions:**
- Only shows when `fully_paid_at` is set
- Only shows when line items exist
- Uses `InvoicePdfDocument` component

### 4. Invoice PDF Component Updates

**File:** `components/pdf/InvoicePdf.tsx`

**Updates:**
- Uses Phase 4A field names (`quote_subtotal_cents`, `quote_tax_cents`, `quote_service_fee_cents`, `quote_total_cents`)
- Falls back to legacy fields if Phase 4A fields not available
- Uses `balance_amount_cents` for balance calculations
- Maintains backward compatibility

## Database Schema

No new migrations required. Phase 4A uses existing columns from Phase 3C:
- `paid_at` - Set when balance payment completes
- `balance_paid_at` - Set when balance payment completes
- `fully_paid_at` - Set when balance payment completes
- `stripe_balance_payment_intent_id` - Stores Stripe payment intent ID
- `invoice_pdf_url` - Reserved for future PDF storage

## Environment Variables

**Required:**
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend Email Configuration
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com # Optional, defaults to onboarding@resend.dev

# Site URL (for Stripe redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # or https://yourdomain.com
```

**Note:** If `RESEND_API_KEY` is not set, invoice emails will not be sent, but the webhook will still process payments successfully.

## API Routes

### 1. Balance Payment Session

**Route:** `POST /api/stripe/create-balance-session`

**Purpose:** Creates Stripe Checkout Session for remaining balance payment

**Request Body:**
```json
{
  "booking_id": "uuid"
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

**Validation:**
- Requires deposit to be paid (`paid_at` must exist)
- Requires balance not already paid (`balance_paid_at` must be null)
- Requires quote total > 0
- Requires balance amount > 0

### 2. Stripe Webhook

**Route:** `POST /api/stripe/webhook`

**Purpose:** Handles Stripe webhook events

**Events Handled:**
- `checkout.session.completed` (deposit and balance payments)

**Balance Payment Flow:**
1. Verify webhook signature
2. Extract `payment_type` from metadata
3. If `payment_type === 'balance'`:
   - Update booking with payment timestamps
   - Fetch booking data
   - Send invoice email
   - Return success

## Testing Checklist

### 1. Balance Payment Flow

- [ ] Create a booking with quote
- [ ] Pay deposit via Stripe Checkout
- [ ] Verify deposit payment recorded (`paid_at` set)
- [ ] Click "Request Balance" button
- [ ] Complete balance payment via Stripe Checkout
- [ ] Verify webhook processes payment
- [ ] Verify `balance_paid_at` and `fully_paid_at` are set
- [ ] Verify `paid_at` is set (Phase 4A requirement)
- [ ] Verify invoice email sent to customer

### 2. Invoice Email

- [ ] Check email inbox for invoice email
- [ ] Verify email includes payment summary
- [ ] Verify email includes blessing footer
- [ ] Verify email subject: "Invoice #XXXX - Bornfidis Provisions"

### 3. Download Invoice Button

- [ ] Navigate to booking detail page
- [ ] Verify "Download Invoice" button appears when fully paid
- [ ] Click button and verify PDF downloads
- [ ] Verify PDF includes all line items
- [ ] Verify PDF includes payment summary
- [ ] Verify PDF includes blessing footer

### 4. Error Handling

- [ ] Test with `RESEND_API_KEY` not set (webhook should still succeed)
- [ ] Test with invalid email address (webhook should still succeed)
- [ ] Test with missing booking data (webhook should fail gracefully)

## Troubleshooting

### Invoice Email Not Sent

**Symptoms:** Balance payment succeeds but no email received

**Solutions:**
1. Check `RESEND_API_KEY` is set in `.env.local`
2. Check Resend dashboard for email logs
3. Check server logs for email errors
4. Verify customer email address is valid
5. Check spam folder

**Note:** Email failures do not prevent payment processing. The webhook will log warnings but return success.

### Download Invoice Button Not Showing

**Symptoms:** Button doesn't appear even when fully paid

**Solutions:**
1. Verify `fully_paid_at` is set in database
2. Verify line items exist (`quote_line_items` not empty)
3. Refresh page to get latest booking data
4. Check browser console for errors

### Webhook Not Processing Balance Payments

**Symptoms:** Payment succeeds in Stripe but booking not updated

**Solutions:**
1. Check `STRIPE_WEBHOOK_SECRET` is set correctly
2. Verify webhook URL in Stripe dashboard
3. Check webhook logs in Stripe dashboard
4. Check server logs for webhook errors
5. Verify `payment_type: 'balance'` in session metadata

## Files Modified

1. `app/api/stripe/webhook/route.ts` - Enhanced balance payment handling
2. `lib/email.ts` - Added `sendInvoiceEmail()` function
3. `app/admin/bookings/[id]/BookingDetailClient.tsx` - Added Download Invoice button
4. `components/pdf/InvoicePdf.tsx` - Updated to use Phase 4A fields

## Files Created

1. `PHASE4A_FINAL_BALANCE_INVOICING_SUMMARY.md` - This documentation

## Next Steps (Future Enhancements)

1. **PDF Storage:** Store generated invoices in cloud storage (S3, Supabase Storage) and save URL in `invoice_pdf_url`
2. **Email Attachments:** Attach PDF to invoice email once storage is implemented
3. **Invoice Numbering:** Implement sequential invoice numbering system
4. **Invoice History:** Track invoice versions and revisions
5. **Customer Portal:** Add invoice download to public booking portal

## Security Notes

- All server actions require admin authentication
- Webhook signature verification prevents unauthorized requests
- Email addresses are validated before sending
- Payment processing is idempotent (safe to retry)

## Dependencies

- `@react-pdf/renderer` - PDF generation
- `resend` - Email delivery
- `stripe` - Payment processing

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Check Stripe dashboard for webhook events
3. Check Resend dashboard for email delivery status
4. Review this documentation for troubleshooting steps
