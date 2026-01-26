# Phase 8B: Generational Wealth & Housing Covenant

## Overview

Phase 8B implements a faith-aligned housing and inheritance engine for Bornfidis communities. This system enables community-owned housing projects, resident equity tracking, and legacy funds for generational wealth building.

## What Was Built

### 1. Database Schema

**File:** `supabase/migration-phase8b-housing-covenant.sql`

**New Table: `housing_projects`**
- Tracks housing development projects
- Fields:
  - `name`, `region`, `location_address` - Project identification
  - `units_total`, `units_occupied`, `units_available` - Unit tracking
  - `land_owner`, `land_ownership_type` - Land ownership (community, trust, cooperative, individual)
  - `trust_established`, `trust_name`, `trust_established_date` - Trust information
  - `project_status` - planning, development, construction, active, completed
  - `description`, `vision` - Project details
- Automatic unit count updates via trigger

**New Table: `housing_residents`**
- Tracks residents and their equity
- Fields:
  - `name`, `email`, `phone` - Contact information
  - `family_size` - Family size
  - `project_id` - Reference to housing project
  - `equity_cents` - Equity built (in cents)
  - `rent_cents`, `monthly_payment_cents` - Payment tracking
  - `own_by_date` - Target ownership date
  - `move_in_date` - Actual move-in date
  - `status` - applied, approved, active, owner, moved_out
  - `application_date` - Application submission date
- Automatic project unit count updates via trigger

**New Table: `legacy_funds`**
- Tracks family legacy funds for inheritance
- Fields:
  - `family_name`, `region` - Family identification
  - `balance_cents`, `target_balance_cents` - Fund tracking
  - `purpose` - housing, education, land, business, emergency
  - `fund_type` - savings, trust, inheritance, scholarship
  - `description` - Fund description
  - `beneficiary_name`, `beneficiary_relationship` - Beneficiary information
  - `is_active` - Active status

**Key Features:**
- Automatic unit count updates when residents move in/out
- Trust establishment tracking
- Equity building tracking
- Legacy fund management
- Comprehensive indexing for performance

### 2. Admin Housing Dashboard

**Files:**
- `app/admin/housing/page.tsx` - Admin dashboard page
- `app/admin/housing/HousingDashboardClient.tsx` - Client component

**Features:**
- **Overview Tab:**
  - Key metrics (Total Projects, Units, Residents, Legacy Funds)
  - Active projects display
  - Recent residents table
- **Projects Tab:**
  - Project builder interface
  - Full projects table
  - Status tracking
  - Trust establishment indicators
  - Add project functionality (placeholder)
- **Residents Tab:**
  - Resident equity tracker
  - Equity and payment tracking
  - Ownership date tracking
  - Status indicators
  - Add resident functionality (placeholder)
- **Funds Tab:**
  - Trust dashboard
  - Legacy funds display
  - Balance and target tracking
  - Beneficiary information
  - Create fund functionality (placeholder)

**Route:** `/admin/housing`

### 3. Public Housing Page

**Files:**
- `app/housing/page.tsx` - Public housing page
- `app/housing/PublicHousingClient.tsx` - Client component

**Features:**
- **Vision Section:**
  - Housing covenant vision
  - Community ownership principles
  - Equity building approach
  - Generational transfer commitment
- **Housing Covenant:**
  - Commitment to long-term housing
  - Trust-based land ownership
  - Rent-to-own programs
  - Community governance
  - Biblical foundation
- **Active Projects:**
  - Display active housing projects
  - Unit availability
  - Trust establishment status
  - Apply button per project
- **Application Form:**
  - Name, email, phone
  - Family size
  - Project selection
  - Submit application

**Route:** `/housing`

### 4. API Routes

**Public Routes:**

#### `POST /api/housing/apply`
Submit a housing application.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "family_size": 4,
  "project_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "resident_id": "uuid"
}
```

## Database Migration

**To apply migration:**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase8b-housing-covenant.sql`
3. Run the migration
4. Verify tables created:
   ```sql
   SELECT * FROM housing_projects LIMIT 1;
   SELECT * FROM housing_residents LIMIT 1;
   SELECT * FROM legacy_funds LIMIT 1;
   ```
