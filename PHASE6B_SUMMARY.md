# Phase 6B: Ingredient Sourcing Engine (Island Harvest Hub)

## Overview

Phase 6B extends the Island Harvest Hub with an intelligent ingredient sourcing system that automatically matches booking menus to regenerative farmers, generates purchase orders, and tracks fulfillment. This creates a complete supply chain management system that supports local agriculture and measures regenerative impact.

## What Was Built

### 1. Database Schema

**File:** `supabase/migration-phase6b-ingredient-sourcing.sql`

**New Table: `ingredients`**
- Ingredient catalog with name, category, unit
- Regenerative score (0-100 scale)
- Seasonality tracking
- Search keywords for discovery
- Active/inactive status

**New Table: `farmer_ingredients`**
- Links farmers to ingredients they supply
- Pricing per unit
- Availability status (in_stock, limited, out_of_season)
- Certification tracking
- Regenerative practices notes
- UNIQUE constraint: (farmer_id, ingredient_id)

**New Table: `booking_ingredients`**
- Ingredients needed for each booking
- Matched to specific farmers
- Quantity, unit, pricing
- Fulfillment status (pending, confirmed, delivered, paid)
- Payout status tracking
- Transfer ID for Stripe payouts
- UNIQUE constraint: (booking_id, ingredient_id, farmer_id)

**Key Features:**
- Supports multiple farmers per ingredient (backup suppliers)
- Tracks fulfillment lifecycle
- Independent payout tracking per ingredient order
- Regenerative score aggregation

### 2. Ingredient Catalog Management

**Files:**
- `app/admin/ingredients/page.tsx` - Admin ingredients page
- `app/admin/ingredients/IngredientsClient.tsx` - Client component
- `app/api/admin/ingredients/route.ts` - CRUD API

**Features:**
- **Create Ingredients** - Add new ingredients to catalog
- **Category Filtering** - Filter by produce, fish, meat, dairy, spice, beverage
- **Regenerative Score** - Visual score display with color coding
- **Stats Dashboard** - Total ingredients, counts by category
- **Active/Inactive** - Toggle ingredient availability

**Route:** `/admin/ingredients`

### 3. Farmer Ingredients Assignment

**Files:**
- `app/admin/farmers/[id]/ingredients/page.tsx` - Farmer ingredients page
- `app/admin/farmers/[id]/ingredients/FarmerIngredientsClient.tsx` - Client component
- `app/api/admin/farmer-ingredients/route.ts` - Create API
- `app/api/admin/farmer-ingredients/[id]/route.ts` - Delete API

**Features:**
- **Assign Ingredients** - Link ingredients to farmers
- **Set Pricing** - Price per unit in USD
- **Availability Status** - in_stock, limited, out_of_season
- **Certification Toggle** - Mark as certified (Organic, Fair Trade, etc.)
- **Regenerative Practices** - Notes on practices for specific ingredients
- **Remove Assignment** - Unlink ingredients from farmers

**Route:** `/admin/farmers/[id]/ingredients`

### 4. Booking Ingredient Sourcing

**Files:**
- `app/admin/bookings/[id]/IngredientSourcingSection.tsx` - Sourcing component
- `app/api/admin/bookings/[id]/ingredients/route.ts` - Get booking ingredients
- `app/api/admin/bookings/[id]/ingredients/match/route.ts` - Auto-match API
- `app/api/admin/bookings/[id]/ingredients/orders/route.ts` - Generate orders API

**Features:**
- **Add Ingredients** - Select ingredients and quantities needed
- **Auto-Match Farmers** - Intelligent matching algorithm:
  - Prefers in_stock availability
  - Prioritizes certified farmers
  - Sorts by price (lowest first)
  - Shows top 3 matches per ingredient
  - Falls back to limited availability if needed
- **Generate Purchase Orders** - Creates `booking_ingredients` records
- **View Orders** - Display all purchase orders with status
- **Fulfillment Tracking** - pending → confirmed → delivered → paid

**Auto-Matching Algorithm:**
1. Find farmers with ingredient in_stock
2. Filter to approved farmers only
3. Sort by certified (preferred), then price
4. Return top 3 matches
5. Fallback to limited availability if no in_stock

