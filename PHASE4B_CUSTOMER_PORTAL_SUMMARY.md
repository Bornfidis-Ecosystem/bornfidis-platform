# Phase 4B: Customer Portal

## Overview

Phase 4B implements a secure, customer-facing portal where clients can view their booking details, make payments, download invoices, and communicate with the admin team. The portal uses secure token-based access to ensure customers can only view their own bookings.

## What Was Built

### 1. Database Schema

**File:** `supabase/migration-phase4b-customer-portal.sql`

**New columns added to `booking_inquiries`:**
- `customer_portal_token` (TEXT, nullable) - Unique secure token for portal access
- `customer_portal_token_created_at` (TIMESTAMP WITH TIME ZONE) - When token was generated
- `customer_portal_token_revoked_at` (TIMESTAMP WITH TIME ZONE, nullable) - When token was revoked

**New table: `customer_messages`**
- `id` (UUID, PK)
- `booking_id` (UUID, FK to booking_inquiries)
- `name` (TEXT)
- `email` (TEXT)
- `message` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE)

**Indexes:**
- Unique index on `customer_portal_token` (only for active, non-revoked tokens)
- Index on `customer_messages.booking_id` for efficient lookups
- Index on `customer_messages.created_at` for sorting

### 2. Admin API Routes

#### Generate/Rotate Portal Token
**Route:** `POST /api/admin/bookings/[id]/portal-token`

**Features:**
- Requires admin authentication
- Generates secure 64-character hex token (32 bytes)
- Returns existing token if not revoked (unless `force=true`)
- Can rotate token by setting `force=true`
- Returns portal URL for easy sharing

**Request Body (optional):**
```json
{
  "force": true  // If true, revoke existing token and generate new one
}
```

**Response:**
```json
{
  "success": true,
  "token": "abc123...",
  "portal_url": "http://localhost:3000/portal/abc123...",
  "message": "Token generated successfully"
}
```

### 3. Public Portal API Routes

#### Get Portal Data
**Route:** `GET /api/portal/[token]`

**Features:**
- Validates token (must exist and not be revoked)
- Returns safe booking data only (no admin notes or internal fields)
- Includes quote, payment status, and event details

**Response:**
```json
{
  "success": true,
  "data": {
    "booking_id": "...",
    "customer_name": "...",
    "event_date": "...",
    "quote": { ... },
    "deposit": { ... },
    "balance": { ... },
    "fully_paid": true,
    "invoice_available": true
  }
}
```

#### Pay Deposit
**Route:** `POST /api/portal/[token]/pay-deposit`

**Features:**
- Validates token
- Checks deposit not already paid
- Creates Stripe Checkout Session
- Returns checkout URL
- Success/cancel URLs point back to portal

#### Pay Balance
**Route:** `POST /api/portal/[token]/pay-balance`

**Features:**
- Validates token
- Checks deposit is paid and balance not paid
- Creates Stripe Checkout Session for remaining balance
- Returns checkout URL

#### Send Message
**Route:** `POST /api/portal/[token]/message`

**Features:**
- Validates token
- Validates input (name, email, message)
- Inserts message into `customer_messages` table
- Returns success confirmation

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Question about the event..."
}
```

#### Download Invoice
**Route:** `GET /api/portal/[token]/invoice`

**Features:**
- Validates token
- Checks booking is fully paid
- Generates invoice PDF using `@react-pdf/renderer`
- Returns PDF as download

### 4. Customer Portal Pages

#### Portal Page
**File:** `app/portal/[token]/page.tsx`

**Features:**
- Server-side data fetching
- Handles invalid/expired tokens with friendly error page
- Passes data to client component

#### Portal Client Component
**File:** `app/portal/[token]/PortalClient.tsx`

**Sections:**
1. **Header:** Bornfidis Provisions branding with forest green + gold accent
2. **Event Details Card:** Date, time, location, guests
3. **Quote Summary Card:**
   - Line items table
   - Totals breakdown (subtotal, tax, service fee, total)
   - Quote notes
4. **Payment Status Card:**
   - Deposit status and amount
   - Balance status and amount
   - Fully paid indicator
5. **Payment Actions:**
   - "Pay Deposit" button (if deposit not paid)
   - "Pay Remaining Balance" button (if deposit paid, balance not paid)
   - "Download Invoice" button (if fully paid)
6. **Send Message Form:**
   - Name, email, message fields
   - Success/error feedback
7. **Footer:** Blessing (Numbers 6:24-26)

**Styling:**
- Forest green (`#1a5f3f`) primary color
- Gold (`#FFBC00`) accent color
- White background
- Premium spacing and typography
- Responsive design

