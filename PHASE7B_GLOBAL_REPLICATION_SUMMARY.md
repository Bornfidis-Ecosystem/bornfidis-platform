# Phase 7B: Bornfidis Global Replication Engine

## Overview

Phase 7B implements a comprehensive replication system that enables the Bornfidis model to be launched anywhere in the world. This creates a franchise + cooperative hybrid model where regional leaders can apply to launch hubs, access replication kits, and connect with impact investors.

## What Was Built

### 1. Database Schema

**File:** `supabase/migration-phase7b-global-replication.sql`

**New Table: `replication_regions`**
- Regional hub applications and tracking
- Leader information (name, email, bio, experience)
- Status tracking: inquiry → approved → launching → active
- Impact goals and vision
- Capital needs and fundraising progress
- Target communities and expected network size
- Launch date tracking

**New Table: `replication_kits`**
- Knowledge/content kits for launching hubs
- Kit types: chef, farm, market, housing, education
- Version control for kit updates
- Required/optional designation
- Prerequisites system
- Public/private visibility
- Estimated completion time, difficulty level

**New Table: `impact_investors`**
- Investor applications and tracking
- Capital committed vs. paid
- Investment types: grant, loan, equity, donation
- Region interests
- Status tracking: inquiry → committed → paid → active
- Terms and expected returns

**New Table: `replication_region_kits`**
- Tracks kit completion per region
- Status: not_started → in_progress → completed
- Completion timestamps
- Notes

**Key Features:**
- Comprehensive replication tracking
- Knowledge management system
- Investor pipeline management
- Launch readiness tracking

### 2. Admin Replication Dashboard

**Files:**
- `app/admin/replication/page.tsx` - Admin dashboard page
- `app/admin/replication/ReplicationDashboardClient.tsx` - Client component

**Features:**
- **Key Metrics:**
  - Total regions, active regions, launching regions
  - Capital raised and committed
  - Total replication kits
  - Impact investor count
- **Tabbed Interface:**
  - Regions tab - View and manage region applications
  - Kits tab - View and manage replication kits
  - Investors tab - View and manage impact investors
- **Region Management:**
  - Approve/reject region applications
  - View region details (leader, capital needs, status)
  - Status badges (inquiry, approved, launching, active)
- **Kit Management:**
  - View all kits by type
  - Required kit indicators
  - Public/private visibility
  - Version tracking

**API Routes:**
- `POST /api/admin/replication/regions/[id]/approve` - Approve region
- `POST /api/admin/replication/regions/[id]/reject` - Reject region

**Route:** `/admin/replication`

### 3. Public Replication Pages

**Files:**
- `app/replicate/page.tsx` - Public replication page
- `app/replicate/PublicReplicationClient.tsx` - Client component
- `app/replicate/apply-leader/page.tsx` - Region leader application
- `app/replicate/apply-leader/RegionLeaderApplicationForm.tsx` - Application form
- `app/replicate/apply-leader/thank-you/page.tsx` - Thank you page
- `app/replicate/invest/page.tsx` - Impact investor portal
- `app/replicate/invest/ImpactInvestorForm.tsx` - Investor form
- `app/replicate/invest/thank-you/page.tsx` - Thank you page

**Features:**
- **Overview Section:**
  - Replication model explanation
  - What you get (kits, platform, training, network)
  - Process overview
- **Region Leader Application:**
  - Region information (name, country, city, description)
  - Leader information (name, email, bio, experience)
  - Vision & goals (impact goal, expected farmers/chefs, capital needed)
- **Impact Investor Portal:**
  - Investor information
  - Investment details (regions of interest, capital committed, investment type)
  - Links (website, LinkedIn)
- **Active Regions Display:**
  - Shows approved, launching, and active regions
  - Launch dates

**API Routes:**
- `POST /api/replication/apply-leader` - Submit region leader application
- `POST /api/replication/invest` - Submit investor application

**Routes:**
- `/replicate` - Public replication page
- `/replicate/apply-leader` - Region leader application
- `/replicate/invest` - Impact investor portal

## Database Migration

