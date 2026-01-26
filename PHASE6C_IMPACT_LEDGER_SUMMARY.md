# Phase 6C: Regenerative Impact Ledger (Bornfidis Impact Engine)

## Overview

Phase 6C implements a comprehensive impact tracking system that automatically records spiritual, ecological, and economic impact across the Bornfidis ecosystem. This creates a transparent, measurable way to demonstrate the regenerative impact of every booking, meal, and transaction.

## What Was Built

### 1. Database Schema

**File:** `supabase/migration-phase6c-impact-ledger.sql`

**New Table: `impact_events`**
- Individual impact records for every significant event
- Event types: soil, farmer, chef, guest, community
- Flexible metric system (soil_health_points, income_cents, meals_served, etc.)
- Links to bookings, farmers, chefs via reference_id
- Metadata JSONB for additional context
- Timestamped for chronological tracking

**New Table: `impact_snapshots`**
- Periodic aggregate metrics (daily, monthly, annual)
- Pre-calculated totals for performance
- Soil score, farmer income, chef income, meals served
- Active network counts (chefs, farmers)
- Community metrics (families supported, scholarships funded)
- UNIQUE constraint on (period, period_start) for data integrity

**Key Features:**
- Event-driven architecture for real-time tracking
- Snapshot system for historical analysis
- Flexible metric system for future expansion
- JSONB metadata for rich context

### 2. Automatic Impact Tracking

**File:** `lib/impact-tracker.ts`

**Functions:**
- `recordImpactEvent()` - Record individual impact event
- `recordBookingImpact()` - Comprehensive impact recording when booking completes

**Auto-Tracking on Booking Completion:**
1. **Soil Impact** - Calculates soil health points from ingredients used
2. **Farmer Income (Role)** - Records income from farmer role assignments
3. **Farmer Income (Ingredients)** - Records income from ingredient sourcing
4. **Chef Income** - Records chef payout income
5. **Meals Served** - Records guest count as meals served
6. **Families Supported** - Estimates families (1 per 4 guests)
7. **Ingredients Sourced** - Counts local ingredients used

