# Phase 9A: The Living Testament

## Overview

Phase 9A implements a public covenant, story, and commissioning engine for Bornfidis. This system enables the sharing of testimonies, scripture anchors, and commissioned leaders to tell the Bornfidis story and inspire others to join the movement.

## What Was Built

### 1. Database Schema

**File:** `supabase/migration-phase9a-living-testament.sql`

**New Table: `living_testament`**
- Stores testimonies with scripture anchors
- Fields:
  - `title` - Testimony title
  - `scripture` - Scripture reference (e.g., "Matthew 28:19")
  - `scripture_text` - Full scripture text (optional)
  - `testimony` - The testimony/story text
  - `region` - Geographic region
  - `author_name`, `author_role` - Author information
  - `is_featured` - Featured on public page
  - `is_public` - Public visibility
  - `display_order` - Ordering for display
- Featured testimonies appear prominently on public page

**New Table: `commissioned_leaders`**
- Tracks commissioned leaders and covenant signing
- Fields:
  - `name`, `email`, `phone` - Contact information
  - `role` - founder, elder, pastor, director, coordinator, mentor, chef, farmer
  - `region` - Geographic region
  - `commissioned_at` - Commissioning date
  - `covenant_signed` - Boolean flag
  - `covenant_signed_at` - Auto-set when covenant signed (via trigger)
  - `commissioning_scripture` - Scripture used for commissioning
  - `commissioning_notes` - Notes on commissioning
  - `bio` - Leader biography
  - `photo_url` - Leader photo
  - `is_public` - Public visibility
  - `display_order` - Ordering for display
- Automatic covenant_signed_at timestamp via trigger

**Key Features:**
- Automatic covenant_signed_at timestamp when covenant is signed
- Featured testimonies for prominent display
- Display ordering for custom sorting
- Public/private visibility control
- Comprehensive indexing for performance

### 2. Admin Testament Dashboard

**Files:**
- `app/admin/testament/page.tsx` - Admin dashboard page
- `app/admin/testament/TestamentDashboardClient.tsx` - Client component

**Features:**
- **Overview Tab:**
  - Key metrics (Total Testimonies, Featured, Commissioned Leaders)
  - Featured testimonies display
  - Commissioned leaders preview
- **Testimonies Tab:**
  - Write testimonies interface
  - Full testimonies list
  - Featured/public status indicators
  - Add testimony functionality (placeholder)
- **Leaders Tab:**
  - Commission leaders interface
  - Full leaders table
  - Covenant signing status
  - Commissioning dates
  - Commission leader functionality (placeholder)
- **Scripture Tab:**
  - Instructions for publishing scripture anchors
  - Guidance on using testimonies for scripture

**Route:** `/admin/testament`

### 3. Public Testament Page

**Files:**
- `app/testament/page.tsx` - Public testament page
- `app/testament/PublicTestamentClient.tsx` - Client component

**Features:**
- **The Bornfidis Story:**
  - Origin story
  - Vision and mission
  - Faith foundation
- **Scripture Anchors:**
  - Featured testimonies with scripture
  - Full testimony text
  - Author attribution
- **The Covenant:**
  - Seven core commitments
  - Biblical foundation
  - Community covenant
- **The Commissioning Wall:**
  - Commissioned leaders display
  - Photos, roles, regions
  - Commissioning dates
  - Covenant signing status
  - Commissioning scriptures
- **Join the Movement:**
  - Call to action
  - Links to: Book Event, Launch Region, Invest, Apply for Housing
- **More Testimonies:**
  - Additional non-featured testimonies

**Route:** `/testament`

### 4. API Routes

**Note:** API routes for creating testimonies and commissioning leaders are placeholders in the admin UI. They can be implemented following the same patterns as previous phases.

## Database Migration

**To apply migration:**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase9a-living-testament.sql`
3. Run the migration
4. Verify tables created:
   ```sql
   SELECT * FROM living_testament LIMIT 1;
   SELECT * FROM commissioned_leaders LIMIT 1;
   ```
5. Verify triggers created:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_set_covenant_signed_at';
   ```