5. Verify triggers created:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_housing_project_units';
   ```

## Workflow

### 1. Create Housing Project

1. Admin navigates to `/admin/housing`
2. Switches to "Projects" tab
3. Clicks "Add Project"
4. Fills out project information:
   - Name, region, location
   - Total units
   - Land ownership type
   - Trust information
   - Project status
5. Submits form
6. System creates `housing_projects` record
7. Units available = units_total initially

### 2. Submit Housing Application (Public)

1. Public user visits `/housing`
2. Views active projects
3. Clicks "Apply for Housing" on a project
4. Fills out application form:
   - Name, email, phone (required)
   - Family size (required)
   - Project selection
5. Submits form
6. System creates `housing_residents` record with `status='applied'`

### 3. Approve Resident (Admin)

1. Admin navigates to `/admin/housing`
2. Switches to "Residents" tab
3. Views applications (status='applied')
4. Updates resident:
   - Set equity_cents, rent_cents, monthly_payment_cents
   - Set own_by_date
   - Change status to 'approved' or 'active'
5. System updates resident record
6. If status becomes 'active', trigger updates project unit counts

### 4. Resident Moves In

1. Admin updates resident:
   - Set `move_in_date`
   - Change status to 'active'
2. System automatically:
   - Increments `units_occupied` on project
   - Decrements `units_available` on project

### 5. Resident Becomes Owner

1. Admin updates resident:
   - Change status to 'owner'
   - Update equity_cents to full amount
2. Resident now owns their home
3. Can transfer to family members

### 6. Create Legacy Fund

1. Admin navigates to `/admin/housing`
2. Switches to "Funds" tab
3. Clicks "Create Fund"
4. Fills out fund:
   - Family name, region
   - Purpose, fund type
   - Target balance
   - Beneficiary information
5. Submits form
6. System creates `legacy_funds` record

## Automatic Unit Count Updates

The system uses a PostgreSQL trigger to automatically update project unit counts:

```sql
CREATE TRIGGER trigger_update_housing_project_units
  AFTER INSERT OR UPDATE OR DELETE ON housing_residents
  FOR EACH ROW
  EXECUTE FUNCTION update_housing_project_units();
