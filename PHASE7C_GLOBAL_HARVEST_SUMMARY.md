# Phase 7C: Global Harvest & Kingdom Capital Engine

## Overview

Phase 7C implements a comprehensive financial and impact tracking system that monitors global regeneration metrics and manages kingdom funds. This system provides transparency into the Bornfidis ecosystem's impact while enabling strategic fund management for specific regenerative initiatives.

## What Was Built

### 1. Database Schema

**File:** `supabase/migration-phase7c-global-harvest.sql`

**New Table: `harvest_metrics`**
- Tracks global regeneration metrics by period
- Fields:
  - `food_tons` - Total food harvested in tons
  - `farmers_supported` - Number of farmers supported
  - `chefs_deployed` - Number of chefs deployed
  - `meals_served` - Total meals served
  - `land_regenerated_acres` - Acres of land regenerated
  - `disciples_trained` - Number of disciples trained
  - `community_events` - Community events hosted
  - `scholarships_funded` - Scholarships funded
- Period-based tracking (period_start, period_end)
- Optional region association

**New Table: `kingdom_funds`**
- Manages different funds for specific purposes
- Fields:
  - `fund_name` - Name of the fund
  - `purpose` - Purpose of the fund
  - `balance_cents` - Current balance (in cents)
  - `target_balance_cents` - Target balance (optional)
  - `fund_type` - Type: general, scholarship, land, training, emergency
  - `is_active` - Active status
- Optional region association

**New Table: `impact_transactions`**
- Tracks all transactions in/out of kingdom funds
- Fields:
  - `fund_id` - Reference to kingdom fund
  - `source` - Source: booking, donation, investment, grant, transfer
  - `source_reference_id` - Reference to source record (booking_id, etc.)
  - `amount_cents` - Transaction amount
  - `transaction_type` - credit or debit
  - `purpose` - Transaction purpose
  - `description` - Transaction description
- Automatic fund balance updates via database trigger

**Key Features:**
- Automatic fund balance updates via PostgreSQL trigger
- Period-based metric tracking
- Multiple fund types for different purposes
- Comprehensive transaction history
- Region association for regional tracking

### 2. Admin Harvest Dashboard

**Files:**
- `app/admin/harvest/page.tsx` - Admin dashboard page
- `app/admin/harvest/HarvestDashboardClient.tsx` - Client component

**Features:**
- **Overview Tab:**
  - Key metrics cards (Food tons, Meals served, Land regenerated, Kingdom funds)
  - Additional metrics (Farmers, Chefs, Disciples)
  - Recent transactions table
- **Metrics Tab:**
  - Full harvest metrics table
  - Period-based view
  - Add metric functionality (placeholder)
- **Funds Tab:**
  - Kingdom funds grid view
  - Balance and target tracking
  - Fund type badges
  - Create fund functionality (placeholder)
- **Transactions Tab:**
  - Complete transaction history
  - Credit/debit indicators
  - Source tracking
  - Purpose display

**Route:** `/admin/harvest`

### 3. Public Impact Page

**Files:**
- `app/impact/page.tsx` - Public impact page
- `app/impact/PublicImpactClient.tsx` - Client component

**Features:**
- **Global Impact Metrics:**
  - Food harvested (tons)
  - Meals served
  - Land regenerated (acres)
  - Kingdom funds total
  - Farmers supported
  - Chefs deployed
  - Disciples trained
  - Community events
- **Kingdom Funds Display:**
  - Active funds with balances
  - Progress toward targets
  - Fund types
- **Global Presence Map:**
  - Active regions display
  - Launch dates
  - Status badges
  - Link to launch a region
- **Invest in Regeneration Section:**
  - Call to action for investors
  - Link to investor portal
  - Link to region leader application

**Route:** `/impact`

### 4. API Routes

**Admin Routes (Require Authentication):**

#### `POST /api/admin/harvest/metrics`
Create a new harvest metric record.

**Request:**
```json
{
  "region_id": "uuid-optional",
  "period_start": "2024-01-01",
  "period_end": "2024-03-31",
  "food_tons": 150,
  "farmers_supported": 25,
  "chefs_deployed": 10,
  "meals_served": 5000,
  "land_regenerated_acres": 50.5,
  "disciples_trained": 15,
  "community_events": 8,
  "scholarships_funded": 5
}
```

#### `POST /api/admin/harvest/funds`
Create a new kingdom fund.