## Workflow

### 1. Write Testimony

1. Admin navigates to `/admin/testament`
2. Switches to "Testimonies" tab
3. Clicks "Add Testimony"
4. Fills out testimony:
   - Title
   - Scripture reference (e.g., "Matthew 28:19")
   - Scripture text (optional, full text)
   - Testimony text
   - Author name and role (optional)
   - Region (optional)
   - Featured flag (for prominent display)
   - Public flag
   - Display order
5. Submits form
6. System creates `living_testament` record

### 2. Commission Leader

1. Admin navigates to `/admin/testament`
2. Switches to "Leaders" tab
3. Clicks "Commission Leader"
4. Fills out leader information:
   - Name, email, phone
   - Role
   - Region
   - Commissioning date
   - Commissioning scripture
   - Commissioning notes
   - Bio
   - Photo URL
   - Public flag
   - Display order
5. Submits form
6. System creates `commissioned_leaders` record

### 3. Sign Covenant

1. Admin navigates to `/admin/testament`
2. Switches to "Leaders" tab
3. Finds leader
4. Updates leader:
   - Sets `covenant_signed = true`
5. System automatically:
   - Sets `covenant_signed_at = now()` via trigger
   - Leader appears on public commissioning wall

### 4. View Public Testament

1. Public user visits `/testament`
2. Reads The Bornfidis Story
3. Views featured scripture anchors
4. Reads The Covenant
5. Views The Commissioning Wall
6. Clicks "Join the Movement" links

## Automatic Covenant Timestamp

The system uses a PostgreSQL trigger to automatically set `covenant_signed_at`:

```sql
CREATE TRIGGER trigger_set_covenant_signed_at
  BEFORE UPDATE ON commissioned_leaders
  FOR EACH ROW
  EXECUTE FUNCTION set_covenant_signed_at();
```

**How it works:**
- When `covenant_signed` changes from `false` to `true`: sets `covenant_signed_at = now()`
- When `covenant_signed` changes to `false`: clears `covenant_signed_at`
- Updates happen atomically with leader record changes

## Leader Roles

1. **founder** - Founding leaders
2. **elder** - Elder leaders
3. **pastor** - Pastoral leaders
4. **director** - Directors
5. **coordinator** - Coordinators
6. **mentor** - Mentors
7. **chef** - Chef partners
8. **farmer** - Farmer partners

## Testing Checklist

### 1. Database Migration

- [ ] Run migration SQL
- [ ] Verify tables created
- [ ] Verify triggers created
- [ ] Verify RLS policies enabled
- [ ] Test automatic covenant_signed_at timestamp

### 2. Admin Dashboard

- [ ] Navigate to `/admin/testament`
- [ ] View overview tab with metrics
- [ ] Switch to testimonies tab
- [ ] Switch to leaders tab
- [ ] Switch to scripture tab
- [ ] Verify data displays correctly

### 3. Create Testimony

- [ ] Use API or admin UI to create testimony
- [ ] Set is_featured = true
- [ ] Set is_public = true
- [ ] Verify testimony appears in admin dashboard
- [ ] Verify featured testimony appears on public page

### 4. Commission Leader

- [ ] Use API or admin UI to commission leader
- [ ] Set covenant_signed = false initially
- [ ] Verify leader appears in admin dashboard
- [ ] Update leader: set covenant_signed = true
- [ ] Verify covenant_signed_at is automatically set
- [ ] Set is_public = true
- [ ] Verify leader appears on public commissioning wall

### 5. Public Testament Page

- [ ] Navigate to `/testament` (no login)
- [ ] Verify "The Bornfidis Story" displays
- [ ] Verify featured testimonies display
- [ ] Verify "The Covenant" displays
- [ ] Verify commissioned leaders display (if covenant_signed = true)
- [ ] Verify "Join the Movement" links work
- [ ] Test responsive design

### 6. Edge Cases