**To apply migration:**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase7b-global-replication.sql`
3. Run the migration
4. Verify tables created:
   ```sql
   SELECT * FROM replication_regions LIMIT 1;
   SELECT * FROM replication_kits LIMIT 1;
   SELECT * FROM impact_investors LIMIT 1;
   SELECT * FROM replication_region_kits LIMIT 1;
   ```

## Workflow

### 1. Region Leader Applies

1. Potential leader visits `/replicate/apply-leader`
2. Fills out application form:
   - Region information (name, country, city, description)
   - Leader information (name, email, bio, experience)
   - Vision & goals (impact goal, expected network size, capital needs)
3. Submits application
4. System creates `replication_regions` record with `status='inquiry'`

### 2. Admin Approves Region

1. Admin navigates to `/admin/replication`
2. Views regions tab
3. Reviews region application
4. Clicks "Approve"
5. System updates `status='approved'`, sets `approved_at`, `approved_by`
6. Region can now access replication kits and begin launch planning

### 3. Region Completes Kits

1. Approved region accesses replication kits
2. Completes required kits (chef, farm, market, housing, education)
3. System tracks completion in `replication_region_kits`
4. When all required kits completed, region can move to `status='launching'`

### 4. Region Launches

1. Admin updates region `status='launching'` or `'active'`
2. Sets `launch_date` and `launched_at`
3. Region becomes operational hub
4. Joins global cooperative network

### 5. Impact Investor Applies

1. Investor visits `/replicate/invest`
2. Fills out investor form:
   - Personal/organization information
   - Regions of interest
   - Capital committed
   - Investment type
3. Submits application
4. System creates `impact_investors` record with `status='inquiry'`

### 6. Admin Manages Investors

1. Admin navigates to `/admin/replication`
2. Views investors tab
3. Reviews investor applications
4. Updates status (committed, paid, active)
5. Tracks capital committed vs. paid

## Replication Kit System

### Kit Types

1. **Chef Kit** - Chef network development and training
2. **Farm Kit** - Farmer network and regenerative agriculture
3. **Market Kit** - Market development and sales systems
4. **Housing Kit** - Housing and community infrastructure
5. **Education Kit** - Education and training programs

### Kit Features

- **Version Control** - Track kit versions (1.0, 2.1, etc.)
- **Required/Optional** - Mark kits as required for launch
- **Prerequisites** - Define prerequisite kits
- **Public/Private** - Control visibility
- **Resources** - Attach PDFs, videos, links
- **Difficulty Levels** - beginner, intermediate, advanced
- **Completion Tracking** - Track which regions completed which kits

## API Routes

### Public Routes

#### `POST /api/replication/apply-leader`
Submit region leader application.

**Request:**
```json
{
  "name": "Bornfidis Kingston",
  "country": "Jamaica",
  "city": "Kingston",
  "leader_name": "John Leader",
  "leader_email": "john@example.com",
  "impact_goal": "Serve 10 communities...",
  "expected_farmers": 20,
  "expected_chefs": 10,
  "capital_needed_cents": 5000000
}
```

#### `POST /api/replication/invest`
Submit impact investor application.

**Request:**
```json
{
  "name": "Jane Investor",
  "email": "jane@example.com",
  "organization": "Impact Fund",
  "region_interest": ["Jamaica", "Caribbean"],
  "capital_committed_cents": 10000000,
  "investment_type": "grant"
}
```

### Admin Routes (Require Authentication)

#### `POST /api/admin/replication/regions/[id]/approve`
Approve region application.

**Response:**
```json
{
  "success": true,
  "message": "Region approved successfully"
}
```

#### `POST /api/admin/replication/regions/[id]/reject`
Reject region application.

**Request:**
```json
{
  "reason": "Insufficient capital plan"
}
```

## Testing Checklist

### 1. Region Leader Application

- [ ] Navigate to `/replicate/apply-leader`
- [ ] Fill out application form
- [ ] Submit application
- [ ] Verify redirect to thank you page
- [ ] Check database: `SELECT * FROM replication_regions WHERE leader_email = '...'`
- [ ] Verify `status = 'inquiry'`

### 2. Admin Region Approval

- [ ] Navigate to `/admin/replication`
- [ ] View regions tab
- [ ] View pending region application
- [ ] Click "Approve"
- [ ] Verify status updated to 'approved'
- [ ] Check `approved_at` and `approved_by` set

### 3. Impact Investor Application

- [ ] Navigate to `/replicate/invest`
- [ ] Fill out investor form
- [ ] Add regions of interest
- [ ] Set capital committed
- [ ] Submit application
- [ ] Verify redirect to thank you page
- [ ] Check database: `SELECT * FROM impact_investors WHERE email = '...'`
- [ ] Verify `status = 'inquiry'`

### 4. Admin Dashboard

- [ ] Navigate to `/admin/replication`
- [ ] Verify metrics display correctly
- [ ] Switch between tabs (regions, kits, investors)
- [ ] Test approve/reject region actions
- [ ] Verify status badges display correctly

### 5. Public Replication Page

- [ ] Navigate to `/replicate` (no login)
- [ ] Verify overview section displays
- [ ] Test tab navigation (overview, leader, investor)
- [ ] Verify active regions display
- [ ] Test "Apply as Leader" and "Invest in Impact" buttons

### 6. Edge Cases

- [ ] **Duplicate email:** Should prevent duplicate region leader applications
- [ ] **Invalid capital:** Should handle negative or invalid amounts
- [ ] **Missing required fields:** Should show validation errors
- [ ] **Empty regions list:** Should display appropriate message

## Files Created

1. `supabase/migration-phase7b-global-replication.sql` - Database migration
2. `types/replication.ts` - TypeScript types
3. `app/admin/replication/page.tsx` - Admin dashboard page
4. `app/admin/replication/ReplicationDashboardClient.tsx` - Admin dashboard client
5. `app/api/admin/replication/regions/[id]/approve/route.ts` - Approve region API
6. `app/api/admin/replication/regions/[id]/reject/route.ts` - Reject region API
7. `app/replicate/page.tsx` - Public replication page
8. `app/replicate/PublicReplicationClient.tsx` - Public replication client
9. `app/replicate/apply-leader/page.tsx` - Region leader application page
10. `app/replicate/apply-leader/RegionLeaderApplicationForm.tsx` - Application form
11. `app/replicate/apply-leader/thank-you/page.tsx` - Thank you page
12. `app/api/replication/apply-leader/route.ts` - Apply leader API
13. `app/replicate/invest/page.tsx` - Impact investor portal page
14. `app/replicate/invest/ImpactInvestorForm.tsx` - Investor form
15. `app/replicate/invest/thank-you/page.tsx` - Thank you page
16. `app/api/replication/invest/route.ts` - Invest API
17. `PHASE7B_GLOBAL_REPLICATION_SUMMARY.md` - This documentation

## Files Modified

1. `lib/validation.ts` - Added replication validation schemas

## Key Features

1. **Franchise + Cooperative Hybrid** - Combines structured replication with cooperative governance
2. **Knowledge Management** - Replication kits for systematic launch
3. **Investor Pipeline** - Track and manage impact investors
4. **Launch Tracking** - Complete lifecycle from inquiry to active hub
5. **Global Reach** - Support for launching hubs anywhere
6. **Impact Focus** - Track impact goals and outcomes per region

## Replication Kit System Details

### Kit Structure

**Required Kits (for launch):**
- Chef network kit
- Farmer network kit
- Market development kit

**Optional Kits:**
- Housing infrastructure kit
- Education programs kit

### Kit Content

Each kit includes:
- Step-by-step guides
- Templates and resources
- Training materials
- Best practices
- Case studies
- Tools and checklists

### Completion Tracking

- Regions must complete required kits before launching
- System tracks completion status
- Admin can view which kits each region has completed
- Prerequisites enforced (must complete prerequisite kits first)

## Investor Pipeline

### Investment Types

1. **Grant** - Non-repayable funding
2. **Loan** - Repayable with interest
3. **Equity** - Ownership stake
4. **Donation** - Charitable contribution

### Pipeline Stages

1. **Inquiry** - Initial application submitted
2. **Committed** - Capital committed but not yet paid
3. **Paid** - Capital actually received
4. **Active** - Ongoing investor relationship

### Capital Tracking

- `capital_committed_cents` - Amount investor commits to
- `capital_paid_cents` - Amount actually paid
- Tracks per investor and aggregates for regions

## Security Notes

- Public application forms use Zod validation
- Admin routes require authentication
- Region applications are read-only after submission
- Investor applications are read-only after submission
- Email uniqueness enforced for regions and investors

## Troubleshooting

### Region Application Not Submitting

**Problem:** Form submission fails

**Solution:**
1. Check validation errors in form
2. Verify all required fields filled
3. Check email format
4. Verify capital amount is valid number
5. Check server logs for API errors

### Admin Cannot Approve Region

**Problem:** Approve button doesn't work

**Solution:**
1. Verify admin authentication
2. Check API route permissions
3. Verify region exists in database
4. Check for duplicate email conflicts
5. Review server logs

### Investor Capital Not Tracking

**Problem:** Capital committed not showing correctly

**Solution:**
1. Verify capital_committed_cents is stored correctly (in cents)
2. Check conversion from dollars to cents
3. Verify database field type (integer)
4. Check display formatting (formatUSD function)

## Next Steps (Future Enhancements)

1. **Kit Builder UI** - Admin interface for creating/editing kits
2. **Region Portal** - Dashboard for region leaders to track progress
3. **Investor Portal** - Dashboard for investors to track investments
4. **Launch Checklist** - Automated checklist based on kit completion
5. **Mentorship Program** - Connect new regions with active hubs
6. **Regional Metrics** - Track impact per region
7. **Knowledge Base** - Searchable library of replication resources
8. **Community Forum** - Connect regional leaders
9. **Funding Platform** - Crowdfunding for regional launches
10. **Success Stories** - Showcase successful regional launches

## Support

For issues:
1. Check server logs for application errors
2. Verify database migration was applied
3. Check `replication_regions`, `replication_kits`, `impact_investors` tables
4. Verify validation schemas match form fields
5. Review API route logs
6. Check this documentation for troubleshooting steps