### 5. Ingredient Payout Engine

**File:** `lib/ingredient-payout-engine.ts`

**Functions:**
- `tryPayoutForBookingIngredient(bookingIngredientId)` - Process payout for single ingredient
- `tryPayoutsForBookingIngredients(bookingId)` - Process payouts for all ingredients in booking

**Payout Eligibility Checks:**
1. ✅ Ingredient order exists
2. ✅ Not already paid (idempotency)
3. ✅ Payout not on hold
4. ✅ Fulfillment status = delivered or paid
5. ✅ Job completed (preferred)
6. ✅ Booking payout not on hold
7. ✅ Farmer Stripe Connect connected
8. ✅ Farmer payouts enabled

**Flow:**
```
1. Check booking_ingredients for order
2. Verify not already paid (check transfer_id)
3. Check payout_status != 'on_hold'
4. Check fulfillment_status = 'delivered' or 'paid'
5. Check booking.job_completed_at (preferred)
6. Check booking.payout_hold = false
7. Verify farmer Stripe Connect status
8. Create Stripe transfer
9. Update booking_ingredients.payout_status = 'paid'
```

### 6. Webhook Integration

**File:** `app/api/stripe/webhook/route.ts` (updated)

**Enhancement:**
- After balance payment completes
- **Also triggers ingredient payouts** for all delivered ingredients
- Processes all eligible ingredient orders in parallel
- Logs success/failure for each ingredient payout

### 7. Regenerative Impact Dashboard

**Files:**
- `app/admin/impact/page.tsx` - Impact dashboard page
- `app/admin/impact/ImpactDashboardClient.tsx` - Client component

**Metrics Displayed:**
- **Regenerative Score** - Average score across all ingredients (0-100)
- **Farmer Income** - Total paid to farmers (from both role assignments and ingredient orders)
- **Community Meals** - Estimated meals funded (1 meal per $50 revenue)
- **Network Size** - Total farmers and chefs
- **Revenue Stats** - Total revenue, completed bookings, average per booking
- **Network Stats** - Active farmers, chefs, ingredients sourced, average farmer income

**Visual Features:**
- Color-coded regenerative score (green/yellow/red)
- Progress bars for scores
- Gradient impact card
- Scripture footer

**Route:** `/admin/impact`

## Database Migration