**Integration:**
- Triggered automatically in Stripe webhook after balance payment
- Runs after all payouts complete
- Non-blocking (doesn't fail webhook if tracking fails)

### 3. Enhanced Admin Impact Dashboard

**Files:**
- `app/admin/impact/page.tsx` (updated)
- `app/admin/impact/ImpactDashboardClient.tsx` (updated)

**New Features:**
- **Impact Event Feed** - Real-time feed of recent impact events
- **Soil Health Chart** - Total soil health points from regenerative sourcing
- **Farmer Income Chart** - Visual display of farmer income impact
- **Event Type Badges** - Color-coded badges (soil, farmer, chef, guest, community)
- **Event Metadata** - Rich context for each impact event
- **Chronological Timeline** - Events sorted by date

**Metrics Displayed:**
- Total soil health points
- Total farmer income (from events)
- Total meals served (from events)
- Families supported
- Ingredients sourced
- Recent impact events feed

**Route:** `/admin/impact`

### 4. Public Impact Page

**Files:**
- `app/impact/page.tsx` - Public impact page
- `app/impact/PublicImpactClient.tsx` - Client component

**Features:**
- **Hero Section** - "Our Regenerative Impact" with compelling messaging
- **Impact Stats Cards** - Large, visual cards for key metrics
- **"Your Meal Fed a Community" Tracker** - Personalized impact message
- **Live Impact Feed** - Real-time feed of recent impact events
- **Regenerative Story** - Narrative about the movement
- **Call to Action** - Link to booking page
- **Scripture Footer** - Faith-anchored closing

**Metrics Displayed:**
- Total meals served
- Total paid to farmers
- Total soil health points
- Families supported
- Local ingredients sourced

**Route:** `/impact` (public, no authentication required)

### 5. Webhook Integration

**File:** `app/api/stripe/webhook/route.ts` (updated)

**Enhancement:**
- After balance payment completes
- After all payouts process (chef, farmer role, ingredient)
- **Automatically triggers impact recording**
- Records all impact events for the booking
- Logs success/failure (non-blocking)

## Database Migration

**To apply migration:**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase6c-impact-ledger.sql`
3. Run the migration
4. Verify tables created:
   ```sql
   SELECT * FROM impact_events LIMIT 1;
   SELECT * FROM impact_snapshots LIMIT 1;
   ```

## Workflow

### 1. Automatic Impact Recording

1. Customer completes balance payment
2. Stripe webhook: `checkout.session.completed`
3. System processes payouts (chef, farmers, ingredients)
4. **System automatically calls `recordBookingImpact()`**
5. System records impact events:
   - Soil health points (from ingredients)
   - Farmer income (role + ingredient payouts)
   - Chef income (chef payout)
   - Meals served (guest count)
   - Families supported (estimated)
   - Ingredients sourced (count)
6. Events stored in `impact_events` table
7. Events visible in admin dashboard and public page

### 2. Viewing Impact

**Admin Dashboard:**
1. Navigate to `/admin/impact`
2. View aggregate metrics
3. Scroll to "Recent Impact Events" feed
4. See chronological list of all impact events
5. View event details (type, metric, value, description, metadata)

**Public Page:**
1. Navigate to `/impact`
2. View public-facing impact metrics
3. See "Your Meal Fed a Community" tracker
4. Browse live impact feed
5. Read regenerative story
6. Click "Book Your Event" to participate

## Impact Event Types

### Soil Impact (`type: 'soil'`)
- **Metrics:**
  - `soil_health_points` - Regenerative score contribution
  - `ingredients_sourced` - Count of local ingredients
- **Description:** Tracks regenerative agriculture impact
- **Source:** Booking ingredients with regenerative scores

### Farmer Impact (`type: 'farmer'`)
- **Metrics:**
  - `income_cents` - Income generated for farmers
- **Description:** Economic impact on local farmers
- **Source:** Farmer role payouts + ingredient order payouts

### Chef Impact (`type: 'chef'`)
- **Metrics:**
  - `income_cents` - Income generated for chefs
- **Description:** Economic impact on skilled chefs
- **Source:** Chef assignment payouts

### Guest Impact (`type: 'guest'`)
- **Metrics:**
  - `meals_served` - Number of meals
- **Description:** Community nourishment
- **Source:** Booking guest count

### Community Impact (`type: 'community'`)
- **Metrics:**
  - `families_supported` - Families impacted
  - `scholarships_funded` - Educational support (future)
- **Description:** Broader community impact
- **Source:** Estimated from guest count, future scholarship programs

## API Routes

### Public Routes

#### `GET /impact`
Public impact page (server-rendered)

**Response:** HTML page with impact data

### Admin Routes (Server-side data fetching)

Impact data is fetched server-side in page components:
- `app/admin/impact/page.tsx` - Fetches impact events and snapshots
- `app/impact/page.tsx` - Fetches public-safe impact data

## Testing Checklist

### 1. Automatic Impact Recording

- [ ] Complete a booking (deposit + balance)
- [ ] Verify webhook processes payment
- [ ] Check server logs for impact recording
- [ ] Verify impact events created:
  ```sql
  SELECT * FROM impact_events WHERE booking_id = '...' ORDER BY created_at;
  ```
- [ ] Verify all event types recorded (soil, farmer, chef, guest, community)
- [ ] Check event values are correct

### 2. Admin Impact Dashboard

- [ ] Navigate to `/admin/impact`
- [ ] Verify aggregate metrics displayed
- [ ] Check "Recent Impact Events" feed
- [ ] Verify events appear chronologically
- [ ] Check event type badges display correctly
- [ ] Verify event descriptions are readable
- [ ] Check metadata display (if present)

### 3. Public Impact Page

- [ ] Navigate to `/impact` (no login required)
- [ ] Verify hero section displays
- [ ] Check impact stats cards show correct values
- [ ] Verify "Your Meal Fed a Community" tracker
- [ ] Check live impact feed displays events
- [ ] Verify regenerative story section
- [ ] Test "Book Your Event" button links to `/book`

### 4. Impact Event Types

- [ ] **Soil events:** Verify soil_health_points calculated correctly
- [ ] **Farmer events:** Verify income_cents from role + ingredient payouts
- [ ] **Chef events:** Verify income_cents from chef payout
- [ ] **Guest events:** Verify meals_served = guest count
- [ ] **Community events:** Verify families_supported estimated correctly

### 5. Edge Cases

- [ ] **No ingredients:** Should still record other impact types
- [ ] **No farmers assigned:** Should not record farmer income events
- [ ] **No chef assigned:** Should not record chef income events
- [ ] **Zero guests:** Should not record meals_served event
- [ ] **Multiple farmers:** Should record separate farmer income events

## Files Created

1. `supabase/migration-phase6c-impact-ledger.sql` - Database migration
2. `types/impact.ts` - TypeScript types
3. `lib/impact-tracker.ts` - Impact tracking engine
4. `app/impact/page.tsx` - Public impact page
5. `app/impact/PublicImpactClient.tsx` - Public impact client
6. `PHASE6C_IMPACT_LEDGER_SUMMARY.md` - This documentation

## Files Modified

1. `app/api/stripe/webhook/route.ts` - Added impact recording trigger
2. `app/admin/impact/page.tsx` - Enhanced with impact events data
3. `app/admin/impact/ImpactDashboardClient.tsx` - Added impact feed and charts

## Key Features

1. **Automatic Tracking** - No manual intervention required
2. **Comprehensive Coverage** - Tracks all impact dimensions
3. **Real-Time Updates** - Events appear immediately after booking completion
4. **Public Transparency** - Public page shows impact to all visitors
5. **Rich Context** - Metadata stores detailed information
6. **Flexible Metrics** - Easy to add new metric types
7. **Faith-Anchored** - Integrates spiritual dimension

## Impact Calculation Details

### Soil Health Points
```
For each ingredient in booking:
  soil_points = ingredient.regenerative_score * quantity
Total = sum of all ingredient soil points
```

### Farmer Income
```
From role assignments:
  income = sum(booking_farmers.payout_amount_cents where payout_status='paid')

From ingredient orders:
  income = sum(booking_ingredients.total_cents where payout_status='paid')

Total = role income + ingredient income
```

### Meals Served
```
meals = booking.guests (direct count)
```

### Families Supported
```
families = ceil(booking.guests / 4) (estimate: 1 family per 4 guests)
```

## Future Enhancements

1. **Impact Snapshots** - Automated daily/monthly/annual snapshots
2. **Impact Reports** - PDF reports for stakeholders
3. **Scholarship Tracking** - Track educational support programs
4. **Carbon Footprint** - Calculate carbon impact reduction
5. **Water Conservation** - Track water saved through regenerative practices
6. **Biodiversity Impact** - Measure biodiversity improvements
7. **Social Impact** - Track community engagement metrics
8. **Impact Goals** - Set and track impact targets
9. **Impact Certifications** - Generate certificates for bookings
10. **Impact API** - Public API for impact data

## Security Notes

- Public impact page shows aggregate data only (no PII)
- Individual event metadata may contain farmer/chef names (public-safe)
- Admin dashboard requires authentication
- Impact events are read-only after creation
- No user input in impact tracking (prevents manipulation)

## Troubleshooting

### Impact Events Not Recording

**Problem:** Booking completes but no impact events created

**Solution:**
1. Check webhook logs for impact recording calls
2. Verify `recordBookingImpact()` is called
3. Check for errors in impact tracker logs
4. Verify booking has required data (guests, ingredients, payouts)
5. Check database for impact_events records

### Incorrect Impact Values

**Problem:** Impact values don't match expected calculations

**Solution:**
1. Verify booking data (guests, quote_total_cents)
2. Check ingredient regenerative scores
3. Verify payout amounts in booking_farmers and booking_ingredients
4. Check impact event metadata for details
5. Review calculation formulas in `recordBookingImpact()`

### Public Page Shows Zero

**Problem:** Public impact page shows all zeros

**Solution:**
1. Verify impact events exist in database
2. Check query filters in `getPublicImpactData()`
3. Verify event metrics match filter criteria
4. Check for data type issues (value as string vs number)

## Support

For issues:
1. Check server logs for impact tracking errors
2. Verify database migration was applied
3. Check `impact_events` table for records
4. Review webhook logs for impact recording calls
5. Verify booking completion triggers impact recording
6. Check this documentation for troubleshooting steps