### 5. Admin UI Updates

#### Customer Portal Section
**File:** `app/admin/bookings/[id]/BookingDetailClient.tsx`

**Features:**
- "Generate Portal Link" button
- Displays portal URL with copy button
- "Rotate Link" button (force regeneration)
- Shows "Revoked" status if token is revoked
- Auto-loads existing token on page load

**Location:** Added as a new section at the bottom of the booking detail page

### 6. Type Updates

**File:** `types/booking.ts`

**Added fields:**
- `customer_portal_token?: string`
- `customer_portal_token_created_at?: string`
- `customer_portal_token_revoked_at?: string`

## Security Model

### Token Generation
- Tokens are 64-character hex strings (32 random bytes)
- Generated using Node.js `crypto.randomBytes()`
- Cryptographically secure and unguessable

### Token Validation
- All portal routes validate token exists
- All portal routes check `customer_portal_token_revoked_at` is null
- Invalid/revoked tokens return 404 with friendly error

### Data Access
- Portal API routes return only safe, customer-facing fields
- Admin notes and internal fields are never exposed
- Each token maps to exactly one booking

### Token Rotation
- Admins can rotate tokens to revoke access
- Old tokens are marked as revoked (not deleted)
- New tokens can be generated at any time

## Environment Variables

No new environment variables required. Uses existing:
- `NEXT_PUBLIC_SITE_URL` - For portal URLs and Stripe redirects
- `STRIPE_SECRET_KEY` - For payment processing
- `STRIPE_WEBHOOK_SECRET` - For webhook verification

## Database Migration

**To apply migration:**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase4b-customer-portal.sql`
3. Run the migration
4. Verify columns and table were created:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'booking_inquiries' 
   AND column_name LIKE 'customer_portal%';
   
   SELECT * FROM customer_messages LIMIT 1;
   ```

## Testing Checklist

### 1. Admin Portal Token Generation

- [ ] Navigate to booking detail page
- [ ] Click "Generate Portal Link"
- [ ] Verify portal URL is displayed
- [ ] Click "Copy" and verify URL is copied
- [ ] Click "Rotate Link" and verify new URL is generated
- [ ] Verify old URL no longer works

### 2. Customer Portal Access

- [ ] Open portal URL in new browser/incognito
- [ ] Verify portal loads with booking data
- [ ] Verify event details are correct
- [ ] Verify quote summary displays correctly
- [ ] Verify payment status is accurate

### 3. Payment Flow

- [ ] If deposit not paid, click "Pay Deposit"
- [ ] Complete Stripe checkout
- [ ] Verify redirect back to portal with success message
- [ ] Verify payment status updates
- [ ] If balance not paid, click "Pay Remaining Balance"
- [ ] Complete Stripe checkout
- [ ] Verify redirect back to portal with success message
- [ ] Verify fully paid status

### 4. Invoice Download

- [ ] After full payment, verify "Download Invoice" button appears
- [ ] Click button and verify PDF downloads
- [ ] Verify PDF contains correct information
- [ ] Verify PDF has proper branding

### 5. Message Functionality

- [ ] Fill out message form
- [ ] Submit message
- [ ] Verify success message appears
- [ ] Check database: `SELECT * FROM customer_messages WHERE booking_id = '...'`
- [ ] Verify message was saved

### 6. Security Testing

- [ ] Try accessing portal with invalid token (should show error)
- [ ] Generate token, then rotate it
- [ ] Try accessing portal with old token (should show error)
- [ ] Verify portal data doesn't include admin notes
- [ ] Verify portal data doesn't include other bookings

### 7. Edge Cases

- [ ] Portal with no quote (should show "Quote in progress")
- [ ] Portal with Stripe not configured (should hide payment buttons)
- [ ] Portal with fully paid booking (should show invoice download)
- [ ] Portal with revoked token (should show error)

