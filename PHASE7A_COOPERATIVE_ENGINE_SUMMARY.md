# Phase 7A: Bornfidis Global Regenerative Cooperative Engine

## Overview

Phase 7A implements a comprehensive cooperative platform that onboards, governs, and distributes wealth across farmers, chefs, educators, builders, and partners. This creates a democratic, impact-driven model where members share in the cooperative's success based on their contributions.

## What Was Built

### 1. Database Schema

**File:** `supabase/migration-phase7a-cooperative-engine.sql`

**New Table: `cooperative_members`**
- Member profiles with name, email, role, region
- Role types: farmer, chef, educator, builder, partner
- Status tracking: pending, active, inactive, suspended
- Impact score (0-1000 scale) - calculated monthly
- Payout share percentage - calculated from impact scores
- Links to existing farmers/chefs (optional)
- Profile fields: bio, website, Instagram

**New Table: `cooperative_payouts`**
- Historical payout records
- Period tracking (monthly, quarterly, annual)
- Payout calculation details (impact score, share %, total profit)
- Payment tracking (Stripe transfer ID, status)
- Links to members

**New Table: `cooperative_training`**
- Training content catalog
- Tracks: food, soil, faith, enterprise
- Required/optional training designation
- Role-specific requirements
- Sort ordering, active status
- Estimated duration, video links, resources

**New Table: `cooperative_member_training`**
- Tracks training completion per member
- Optional scores/assessments
- Completion timestamps

**Key Features:**
- Impact-driven wealth distribution
- Training and education system
- Multi-role support
- Regional organization
- Historical payout tracking

### 2. Impact Score Calculation Engine

**File:** `lib/cooperative-impact-calculator.ts`

**Functions:**
- `calculateMemberImpactScore(memberId)` - Calculate score for single member
- `calculateAllMemberImpactScores()` - Calculate scores for all active members

**Impact Score Components (0-1000 scale):**

**For Farmers:**
- Ingredients sourced: 10 points per ingredient order
- Farmer role assignments: 20 points per assignment
- Regenerative practices: 15 points per certification

**For Chefs:**
- Completed bookings: 30 points per booking
- Meals served: 1 point per 10 meals

**For All Members:**
- Training completion: 5 points per training
- Community engagement: 2 points per impact event (capped at 100)

**For Special Roles:**
- Educators: 50 base points
- Builders: 50 base points
- Partners: 50 base points

**Calculation Process:**
1. Fetch member and linked farmer/chef records
2. Calculate role-specific contributions
3. Add training completion points
4. Add community engagement points
5. Add role-specific bonuses
6. Cap at 1000 points
7. Update member record

### 3. Profit Distribution Engine

**File:** `lib/cooperative-payout-engine.ts`

**Functions:**
- `calculatePayoutShares()` - Calculate payout percentages for all members
- `distributeCooperativePayouts(period, periodType, totalProfitCents)` - Create and process payouts

**Payout Share Calculation:**
```
For each active member:
  share = (member.impact_score / total_impact_score) * 100
  Normalize so total shares = 100%
```

**Payout Distribution Process:**
1. Calculate payout shares for all active members
2. For each member:
   - Calculate payout amount: `total_profit * (share_percent / 100)`
   - Create payout record
   - Find Stripe account (from linked farmer/chef)
   - Create Stripe transfer
   - Update payout status
3. Return results with success/failure counts

### 4. Admin Cooperative Dashboard

**Files:**
- `app/admin/cooperative/page.tsx` - Admin dashboard page
- `app/admin/cooperative/CooperativeDashboardClient.tsx` - Client component

**Features:**
- **Key Metrics:**
  - Total members, active members
  - Total payouts distributed
  - Average impact score
  - Training count
- **Governance Controls:**
  - "Calculate Impact Scores" button - Recalculates all member scores
  - "Distribute Payouts" button - Distributes profits for a period
- **Members by Role** - Visual breakdown
- **Members List** - Table with impact scores, payout shares, status
- **Recent Payouts** - Table of recent payout distributions

**API Routes:**
- `POST /api/admin/cooperative/calculate-impact` - Calculate all impact scores
- `POST /api/admin/cooperative/distribute-payouts` - Distribute payouts

**Route:** `/admin/cooperative`

