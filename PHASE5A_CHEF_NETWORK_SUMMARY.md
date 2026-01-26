# Phase 5A: Chef Partner Network

## Overview

Phase 5A implements a complete Chef Partner Network system, allowing Bornfidis Provisions to onboard chef partners, assign them to bookings, and handle automated payouts through Stripe Connect. This enables scalable operations while maintaining the faith-driven, regenerative values of the platform.

## What Was Built

### 1. Database Schema

**File:** `supabase/migration-phase5a-chef-network.sql`

**Tables Created:**

#### `chefs`
- Chef profiles and application data
- Stripe Connect account information
- Status tracking (pending, approved, active, rejected, inactive)
- Payout percentage configuration (default 70%)

#### `chef_availability`
- Availability calendar for chefs
- Date-based availability with optional time ranges
- Notes for specific dates

#### `booking_assignments`
- Links bookings to chefs
- Automatic payout calculation (70% to chef, 30% platform)
- Payment status tracking
- Assignment status (assigned, confirmed, completed, cancelled)

**Indexes:**
- Performance indexes on all foreign keys and status fields
- Unique constraints where needed

### 2. Chef Application System

**Files:**
- `app/chef/apply/page.tsx` - Application landing page
- `app/chef/apply/ChefApplicationForm.tsx` - Application form component
- `app/chef/apply/thank-you/page.tsx` - Confirmation page
- `app/api/chef/apply/route.ts` - Application submission API

**Features:**
- Professional application form
- Fields: email, name, phone, bio, experience, specialties, certifications, website, Instagram
- Validation using Zod schemas
- Duplicate email prevention
- Faith-driven branding and messaging

### 3. Admin Chef Management

**Files:**
- `app/admin/chefs/page.tsx` - Chef list page
- `app/admin/chefs/ChefListClient.tsx` - Interactive chef list component
- `app/admin/chefs/actions.ts` - Server actions for chef data
- `app/api/admin/chefs/[id]/approve/route.ts` - Approve chef API
- `app/api/admin/chefs/[id]/reject/route.ts` - Reject chef API

**Features:**
- View all chef applications
- Approve/reject applications
- Automatic Stripe Express account creation on approval
- Onboarding link generation
- Status badges and filtering
- Stripe onboarding status tracking

### 4. Stripe Connect Integration

**File:** `lib/stripe-connect.ts`

**Functions:**
- `createChefStripeAccount()` - Creates Express account
- `createOnboardingLink()` - Generates onboarding URL
- `getAccountStatus()` - Checks onboarding completion
- `createChefPayout()` - Transfers funds to chef account

**Features:**
- Express account creation (simplified onboarding)
- 24-hour onboarding link expiration
- Account status tracking
- Automated payout transfers

### 5. Booking Assignment Engine

**File:** `app/api/admin/bookings/[id]/assign-chef/route.ts`

**Features:**
- Assign chef to booking
- Automatic payout calculation (70% chef, 30% platform)
- Validation:
  - Booking must have quote total
  - Chef must be active
  - Chef must complete Stripe onboarding
  - No duplicate assignments
- Creates `booking_assignments` record with all payout details

### 6. Type Definitions

**File:** `types/chef.ts`

**Interfaces:**
- `Chef` - Complete chef profile
- `ChefAvailability` - Availability calendar entries
- `BookingAssignment` - Assignment with payout details

**Types:**
- `ChefStatus` - pending | approved | rejected | active | inactive
- `AssignmentStatus` - assigned | confirmed | completed | cancelled
- `PayoutStatus` - pending | processing | paid | failed

### 7. Validation Schemas

**File:** `lib/validation.ts`

**Added:**
- `chefApplicationSchema` - Zod validation for applications
- `ChefApplicationInput` - TypeScript type

## Database Migration

**To apply migration:**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase5a-chef-network.sql`
3. Run the migration
4. Verify tables created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('chefs', 'chef_availability', 'booking_assignments');
   ```

## Environment Variables

**Required:**
```env
STRIPE_SECRET_KEY=sk_test_... # or sk_live_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # or production URL
```

**Note:** Stripe Connect requires a Stripe account with Connect enabled.

## API Routes

### Public Routes
- `POST /api/chef/apply` - Submit chef application

### Admin Routes (Require Authentication)
- `GET /api/admin/chefs` - Get all chefs (via server action)
- `POST /api/admin/chefs/[id]/approve` - Approve chef, create Stripe account
- `POST /api/admin/chefs/[id]/reject` - Reject chef application
- `POST /api/admin/bookings/[id]/assign-chef` - Assign chef to booking

## Workflow

### Chef Onboarding Flow

1. **Application** (`/chef/apply`)
   - Chef submits application
   - Status: `pending`

2. **Admin Review** (`/admin/chefs`)
   - Admin reviews application
   - Can approve or reject

3. **Approval** (Admin clicks "Approve")
   - Stripe Express account created
   - Onboarding link generated
   - Status: `approved`
   - Email sent to chef with onboarding link

4. **Stripe Onboarding** (`/chef/onboarding`)
   - Chef completes Stripe onboarding
   - Status: `active`
   - Chef can now receive assignments

### Booking Assignment Flow

1. **Admin Assigns Chef** (Booking detail page)
   - Select active chef
   - System calculates payout (70% chef, 30% platform)
   - Assignment created
   - Status: `assigned`

2. **Chef Confirms** (Chef dashboard - future)
   - Chef reviews assignment
   - Confirms availability
   - Status: `confirmed`

3. **Booking Completion**
   - After booking is fully paid
   - Payout processed automatically
   - Status: `completed`
   - Payout status: `paid`