## API Route Summary

### Admin Routes (Require Authentication)
- `POST /api/admin/bookings/[id]/portal-token` - Generate/rotate token

### Public Routes (Token-Based)
- `GET /api/portal/[token]` - Get portal data
- `POST /api/portal/[token]/pay-deposit` - Create deposit payment
- `POST /api/portal/[token]/pay-balance` - Create balance payment
- `POST /api/portal/[token]/message` - Send message
- `GET /api/portal/[token]/invoice` - Download invoice PDF

## Files Created

1. `supabase/migration-phase4b-customer-portal.sql` - Database migration
2. `app/api/admin/bookings/[id]/portal-token/route.ts` - Token generation
3. `app/api/portal/[token]/route.ts` - Portal data endpoint
4. `app/api/portal/[token]/pay-deposit/route.ts` - Deposit payment
5. `app/api/portal/[token]/pay-balance/route.ts` - Balance payment
6. `app/api/portal/[token]/message/route.ts` - Message submission
7. `app/api/portal/[token]/invoice/route.ts` - Invoice download
8. `app/portal/[token]/page.tsx` - Portal page (server)
9. `app/portal/[token]/PortalClient.tsx` - Portal page (client)
10. `PHASE4B_CUSTOMER_PORTAL_SUMMARY.md` - This documentation

## Files Modified

1. `app/admin/bookings/[id]/BookingDetailClient.tsx` - Added Customer Portal section
2. `app/admin/bookings/[id]/page.tsx` - Updated to use `getBookingWithQuote`
3. `types/booking.ts` - Added portal token fields

## Styling Guide

### Colors
- **Primary:** Forest Green `#1a5f3f`
- **Accent:** Gold `#FFBC00`
- **Background:** White `#ffffff`
- **Text:** Gray scale for hierarchy

### Typography
- Headings: Bold, forest green
- Body: Regular, gray-900
- Accents: Gold underline on section headers

### Spacing
- Section padding: `p-6`
- Card margins: `mb-6`
- Premium spacing between elements

## Troubleshooting

### Portal Link Not Working

**Symptoms:** 404 error or "Link Expired" message

**Solutions:**
1. Verify token exists in database: `SELECT customer_portal_token FROM booking_inquiries WHERE id = '...'`
2. Check token is not revoked: `SELECT customer_portal_token_revoked_at FROM booking_inquiries WHERE id = '...'`
3. Verify token matches URL exactly (case-sensitive)
4. Check migration was applied correctly

### Payment Buttons Not Showing

**Symptoms:** Payment buttons don't appear when they should

**Solutions:**
1. Verify quote exists: `SELECT quote_total_cents FROM booking_inquiries WHERE id = '...'`
2. Check payment status: `SELECT paid_at, balance_paid_at FROM booking_inquiries WHERE id = '...'`
3. Verify Stripe is configured: Check `STRIPE_SECRET_KEY` in environment
4. Check browser console for errors

### Messages Not Saving

**Symptoms:** Message form shows error or message doesn't appear in database

**Solutions:**
1. Check `customer_messages` table exists: `SELECT * FROM customer_messages LIMIT 1`
2. Verify token is valid and not revoked
3. Check server logs for database errors
4. Verify form fields are filled correctly

### Invoice PDF Not Generating

**Symptoms:** PDF download fails or shows error

**Solutions:**
1. Verify booking is fully paid: `SELECT fully_paid_at FROM booking_inquiries WHERE id = '...'`
2. Check line items exist: `SELECT quote_line_items FROM booking_inquiries WHERE id = '...'`
3. Verify `@react-pdf/renderer` is installed
4. Check server logs for PDF generation errors

## Next Steps (Future Enhancements)

1. **Message Notifications:** Email admin when customer sends message
2. **Message History:** Display message history in admin dashboard
3. **Token Expiration:** Add optional expiration dates for tokens
4. **Portal Analytics:** Track portal access and engagement
5. **Multi-language Support:** Add language selection to portal
6. **Document Upload:** Allow customers to upload documents via portal

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify database migration was applied
3. Check environment variables are set correctly
4. Review this documentation for troubleshooting steps
5. Test with a fresh token generation