### 5. Public Cooperative Pages

**Files:**
- `app/cooperative/page.tsx` - Public cooperative page
- `app/cooperative/PublicCooperativeClient.tsx` - Client component
- `app/cooperative/join/page.tsx` - Join application page
- `app/cooperative/join/CooperativeJoinForm.tsx` - Application form
- `app/cooperative/join/thank-you/page.tsx` - Thank you page
- `app/api/cooperative/join/route.ts` - Join API

**Features:**
- **Vision Story** - Narrative about the cooperative
- **Stats Display** - Total members, members by role
- **Regions Map** - Global reach visualization
- **Join Section** - Call to action with application link
- **Featured Members** - Showcase top members
- **Application Form** - Role selection, region, bio, links
- **Thank You Page** - Confirmation after application

**Routes:**
- `/cooperative` - Public cooperative page
- `/cooperative/join` - Application form
- `/cooperative/join/thank-you` - Confirmation page

## Database Migration

**To apply migration:**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase7a-cooperative-engine.sql`
3. Run the migration
4. Verify tables created:
   ```sql
   SELECT * FROM cooperative_members LIMIT 1;
   SELECT * FROM cooperative_payouts LIMIT 1;
   SELECT * FROM cooperative_training LIMIT 1;
   SELECT * FROM cooperative_member_training LIMIT 1;
   ```

## Workflow

### 1. Member Applies

1. Potential member visits `/cooperative/join`
2. Fills out application form:
   - Name, email, phone
   - Role (farmer, chef, educator, builder, partner)
   - Region
   - Bio, website, Instagram
   - Optional: Link to existing farmer/chef record
3. Submits application
4. System creates `cooperative_members` record with `status='pending'`

### 2. Admin Approves Member

1. Admin navigates to `/admin/cooperative`
2. Views pending applications
3. Approves member (sets `status='active'`)
4. Member becomes active and eligible for impact scoring

### 3. Monthly Impact Score Calculation

1. Admin clicks "Calculate Impact Scores"
2. System:
   - Fetches all active members
   - Calculates impact score for each member
   - Updates `impact_score` in database
3. Impact scores reflect current contributions

### 4. Monthly Payout Distribution

1. Admin clicks "Distribute Payouts"
2. Enters:
   - Period (e.g., "2024-01" for January 2024)
   - Total cooperative profit (USD)
3. System:
   - Calculates payout shares based on impact scores
   - Creates payout records for each member
   - Processes Stripe transfers for members with connected accounts
   - Updates payout status
4. Payouts appear in "Recent Payouts" table

## Impact Score Calculation Details

### Score Components

**Base Components (All Members):**
- Training completion: 5 points per training
- Community engagement: 2 points per impact event (max 100)

**Farmer Components:**
- Ingredients sourced: 10 points × ingredient orders
- Farmer assignments: 20 points × role assignments
- Certifications: 15 points × certification count

**Chef Components:**
- Completed bookings: 30 points × bookings
- Meals served: 1 point per 10 meals

**Role Bonuses:**
- Educator: +50 base points
- Builder: +50 base points
- Partner: +50 base points

**Maximum Score:** 1000 points

### Example Calculation

**Farmer Member:**
- 5 ingredient orders: 50 points
- 3 role assignments: 60 points
- 2 certifications: 30 points
- 4 trainings completed: 20 points
- 10 impact events: 20 points
- **Total: 180 points**

**Chef Member:**
- 10 completed bookings: 300 points
- 200 meals served: 20 points
- 6 trainings completed: 30 points
- 15 impact events: 30 points
- **Total: 380 points**

## Payout Distribution Details

### Share Calculation

```
Total Impact Score = sum(all active members' impact scores)

For each member:
  payout_share_percent = (member.impact_score / total_impact_score) * 100

Normalize so sum of all shares = 100%
```

### Payout Amount

```
For each member:
  payout_amount_cents = total_profit_cents * (payout_share_percent / 100)
```

### Example Distribution

**Cooperative Profit: $10,000 (1,000,000 cents)**

**Members:**
- Farmer A: 180 points → 18% share → $1,800
- Chef B: 380 points → 38% share → $3,800
- Educator C: 200 points → 20% share → $2,000
- Builder D: 150 points → 15% share → $1,500
- Partner E: 90 points → 9% share → $900

**Total: 1000 points → 100% → $10,000**

## API Routes

### Public Routes

#### `POST /api/cooperative/join`
Submit cooperative membership application.

**Request:**
```json
{
  "name": "John Farmer",
  "email": "john@example.com",
  "phone": "876-123-4567",
  "role": "farmer",
  "region": "Jamaica",
  "bio": "Regenerative farmer...",
  "website_url": "https://...",
  "instagram_handle": "@johnfarmer"
}
```

### Admin Routes (Require Authentication)

#### `POST /api/admin/cooperative/calculate-impact`
Calculate impact scores for all active members.

**Response:**
```json
{
  "success": true,
  "members_updated": 25,
  "errors": []
}
```

#### `POST /api/admin/cooperative/distribute-payouts`
Distribute cooperative payouts for a period.

**Request:**
```json
{
  "period": "2024-01",
  "period_type": "monthly",
  "total_profit_cents": 1000000
}
```

**Response:**
```json
{
  "success": true,
  "payouts_created": 25,
  "payouts_paid": 20,
  "errors": ["No Stripe account for member X", "..."]
}
```

## Testing Checklist

### 1. Member Application

- [ ] Navigate to `/cooperative/join`
- [ ] Fill out application form
- [ ] Select role (try different roles)
- [ ] Submit application
- [ ] Verify redirect to thank you page
- [ ] Check database: `SELECT * FROM cooperative_members WHERE email = '...'`
- [ ] Verify `status = 'pending'`

### 2. Admin Approval

- [ ] Navigate to `/admin/cooperative`
- [ ] View pending member
- [ ] Approve member (update status to 'active')
- [ ] Verify member appears in active members list

### 3. Impact Score Calculation

- [ ] Ensure member has contributions (bookings, ingredients, etc.)
- [ ] Click "Calculate Impact Scores"
- [ ] Verify calculation completes
- [ ] Check member's impact score updated:
  ```sql
  SELECT impact_score FROM cooperative_members WHERE id = '...';
  ```
- [ ] Verify score matches expected calculation

### 4. Payout Share Calculation

- [ ] Calculate impact scores for all members
- [ ] Verify payout shares calculated:
  ```sql
  SELECT payout_share_percent FROM cooperative_members WHERE status = 'active';
  ```
- [ ] Verify sum of shares ≈ 100%

### 5. Payout Distribution

- [ ] Click "Distribute Payouts"
- [ ] Enter period (e.g., "2024-01")
- [ ] Enter total profit (e.g., 10000)
- [ ] Verify payouts created:
  ```sql
  SELECT * FROM cooperative_payouts WHERE period = '2024-01';
  ```
- [ ] Verify payout amounts match shares
- [ ] Check Stripe transfers created for members with accounts
- [ ] Verify payout status updated

### 6. Public Pages

- [ ] Navigate to `/cooperative` (no login)
- [ ] Verify vision story displays
- [ ] Check stats show correct member counts
- [ ] Verify regions map displays
- [ ] Test "Join the Cooperative" button links to `/cooperative/join`
- [ ] Check featured members display

### 7. Edge Cases

- [ ] **No contributions:** Member with 0 impact score should get 0% share
- [ ] **Equal scores:** Members with same score should get equal shares
- [ ] **No Stripe account:** Payout should be created but status = 'pending'
- [ ] **Zero profit:** Should handle gracefully
- [ ] **Duplicate period:** Should prevent duplicate payouts

## Files Created

1. `supabase/migration-phase7a-cooperative-engine.sql` - Database migration
2. `types/cooperative.ts` - TypeScript types
3. `lib/cooperative-impact-calculator.ts` - Impact score calculation engine
4. `lib/cooperative-payout-engine.ts` - Profit distribution engine
5. `app/admin/cooperative/page.tsx` - Admin dashboard page
6. `app/admin/cooperative/CooperativeDashboardClient.tsx` - Admin dashboard client
7. `app/api/admin/cooperative/calculate-impact/route.ts` - Calculate impact API
8. `app/api/admin/cooperative/distribute-payouts/route.ts` - Distribute payouts API
9. `app/cooperative/page.tsx` - Public cooperative page
10. `app/cooperative/PublicCooperativeClient.tsx` - Public cooperative client
11. `app/cooperative/join/page.tsx` - Join application page
12. `app/cooperative/join/CooperativeJoinForm.tsx` - Application form
13. `app/cooperative/join/thank-you/page.tsx` - Thank you page
14. `app/api/cooperative/join/route.ts` - Join API
15. `PHASE7A_COOPERATIVE_ENGINE_SUMMARY.md` - This documentation

## Files Modified

1. `lib/validation.ts` - Added cooperative validation schemas

## Key Features

1. **Impact-Driven Distribution** - Wealth shared based on contributions, not ownership
2. **Multi-Role Support** - Farmers, chefs, educators, builders, partners
3. **Automatic Calculation** - Impact scores and payout shares calculated automatically
4. **Stripe Integration** - Automatic payouts via Stripe Connect
5. **Training System** - Education and capacity building
6. **Global Reach** - Regional organization and tracking
7. **Transparent Governance** - Admin controls for calculation and distribution

## Automation (Future Implementation)

### Monthly Automation

**Option 1: Cron Job / Scheduled Function**
```typescript
// Run monthly on 1st of month
async function monthlyCooperativeProcess() {
  // 1. Calculate impact scores
  await calculateAllMemberImpactScores()
  
  // 2. Calculate payout shares
  await calculatePayoutShares()
  
  // 3. Get total profit for previous month
  const previousMonth = getPreviousMonth() // e.g., "2024-01"
  const totalProfit = await getCooperativeProfit(previousMonth)
  
  // 4. Distribute payouts
  await distributeCooperativePayouts(
    previousMonth,
    'monthly',
    totalProfit
  )
}
```

**Option 2: API Endpoint + External Scheduler**
- Create `/api/admin/cooperative/monthly-process` endpoint
- Use Vercel Cron, GitHub Actions, or external scheduler
- Call endpoint monthly

**Option 3: Supabase Database Functions**
- Create PostgreSQL function for monthly process
- Schedule with pg_cron extension

## Security Notes

- Public join form uses Zod validation
- Admin routes require authentication
- Impact scores are read-only after calculation (prevent manipulation)
- Payout shares calculated server-side (never trust client)
- Stripe transfers respect idempotency
- UNIQUE constraints prevent duplicate payouts

## Troubleshooting

### Impact Score Not Calculating

**Problem:** Member has contributions but score is 0

**Solution:**
1. Verify member status = 'active'
2. Check linked farmer_id/chef_id if applicable
3. Verify contributions exist (bookings, ingredients, etc.)
4. Check calculation logs for errors
5. Review impact calculation formula

### Payout Shares Don't Sum to 100%

**Problem:** Total payout shares ≠ 100%

**Solution:**
1. Check normalization logic in `calculatePayoutShares()`
2. Verify all active members included
3. Check for rounding errors
4. Review share calculation formula

### Payouts Not Processing

**Problem:** Payouts created but not paid via Stripe

**Solution:**
1. Verify member has linked farmer_id or chef_id
2. Check farmer/chef has Stripe Connect account
3. Verify Stripe Connect status = 'connected'
4. Check payouts_enabled = true
5. Review payout engine logs for errors

## Next Steps (Future Enhancements)

1. **Member Portal** - Dashboard for members to view their impact, payouts, training
2. **Voting System** - Democratic governance for cooperative decisions
3. **Training Platform** - Interactive training with quizzes and certificates
4. **Impact Reports** - Detailed reports for members and stakeholders
5. **Automated Monthly Process** - Scheduled monthly calculation and distribution
6. **Cooperative Rules** - Document and enforce cooperative bylaws
7. **Member Directory** - Public directory of cooperative members
8. **Regional Chapters** - Organize members by region with local leadership
9. **Scholarship Program** - Track and distribute educational scholarships
10. **Cooperative Metrics** - Advanced analytics and reporting

## Support

For issues:
1. Check server logs for calculation/distribution errors
2. Verify database migration was applied
3. Check `cooperative_members`, `cooperative_payouts` tables
4. Verify Stripe Connect is enabled for linked farmers/chefs
5. Review impact calculation logs
6. Check payout distribution logs
7. Review this documentation for troubleshooting steps