## Seed Data

**To test the system, create a test chef:**

```sql
INSERT INTO chefs (
  email, name, phone, bio, experience_years, 
  specialties, status, application_submitted_at
) VALUES (
  'chef@example.com',
  'Test Chef',
  '555-0123',
  'Experienced chef with 10+ years in farm-to-table cuisine. Passionate about regenerative practices and community building.',
  10,
  ARRAY['Farm-to-Table', 'Mediterranean', 'Vegetarian'],
  'pending',
  NOW()
);
```

## Testing Checklist

### 1. Chef Application

- [ ] Navigate to `/chef/apply`
- [ ] Fill out application form
- [ ] Submit application
- [ ] Verify redirect to thank-you page
- [ ] Check database: `SELECT * FROM chefs WHERE email = '...'`
- [ ] Verify status is `pending`

### 2. Admin Approval

- [ ] Navigate to `/admin/chefs`
- [ ] See pending application in list
- [ ] Click "Approve"
- [ ] Verify Stripe account created
- [ ] Verify onboarding link generated
- [ ] Check database: `SELECT stripe_account_id, stripe_onboarding_link FROM chefs WHERE id = '...'`
- [ ] Verify status is `approved`

### 3. Stripe Onboarding

- [ ] Click onboarding link
- [ ] Complete Stripe onboarding flow
- [ ] Verify status updates to `active`
- [ ] Check: `SELECT stripe_onboarding_complete FROM chefs WHERE id = '...'`

### 4. Booking Assignment

- [ ] Navigate to booking detail page
- [ ] Ensure booking has quote total
- [ ] Assign chef to booking
- [ ] Verify assignment created
- [ ] Check payout calculation:
  ```sql
  SELECT 
    booking_total_cents,
    chef_payout_cents,
    platform_fee_cents,
    chef_payout_percentage
  FROM booking_assignments 
  WHERE booking_id = '...';
  ```
- [ ] Verify: `chef_payout_cents = booking_total_cents * 0.70`

### 5. Rejection Flow

- [ ] Navigate to `/admin/chefs`
- [ ] Click "Reject" on pending application
- [ ] Enter rejection reason (optional)
- [ ] Verify status is `rejected`
- [ ] Check: `SELECT rejection_reason FROM chefs WHERE id = '...'`

## Files Created

1. `supabase/migration-phase5a-chef-network.sql` - Database migration
2. `types/chef.ts` - TypeScript types
3. `lib/stripe-connect.ts` - Stripe Connect utilities
4. `app/chef/apply/page.tsx` - Application page
5. `app/chef/apply/ChefApplicationForm.tsx` - Application form
6. `app/chef/apply/thank-you/page.tsx` - Thank you page
7. `app/api/chef/apply/route.ts` - Application API
8. `app/admin/chefs/page.tsx` - Admin chefs list
9. `app/admin/chefs/ChefListClient.tsx` - Chef list component
10. `app/admin/chefs/actions.ts` - Server actions
11. `app/api/admin/chefs/[id]/approve/route.ts` - Approve API
12. `app/api/admin/chefs/[id]/reject/route.ts` - Reject API
13. `app/api/admin/bookings/[id]/assign-chef/route.ts` - Assignment API
14. `PHASE5A_CHEF_NETWORK_SUMMARY.md` - This documentation

## Files Modified

1. `lib/validation.ts` - Added chef application schema

## Next Steps (Future Enhancements)

### Phase 5B: Chef Dashboard & Earnings

1. **Chef Dashboard** (`/chef/dashboard`)
   - View assigned bookings
   - Confirm/reject assignments
   - View earnings
   - Update availability

2. **Earnings Dashboard**
   - Total earnings
   - Past bookings
   - Payout history
   - Next payout date

3. **Availability Management**
   - Calendar interface
   - Bulk availability updates
   - Recurring availability patterns

### Phase 5C: Automated Payouts

1. **Webhook Integration**
   - Listen for booking completion
   - Automatically process payouts
   - Update assignment status

2. **Payout Scheduling**
   - Weekly/monthly payout batches
   - Payout reports
   - Tax documentation

### Phase 5D: Advanced Features

1. **Chef Ratings & Reviews**
2. **Multi-chef assignments** (for large events)
3. **Chef messaging system**
4. **Performance analytics**

## Security Notes

- All admin routes require authentication
- Chef applications are public (with validation)
- Stripe Connect accounts are isolated per chef
- Payout calculations are server-side only
- Assignment validation prevents duplicate assignments

## Troubleshooting

### Stripe Account Creation Fails

**Symptoms:** Error when approving chef

**Solutions:**
1. Verify `STRIPE_SECRET_KEY` is set
2. Check Stripe account has Connect enabled
3. Verify API key has correct permissions
4. Check server logs for detailed error

### Onboarding Link Not Working

**Symptoms:** Link expires or doesn't work

**Solutions:**
1. Links expire after 24 hours - generate new one
2. Verify `NEXT_PUBLIC_SITE_URL` is correct
3. Check Stripe dashboard for account status
4. Ensure chef completes all required fields

### Assignment Fails

**Symptoms:** Cannot assign chef to booking

**Solutions:**
1. Verify booking has `quote_total_cents > 0`
2. Check chef status is `active`
3. Verify `stripe_onboarding_complete = true`
4. Check for existing assignment: `SELECT * FROM booking_assignments WHERE booking_id = '...'`

## Support

For issues or questions:
1. Check server logs for detailed errors
2. Verify database migration was applied
3. Check Stripe dashboard for account status
4. Review this documentation for troubleshooting steps