```

**How it works:**
- When resident status becomes 'active' or 'owner': increments `units_occupied`, decrements `units_available`
- When resident status changes from 'active' or 'owner': decrements `units_occupied`, increments `units_available`
- When resident is deleted: updates counts if status was 'active' or 'owner'
- Updates happen atomically with resident record changes

## Land Ownership Types

1. **community** - Community-owned land
2. **trust** - Land held in trust
3. **cooperative** - Cooperative ownership
4. **individual** - Individual ownership

## Project Status

1. **planning** - In planning phase
2. **development** - In development
3. **construction** - Under construction
4. **active** - Active and accepting residents
5. **completed** - Project completed

## Resident Status

1. **applied** - Application submitted
2. **approved** - Application approved
3. **active** - Living in housing
4. **owner** - Full ownership achieved
5. **moved_out** - No longer resident

## Legacy Fund Purposes

1. **housing** - Housing-related funds
2. **education** - Education funds
3. **land** - Land acquisition funds
4. **business** - Business investment funds
5. **emergency** - Emergency funds

## Legacy Fund Types

1. **savings** - General savings fund
2. **trust** - Trust fund
3. **inheritance** - Inheritance fund
4. **scholarship** - Scholarship fund

## Testing Checklist

### 1. Database Migration

- [ ] Run migration SQL
- [ ] Verify tables created
- [ ] Verify triggers created
- [ ] Verify RLS policies enabled
- [ ] Test automatic unit count updates

### 2. Admin Dashboard

- [ ] Navigate to `/admin/housing`
- [ ] View overview tab with metrics
- [ ] Switch to projects tab
- [ ] Switch to residents tab
- [ ] Switch to funds tab
- [ ] Verify data displays correctly

### 3. Create Housing Project

- [ ] Use API or admin UI to create project
- [ ] Verify project appears in projects tab
- [ ] Verify unit counts are correct
- [ ] Test trust establishment tracking

### 4. Submit Housing Application

- [ ] Navigate to `/housing` (no login)
- [ ] View active projects
- [ ] Click "Apply for Housing"
- [ ] Fill out application form
- [ ] Submit application
- [ ] Verify success message
- [ ] Check database: `SELECT * FROM housing_residents WHERE status = 'applied'`
- [ ] Verify application appears in admin dashboard

### 5. Approve Resident

- [ ] Navigate to `/admin/housing`
- [ ] View residents tab
- [ ] Find application
- [ ] Update resident (set equity, rent, status)
- [ ] Verify status changes
- [ ] If status becomes 'active', verify unit counts update

### 6. Test Unit Count Updates

- [ ] Create project with 10 units
- [ ] Verify units_available = 10
- [ ] Add resident with status='active'
- [ ] Verify units_occupied = 1, units_available = 9
- [ ] Change resident status to 'owner'
- [ ] Verify counts remain same (1 occupied, 9 available)
- [ ] Change resident status to 'moved_out'
- [ ] Verify units_occupied = 0, units_available = 10

### 7. Create Legacy Fund

- [ ] Use API or admin UI to create fund
- [ ] Verify fund appears in funds tab
- [ ] Verify balance and target display correctly
- [ ] Test beneficiary information

### 8. Edge Cases

- [ ] **Zero units:** Should handle projects with 0 units
- [ ] **Over-occupancy:** Should prevent more residents than units
- [ ] **Invalid project:** Application with invalid project_id should fail
- [ ] **Missing required fields:** Should show validation errors
- [ ] **Negative equity:** Should prevent negative equity values

## Files Created

1. `supabase/migration-phase8b-housing-covenant.sql` - Database migration
2. `types/housing.ts` - TypeScript types
3. `app/admin/housing/page.tsx` - Admin dashboard page
4. `app/admin/housing/HousingDashboardClient.tsx` - Admin dashboard client
5. `app/housing/page.tsx` - Public housing page
6. `app/housing/PublicHousingClient.tsx` - Public housing client
7. `app/api/housing/apply/route.ts` - Submit application API
8. `PHASE8B_HOUSING_COVENANT_SUMMARY.md` - This documentation

## Files Modified

1. `lib/validation.ts` - Added housing validation schemas

## Key Features

1. **Community-Owned Housing** - Land held in trust for community
2. **Equity Building** - Residents build equity toward ownership
3. **Automatic Unit Tracking** - Database triggers update unit counts
4. **Legacy Funds** - Family inheritance funds
5. **Rent-to-Own** - Fair pricing that builds wealth
6. **Generational Transfer** - Homes can be passed to next generation
7. **Trust Establishment** - Track community trusts

## Integration Points

### With Legacy System (Phase 8A)

- Legacy leaders can be associated with housing projects
- Legacy documents can guide housing policies
- Prayer requests can be for housing needs

### With Replication System (Phase 7B)

- Housing projects can be associated with regions
- Regional housing strategies
- Global replication of housing model

### With Impact System (Phase 6C)

- Track housing impact metrics
- Community development impact
- Generational wealth impact

## Future Enhancements

1. **Payment Processing** - Integrate Stripe for rent payments
2. **Equity Calculator** - Calculate equity based on payments
3. **Ownership Transfer** - System for transferring ownership
4. **Maintenance Tracking** - Track property maintenance
5. **Community Governance** - Voting and decision-making
6. **Financial Reporting** - Reports on equity and payments
7. **Document Management** - Store housing documents
8. **Waitlist Management** - Manage application waitlists
9. **Inspection System** - Property inspection tracking
10. **Tenant Portal** - Resident portal for payments and documents

## Security Notes

- Public housing page shows active projects only
- Applications are public (anyone can apply)
- Admin routes require authentication
- RLS policies protect database tables
- Resident data is private (only active/owner status public)

## Troubleshooting

### Unit Counts Not Updating

**Problem:** Resident status changed but unit counts unchanged

**Solution:**
1. Verify trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_housing_project_units';`
2. Check resident status is 'active' or 'owner'
3. Verify project_id is correct
4. Check database logs for trigger errors
5. Manually verify trigger function

### Application Not Submitting

**Problem:** Form submission fails

**Solution:**
1. Check validation errors in form
2. Verify all required fields filled
3. Check email format
4. Verify family_size is at least 1
5. Verify project_id is valid UUID
6. Check server logs for API errors

### Project Units Mismatch

**Problem:** Unit counts don't match actual residents

**Solution:**
1. Count residents with status='active' or 'owner'
2. Compare with units_occupied
3. Recalculate: `UPDATE housing_projects SET units_occupied = (SELECT COUNT(*) FROM housing_residents WHERE project_id = ... AND status IN ('active', 'owner'))`
4. Update units_available = units_total - units_occupied

## Next Steps

1. **Run Migration** - Apply database migration
2. **Create Initial Projects** - Set up first housing projects
3. **Test Application Flow** - Submit test applications
4. **Set Up Trusts** - Establish community trusts
5. **Create Legacy Funds** - Set up initial legacy funds
6. **Public Launch** - Share public housing page

## Support

For issues:
1. Check server logs for API errors
2. Verify database migration was applied
3. Check `housing_projects`, `housing_residents`, `legacy_funds` tables
4. Verify triggers are active
5. Review RLS policies
6. Check this documentation for troubleshooting steps