**Request:**
```json
{
  "region_id": "uuid-optional",
  "fund_name": "Scholarship Fund",
  "purpose": "Support education for community members",
  "description": "Funds for training and education",
  "target_balance_cents": 10000000,
  "fund_type": "scholarship",
  "is_active": true
}
```

#### `POST /api/admin/harvest/transactions`
Create a new impact transaction.

**Request:**
```json
{
  "fund_id": "uuid",
  "source": "booking",
  "source_reference_id": "booking-uuid",
  "amount_cents": 50000,
  "transaction_type": "credit",
  "purpose": "Booking payment",
  "description": "Payment from event booking"
}
```

**Note:** Fund balance is automatically updated via database trigger.

## Database Migration

**To apply migration:**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase7c-global-harvest.sql`
3. Run the migration
4. Verify tables created:
   ```sql
   SELECT * FROM harvest_metrics LIMIT 1;
   SELECT * FROM kingdom_funds LIMIT 1;
   SELECT * FROM impact_transactions LIMIT 1;
   ```
5. Verify triggers created:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_fund_balance';
   ```

## Workflow

### 1. Record Harvest Metrics

1. Admin navigates to `/admin/harvest`
2. Switches to "Metrics" tab
3. Clicks "Add Metric"
4. Fills out period and metrics
5. Submits form
6. System creates `harvest_metrics` record

### 2. Create Kingdom Fund

1. Admin navigates to `/admin/harvest`
2. Switches to "Funds" tab
3. Clicks "Create Fund"
4. Fills out fund details (name, purpose, type, target)
5. Submits form
6. System creates `kingdom_funds` record

### 3. Record Transaction

1. Admin navigates to `/admin/harvest`
2. Switches to "Transactions" tab
3. Creates transaction via API
4. System:
   - Creates `impact_transactions` record
   - Automatically updates fund balance via trigger
   - Updates `kingdom_funds.balance_cents`

### 4. View Public Impact

1. Public user visits `/impact`
2. Views global impact metrics
3. Sees kingdom funds and progress
4. Views active regions
5. Can click to invest or launch a region

## Automatic Fund Balance Updates

The system uses a PostgreSQL trigger to automatically update fund balances when transactions are created:

```sql
CREATE TRIGGER trigger_update_fund_balance
  AFTER INSERT ON impact_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_fund_balance();
```

**How it works:**
- When a `credit` transaction is inserted, fund balance increases
- When a `debit` transaction is inserted, fund balance decreases
- Balance is updated atomically with transaction creation
- No manual balance updates needed

## Fund Types

1. **general** - General purpose fund
2. **scholarship** - Education and training scholarships
3. **land** - Land acquisition and regeneration
4. **training** - Training programs
5. **emergency** - Emergency relief and support

## Transaction Sources

1. **booking** - Revenue from event bookings
2. **donation** - Charitable donations
3. **investment** - Impact investments
4. **grant** - Grant funding
5. **transfer** - Transfers between funds

## Testing Checklist

### 1. Database Migration

- [ ] Run migration SQL
- [ ] Verify tables created
- [ ] Verify triggers created
- [ ] Verify RLS policies enabled

### 2. Admin Dashboard

- [ ] Navigate to `/admin/harvest`
- [ ] View overview tab with metrics
- [ ] Switch to metrics tab
- [ ] Switch to funds tab
- [ ] Switch to transactions tab
- [ ] Verify data displays correctly

### 3. Create Harvest Metric

- [ ] Use API or admin UI to create metric
- [ ] Verify metric appears in metrics tab
- [ ] Verify totals update in overview

### 4. Create Kingdom Fund

- [ ] Use API or admin UI to create fund
- [ ] Verify fund appears in funds tab
- [ ] Verify initial balance is 0

### 5. Create Transaction

- [ ] Create credit transaction via API
- [ ] Verify transaction appears in transactions tab
- [ ] Verify fund balance updates automatically
- [ ] Create debit transaction
- [ ] Verify balance decreases correctly

### 6. Public Impact Page

- [ ] Navigate to `/impact` (no login)
- [ ] Verify metrics display correctly
- [ ] Verify kingdom funds display
- [ ] Verify active regions display
- [ ] Test "Invest in Regeneration" links

### 7. Edge Cases

- [ ] **Negative balance:** Should allow negative balances (for tracking)
- [ ] **Invalid period:** Should validate period_start < period_end
- [ ] **Missing fund:** Transaction with invalid fund_id should fail
- [ ] **Zero amount:** Should prevent zero-amount transactions
- [ ] **Large numbers:** Should handle large metric values