**To apply migration:**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase6b-ingredient-sourcing.sql`
3. Run the migration
4. Verify tables created:
   ```sql
   SELECT * FROM ingredients LIMIT 1;
   SELECT * FROM farmer_ingredients LIMIT 1;
   SELECT * FROM booking_ingredients LIMIT 1;
   ```

## Workflow

### 1. Admin Creates Ingredient Catalog

1. Navigate to `/admin/ingredients`
2. Click "+ Add Ingredient"
3. Fill out form:
   - Name (e.g., "Scotch Bonnet Peppers")
   - Category (produce, fish, meat, dairy, spice, beverage)
   - Unit (lb, kg, bunch, bottle)
   - Regenerative Score (0-100)
   - Seasonality (optional)
   - Notes (optional)
4. Click "Create Ingredient"
5. Ingredient added to catalog

### 2. Admin Assigns Ingredients to Farmers

1. Navigate to `/admin/farmers`
2. Click on a farmer
3. Navigate to "Ingredients" tab (or `/admin/farmers/[id]/ingredients`)
4. Click "+ Add Ingredient"
5. Select ingredient from dropdown
6. Set price per unit
7. Set availability (in_stock, limited, out_of_season)
8. Toggle certified if applicable
9. Add regenerative practices notes
10. Click "Add Ingredient"
11. Ingredient linked to farmer

### 3. Admin Sources Ingredients for Booking

1. Navigate to booking detail page
2. Scroll to "Ingredient Sourcing" section
3. Click "+ Add Ingredients"
4. Add ingredients needed:
   - Select ingredient from dropdown
   - Enter quantity
   - Enter unit (defaults to ingredient's unit)
5. Click "Auto-Match Farmers"
6. System finds matching farmers:
   - Shows top 3 matches per ingredient
   - Displays price, availability, certification
   - Shows regenerative score
7. Review matches
8. Click "Generate Purchase Orders"
9. System creates `booking_ingredients` records
10. Orders appear in "Purchase Orders" table

### 4. Fulfillment Tracking

1. Admin marks ingredient as "Confirmed" (manual or via API)
2. Farmer delivers ingredient
3. Admin marks as "Delivered"
4. System processes payment (after booking completion)
5. Ingredient marked as "Paid"

### 5. Automatic Ingredient Payouts

1. Customer completes balance payment
2. Webhook: `checkout.session.completed`
3. System marks booking `fully_paid_at`
4. **Automatically triggers:**
   - Chef payout (if assigned)
   - Farmer role payouts (if assigned)
   - **Ingredient payouts** (for all delivered ingredients)
5. For each ingredient:
   - Checks eligibility (delivered, completion, hold, Stripe status)
   - Creates Stripe transfer
   - Updates `booking_ingredients.payout_status='paid'`

## API Routes

### Admin Routes (Require Authentication)

#### `GET /api/admin/ingredients`
Get all ingredients.

**Response:**
```json
{
  "success": true,
  "ingredients": [...]
}
```

#### `POST /api/admin/ingredients`
Create ingredient.

**Request:**
```json
{
  "name": "Scotch Bonnet Peppers",
  "category": "produce",
  "unit": "lb",
  "regenerative_score": 75,
  "seasonality": "Year-round",
  "notes": "Hot pepper variety"
}
```

#### `POST /api/admin/farmer-ingredients`
Add ingredient to farmer.

**Request:**
```json
{
  "farmer_id": "uuid",
  "ingredient_id": "uuid",
  "price_cents": 500,
  "availability": "in_stock",
  "certified": true,
  "regenerative_practices": "Organic, no pesticides"
}
```

#### `GET /api/admin/bookings/[id]/ingredients`
Get booking ingredients.

**Response:**
```json
{
  "success": true,
  "booking_ingredients": [
    {
      "id": "uuid",
      "ingredient": {...},
      "farmer": {...},
      "quantity": 10,
      "unit": "lb",
      "price_cents": 500,
      "total_cents": 5000,
      "fulfillment_status": "pending"
    }
  ]
}
```

#### `POST /api/admin/bookings/[id]/ingredients/match`
Auto-match farmers for ingredients.

**Request:**
```json
{
  "ingredients": [
    {
      "ingredient_id": "uuid",
      "quantity": 10,
      "unit": "lb"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "matches": [
    {
      "ingredient_id": "uuid",
      "ingredient_name": "Scotch Bonnet Peppers",
      "category": "produce",
      "quantity": 10,
      "unit": "lb",
      "matched_farmers": [
        {
          "farmer_id": "uuid",
          "farmer_name": "Green Valley Farm",
          "price_cents": 500,
          "availability": "in_stock",
          "regenerative_score": 75,
          "certified": true
        }
      ]
    }
  ]
}
```

#### `POST /api/admin/bookings/[id]/ingredients/orders`
Generate purchase orders from matches.

**Request:**
```json
{
  "matches": [...]
}
```

**Response:**
```json
{
  "success": true,
  "orders_created": 3,
  "errors": []
}
```

## Testing Checklist

### 1. Ingredient Catalog

- [ ] Navigate to `/admin/ingredients`
- [ ] Create new ingredient
- [ ] Verify ingredient appears in list
- [ ] Filter by category
- [ ] Check regenerative score display
- [ ] Verify stats update

### 2. Farmer Ingredients

- [ ] Navigate to `/admin/farmers/[id]/ingredients`
- [ ] Add ingredient to farmer
- [ ] Set price, availability, certification
- [ ] Verify ingredient appears in assigned list
- [ ] Remove ingredient assignment
- [ ] Verify ingredient removed

### 3. Ingredient Sourcing

- [ ] Navigate to booking detail page
- [ ] Scroll to "Ingredient Sourcing"
- [ ] Add ingredients (multiple)
- [ ] Click "Auto-Match Farmers"
- [ ] Verify matches displayed
- [ ] Review match details (price, availability, certification)
- [ ] Click "Generate Purchase Orders"
- [ ] Verify orders created in table
- [ ] Check total cost calculation

### 4. Auto-Matching Logic

- [ ] Test with in_stock ingredient → should find matches
- [ ] Test with limited availability → should find fallback
- [ ] Test with out_of_season → should show no matches
- [ ] Test with certified preference → certified farmers first
- [ ] Test price sorting → lowest price first

### 5. Fulfillment Tracking

- [ ] Create ingredient order
- [ ] Verify status = "pending"
- [ ] Update to "confirmed" (via API or admin action)
- [ ] Update to "delivered"
- [ ] Verify status updates correctly

### 6. Ingredient Payouts

- [ ] Create ingredient order
- [ ] Mark as delivered
- [ ] Complete booking payment
- [ ] Verify webhook triggers ingredient payout
- [ ] Check `booking_ingredients.payout_status = 'paid'`
- [ ] Check Stripe transfer created
- [ ] Verify `transfer_id` stored

### 7. Impact Dashboard

- [ ] Navigate to `/admin/impact`
- [ ] Verify regenerative score displayed
- [ ] Check farmer income calculation
- [ ] Verify community meals estimate
- [ ] Check network stats
- [ ] Verify all metrics update correctly

### 8. Edge Cases

- [ ] **No farmers for ingredient:** Should show "No farmers found"
- [ ] **Multiple farmers same ingredient:** Should show all matches
- [ ] **Duplicate order:** Should prevent duplicate (UNIQUE constraint)
- [ ] **Payout on hold:** Should block ingredient payout
- [ ] **Not delivered:** Should block payout until delivered
- [ ] **Stripe not connected:** Should block payout

## Files Created

1. `supabase/migration-phase6b-ingredient-sourcing.sql` - Database migration
2. `types/ingredient.ts` - TypeScript types
3. `app/admin/ingredients/page.tsx` - Ingredients catalog page
4. `app/admin/ingredients/IngredientsClient.tsx` - Ingredients client
5. `app/api/admin/ingredients/route.ts` - Ingredients API
6. `app/admin/farmers/[id]/ingredients/page.tsx` - Farmer ingredients page
7. `app/admin/farmers/[id]/ingredients/FarmerIngredientsClient.tsx` - Farmer ingredients client
8. `app/api/admin/farmer-ingredients/route.ts` - Create farmer ingredient API
9. `app/api/admin/farmer-ingredients/[id]/route.ts` - Delete farmer ingredient API
10. `app/admin/bookings/[id]/IngredientSourcingSection.tsx` - Sourcing component
11. `app/api/admin/bookings/[id]/ingredients/route.ts` - Get booking ingredients API
12. `app/api/admin/bookings/[id]/ingredients/match/route.ts` - Auto-match API
13. `app/api/admin/bookings/[id]/ingredients/orders/route.ts` - Generate orders API
14. `lib/ingredient-payout-engine.ts` - Ingredient payout engine
15. `app/admin/impact/page.tsx` - Impact dashboard page
16. `app/admin/impact/ImpactDashboardClient.tsx` - Impact dashboard client
17. `PHASE6B_SUMMARY.md` - This documentation

## Files Modified

1. `lib/validation.ts` - Added ingredient validation schemas
2. `app/admin/bookings/[id]/BookingDetailClient.tsx` - Added ingredient sourcing section
3. `app/api/stripe/webhook/route.ts` - Added ingredient payout triggers

## Key Features

1. **Intelligent Auto-Matching** - Finds best farmers based on availability, certification, price
2. **Regenerative Scoring** - Tracks and displays regenerative impact
3. **Fulfillment Lifecycle** - Complete tracking from order to payment
4. **Automatic Payouts** - Ingredient payouts trigger after delivery and booking completion
5. **Impact Dashboard** - Visual metrics for regenerative impact
6. **Multi-Supplier Support** - Can have backup suppliers for same ingredient

## Auto-Matching Algorithm Details

**Priority Order:**
1. **Availability:** in_stock > limited > out_of_season
2. **Certification:** Certified farmers preferred
3. **Price:** Lower price preferred (after certification)
4. **Farmer Status:** Only approved farmers

**Matching Process:**
```
For each ingredient:
  1. Find all farmer_ingredients with ingredient_id
  2. Filter to approved farmers only
  3. Filter by availability (prefer in_stock)
  4. Sort by certified (desc), then price (asc)
  5. Take top 3 matches
  6. If no in_stock, try limited availability
  7. Return matches with farmer details
```

## Ingredient Payout Eligibility Matrix

| Condition | Required | Blocks If Missing |
|-----------|----------|-------------------|
| Ingredient order exists | ✅ | Yes |
| Not already paid | ✅ | Yes (idempotency) |
| Payout not on hold | ✅ | Yes |
| Fulfillment = delivered/paid | ✅ | Yes |
| Job completed | ⚠️ | Preferred (can pay after delivery) |
| Booking payout not on hold | ✅ | Yes |
| Farmer Stripe connected | ✅ | Yes |
| Farmer payouts enabled | ✅ | Yes |

## Regenerative Impact Metrics

**Regenerative Score:**
- Average of all ingredient scores used in bookings
- Weighted by usage (if implemented)
- Color-coded: Green (70+), Yellow (40-69), Red (<40)

**Farmer Income:**
- Sum of all farmer payouts (role assignments + ingredient orders)
- Tracks total economic impact on local farmers

**Community Meals:**
- Estimate: 1 meal per $50 revenue
- Shows social impact of platform

**Network Size:**
- Active farmers (approved status)
- Active chefs (approved/active status)
- Total ingredients sourced

## Security Notes

- All admin routes require authentication
- Ingredient orders respect booking permissions
- Payout operations respect idempotency
- Transfer IDs prevent duplicate payouts
- UNIQUE constraints prevent duplicate assignments/orders

## Troubleshooting

### Auto-Match Not Finding Farmers

**Problem:** No matches found for ingredient

**Solution:**
1. Check if ingredient assigned to any farmers
2. Verify farmer status = 'approved'
3. Check availability (in_stock or limited)
4. Verify farmer_ingredients records exist

### Ingredient Payout Not Triggering

**Problem:** Balance paid but ingredient payout not processed

**Solution:**
1. Check webhook logs for ingredient payout attempts
2. Verify `fulfillment_status = 'delivered'` or 'paid'
3. Verify `job_completed_at` is set (preferred)
4. Check `payout_hold = false` on booking
5. Check farmer Stripe Connect status
6. Verify `booking_ingredients.payout_status = 'pending'`
7. Check `transfer_id` is null (not already paid)

### Impact Dashboard Shows Zero

**Problem:** All metrics showing zero

**Solution:**
1. Verify bookings have `quote_total_cents` set
2. Check for completed bookings (`job_completed_at` and `fully_paid_at`)
3. Verify farmers have ingredient assignments
4. Check ingredient orders exist
5. Verify payouts have been processed

## Next Steps (Future Enhancements)

1. **Bulk Ingredient Import** - CSV import for ingredient catalog
2. **Seasonal Availability** - Auto-update availability based on season
3. **Price History** - Track price changes over time
4. **Supplier Ratings** - Rate farmers on quality, reliability
5. **Inventory Management** - Track farmer inventory levels
6. **Delivery Scheduling** - Coordinate delivery times
7. **Ingredient Substitutions** - Suggest alternatives when unavailable
8. **Recipe Integration** - Auto-generate ingredient lists from recipes
9. **Impact Reports** - Detailed PDF reports for stakeholders
10. **Farmer Dashboard** - Farmers can view their orders and earnings

## Support

For issues:
1. Check server logs for detailed errors
2. Verify database migration was applied
3. Check `ingredients`, `farmer_ingredients`, `booking_ingredients` tables
4. Verify Stripe Connect is enabled for farmers
5. Review payout engine logs for blockers
6. Check webhook logs for ingredient payout attempts
7. Review this documentation for troubleshooting steps