- [ ] **Empty data:** Should display appropriate messages
- [ ] **No featured testimonies:** Should handle gracefully
- [ ] **No commissioned leaders:** Should handle gracefully
- [ ] **Long testimonies:** Should handle long text
- [ ] **Missing photos:** Should handle missing photo_url
- [ ] **Invalid scripture:** Should handle invalid scripture references

## Files Created

1. `supabase/migration-phase9a-living-testament.sql` - Database migration
2. `types/testament.ts` - TypeScript types
3. `app/admin/testament/page.tsx` - Admin dashboard page
4. `app/admin/testament/TestamentDashboardClient.tsx` - Admin dashboard client
5. `app/testament/page.tsx` - Public testament page
6. `app/testament/PublicTestamentClient.tsx` - Public testament client
7. `PHASE9A_LIVING_TESTAMENT_SUMMARY.md` - This documentation

## Files Modified

1. `lib/validation.ts` - Added testament validation schemas

## Key Features

1. **Public Storytelling** - Share the Bornfidis story publicly
2. **Scripture Anchors** - Testimonies anchored in scripture
3. **Featured Content** - Highlight important testimonies
4. **Commissioning Wall** - Public display of commissioned leaders
5. **Covenant Signing** - Track covenant commitments
6. **Join the Movement** - Clear calls to action
7. **Display Ordering** - Custom ordering for content

## Integration Points

### With Legacy System (Phase 8A)

- Legacy leaders can be commissioned
- Legacy documents can inform testimonies
- Prayer requests can inspire testimonies

### With Replication System (Phase 7B)

- Regional leaders can be commissioned
- Regional testimonies can be shared
- Global story can be told

### With Housing System (Phase 8B)

- Housing residents can share testimonies
- Community stories can be featured
- Generational covenant alignment

## Future Enhancements

1. **Testimony Submission** - Public form to submit testimonies
2. **Photo Upload** - Upload leader photos directly
3. **Video Testimonies** - Support for video content
4. **Testimony Categories** - Categorize testimonies
5. **Search Functionality** - Search testimonies by scripture or keyword
6. **Social Sharing** - Share testimonies on social media
7. **Email Newsletter** - Feature testimonies in newsletters
8. **Testimony Timeline** - Visual timeline of testimonies
9. **Leader Profiles** - Detailed leader profile pages
10. **Commissioning Ceremony** - Track commissioning ceremonies

## Security Notes

- Public testament page shows public content only
- Admin routes require authentication
- RLS policies protect database tables
- Testimonies can be public or private
- Leaders can be public or private
- Only covenant-signed leaders appear on public wall

## Troubleshooting

### Testimony Not Displaying

**Problem:** Testimony not showing on public page

**Solution:**
1. Verify `is_public = true` in database
2. Verify `is_featured = true` for featured section
3. Check RLS policies allow public SELECT
4. Verify display_order is set correctly
5. Review server logs for query errors

### Covenant Timestamp Not Setting

**Problem:** covenant_signed_at not updating

**Solution:**
1. Verify trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_set_covenant_signed_at';`
2. Check covenant_signed is being set to true
3. Verify trigger function works: `SELECT set_covenant_signed_at();`
4. Check database logs for trigger errors
5. Manually verify trigger function

### Leader Not on Commissioning Wall

**Problem:** Leader not appearing on public wall

**Solution:**
1. Verify `is_public = true`
2. Verify `covenant_signed = true`
3. Check display_order is set
4. Verify commissioned_at is set
5. Review public page query logic

## Next Steps

1. **Run Migration** - Apply database migration
2. **Create Initial Testimonies** - Write founding testimonies
3. **Commission Founders** - Commission founding leaders
4. **Sign Covenants** - Sign covenants for commissioned leaders
5. **Public Launch** - Share public testament page
6. **Gather More Testimonies** - Collect testimonies from community

## Support

For issues:
1. Check server logs for API errors
2. Verify database migration was applied
3. Check `living_testament`, `commissioned_leaders` tables
4. Verify triggers are active
5. Review RLS policies
6. Check this documentation for troubleshooting steps