## Files Created

1. `supabase/migration-phase7c-global-harvest.sql` - Database migration
2. `types/harvest.ts` - TypeScript types
3. `app/admin/harvest/page.tsx` - Admin dashboard page
4. `app/admin/harvest/HarvestDashboardClient.tsx` - Admin dashboard client
5. `app/api/admin/harvest/metrics/route.ts` - Create metric API
6. `app/api/admin/harvest/funds/route.ts` - Create fund API
7. `app/api/admin/harvest/transactions/route.ts` - Create transaction API
8. `app/impact/page.tsx` - Public impact page (updated)
9. `app/impact/PublicImpactClient.tsx` - Public impact client (updated)
10. `PHASE7C_GLOBAL_HARVEST_SUMMARY.md` - This documentation

## Files Modified

1. `lib/validation.ts` - Added harvest validation schemas

## Key Features

1. **Comprehensive Impact Tracking** - Track food, meals, land, farmers, chefs, disciples, events, scholarships
2. **Kingdom Fund Management** - Multiple funds for different purposes with balance tracking
3. **Automatic Balance Updates** - Database triggers ensure fund balances stay accurate
4. **Transaction History** - Complete audit trail of all fund transactions
5. **Public Transparency** - Public impact page shows global metrics and funds
6. **Period-Based Metrics** - Track impact over time periods
7. **Region Association** - Optional region tracking for regional metrics

## Integration Points

### With Booking System

When a booking is fully paid, you can:
1. Create a transaction to credit a kingdom fund
2. Record harvest metrics for the event
3. Track meals served, farmers supported, etc.

### With Replication System

- Associate metrics with regions
- Track regional impact
- Manage regional funds

### With Impact Ledger (Phase 6C)

- Harvest metrics complement impact events
- Kingdom funds can receive impact investment revenue
- Transactions can reference impact events

## Future Enhancements

1. **Automated Metric Recording** - Auto-record metrics when bookings complete
2. **Fund Allocation Rules** - Automatically allocate booking revenue to funds
3. **Impact Reports** - Generate PDF reports of impact metrics
4. **Donation Integration** - Public donation form for kingdom funds
5. **Goal Tracking** - Visual progress bars for fund targets
6. **Regional Dashboards** - Region-specific impact dashboards
7. **Time Series Charts** - Visualize metrics over time
8. **Export Functionality** - Export metrics and transactions to CSV
9. **Recurring Transactions** - Support for recurring donations/investments
10. **Fund Restrictions** - Rules for when funds can be debited

## Security Notes

- Public impact page shows aggregate data only (no sensitive details)
- Admin routes require authentication
- RLS policies protect database tables
- Transaction creation requires admin authentication
- Fund balances are read-only (updated via triggers only)

## Troubleshooting

### Fund Balance Not Updating

**Problem:** Transaction created but fund balance unchanged

**Solution:**
1. Verify trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_fund_balance';`
2. Check transaction type (credit/debit)
3. Verify fund_id is correct
4. Check database logs for trigger errors
5. Manually verify trigger function: `SELECT update_fund_balance();`

### Metrics Not Displaying

**Problem:** Metrics not showing on public page

**Solution:**
1. Verify metrics exist in database
2. Check RLS policies allow public SELECT
3. Verify date ranges are valid
4. Check for null values in calculations
5. Review server logs for query errors

### Transaction Creation Fails

**Problem:** Cannot create transaction via API

**Solution:**
1. Verify admin authentication
2. Check fund_id exists
3. Validate amount_cents > 0
4. Verify transaction_type is 'credit' or 'debit'
5. Check Zod validation errors

## Next Steps

1. **Run Migration** - Apply database migration
2. **Test Admin Dashboard** - Create test metrics, funds, transactions
3. **Test Public Page** - Verify public impact page displays correctly
4. **Integrate with Bookings** - Auto-record metrics when bookings complete
5. **Set Up Initial Funds** - Create kingdom funds for different purposes
6. **Record Baseline Metrics** - Enter historical metrics if available

## Support

For issues:
1. Check server logs for API errors
2. Verify database migration was applied
3. Check `harvest_metrics`, `kingdom_funds`, `impact_transactions` tables
4. Verify triggers are active
5. Review RLS policies
6. Check this documentation for troubleshooting steps
