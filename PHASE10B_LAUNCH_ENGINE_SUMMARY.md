# Phase 10B: Launch & Storytelling Engine

## Overview

Phase 10B implements a comprehensive launch and storytelling system that equips Bornfidis to launch publicly with story, testimony, and momentum. This system enables public story submissions, video content, press kit management, and partner inquiries.

## What Was Built

### 1. Database Schema

**File:** `supabase/migration-phase10b-launch-engine.sql`

**New Table: `stories`**
- Public story submissions with moderation
- Fields:
  - `title`, `author_name`, `author_email`, `author_role`, `author_region` - Author information
  - `story_text` - Story content
  - `video_url`, `image_url` - Media attachments
  - `category` - testimony, impact, farmer, chef, community, partner
  - `is_featured` - Featured on homepage/stories page
  - `is_approved` - Admin approval status
  - `is_public` - Public visibility
  - `submitted_at`, `approved_at`, `approved_by` - Submission and approval tracking
  - `display_order` - Custom ordering
- Automatic `approved_at` timestamp via trigger

**New Table: `press_kit`**
- Press kit documents for media
- Fields:
  - `title`, `description` - Kit information
  - `file_url` - URL to PDF/document
  - `file_type` - pdf, zip, doc
  - `file_size_bytes` - File size
  - `version` - Version tracking
  - `is_active` - Active status
  - `download_count` - Download tracking
- Download count tracking

**New Table: `partner_inquiries`**
- Partner interest submissions
- Fields:
  - `organization_name`, `contact_name`, `contact_email`, `contact_phone` - Contact information
  - `organization_type` - media, nonprofit, business, church, government, other
  - `partnership_interest` - sponsorship, collaboration, media, distribution, other
  - `message` - Inquiry message
  - `website_url` - Organization website
  - `status` - submitted, reviewed, contacted, partnered, declined
  - `reviewed_at`, `reviewed_by` - Review tracking
  - `notes` - Admin notes

**Key Features:**
- Automatic `approved_at` timestamp when story is approved
- Download count tracking for press kits
- Status tracking for partner inquiries
- Comprehensive indexing for performance

### 2. Public Launch Pages

**File:** `app/launch/page.tsx`
- Launch announcement page
- Launch timeline
- Call to action grid
- Links to all launch resources

**File:** `app/stories/page.tsx` + `StoriesClient.tsx`
- Public stories page
- Featured stories display
- Category filtering
- Story submission form
- Video and image support

**File:** `app/documentary/page.tsx`
- Video content page
- Embeds YouTube/Vimeo videos
- Stories with video URLs
- Responsive video players

**File:** `app/press/page.tsx` + `PressClient.tsx`
- Press kit page
- Download press kits
- Download count tracking
- Media guidelines
- Press contact information

**File:** `app/partners/page.tsx` + `PartnersClient.tsx`
- Partner inquiry page
- Partnership opportunities
- Inquiry form
- Organization type selection

### 3. Admin Stories Dashboard

**Files:**
- `app/admin/stories/page.tsx` - Admin dashboard page
- `app/admin/stories/StoriesDashboardClient.tsx` - Client component

**Features:**
- **Filter Tabs:**
  - All stories
  - Pending (not approved)
  - Approved (not featured)
  - Featured
- **Story Management:**
  - Approve stories
  - Feature/unfeature stories
  - Publish/unpublish stories
  - View story details
  - Category badges
  - Status indicators

**Route:** `/admin/stories`

### 4. API Routes

**Public Routes:**

#### `POST /api/stories/submit`
Submit a story for review.

**Request:**
```json
{
  "title": "My Bornfidis Story",
  "author_name": "John Doe",
  "author_email": "john@example.com",
  "story_text": "My story about Bornfidis...",
  "category": "testimony",
  "video_url": "https://youtube.com/...",
  "image_url": "https://..."
}
```

#### `POST /api/partners/inquire`
Submit a partner inquiry.

**Request:**
```json
{
  "organization_name": "Example Org",
  "contact_name": "Jane Doe",
  "contact_email": "jane@example.com",
  "organization_type": "nonprofit",
  "partnership_interest": "collaboration",
  "message": "We'd like to partner..."
}
```

#### `POST /api/press/download/[id]`
Track press kit download.

**Admin Routes:**

#### `POST /api/admin/stories/[id]/approve`
Approve a story.

#### `POST /api/admin/stories/[id]/feature`
Feature/unfeature a story.

#### `POST /api/admin/stories/[id]/publish`
Publish/unpublish a story.

## Database Migration

**To apply migration:**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase10b-launch-engine.sql`
3. Run the migration
4. Verify tables created:
   ```sql
   SELECT * FROM stories LIMIT 1;
   SELECT * FROM press_kit LIMIT 1;
   SELECT * FROM partner_inquiries LIMIT 1;
   ```
5. Verify triggers created:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_set_story_approved_at';
   ```

## Workflow

### 1. Submit Story (Public)

1. Public user visits `/stories`
2. Clicks "Share Your Story"
3. Fills out story form:
   - Title, name, email (optional)
   - Story text (minimum 50 characters)
   - Category selection
   - Video/image URLs (optional)
4. Submits form
5. System creates `stories` record with `is_approved=false`, `is_public=false`

### 2. Approve Story (Admin)

1. Admin navigates to `/admin/stories`
2. Views pending stories
3. Reviews story content
4. Clicks "Approve"
5. System updates:
   - `is_approved = true`
   - `approved_at = now()` (via trigger)
   - Story can now be featured/published

### 3. Feature Story (Admin)

1. Admin navigates to `/admin/stories`
2. Finds approved story
3. Clicks "Feature"
4. System updates `is_featured = true`
5. Story appears in featured section on public pages

### 4. Publish Story (Admin)

1. Admin navigates to `/admin/stories`
2. Finds approved story
3. Clicks "Publish"
4. System updates `is_public = true`
5. Story appears on public `/stories` page

### 5. Download Press Kit (Public)

1. Public user visits `/press`
2. Views available press kits
3. Clicks "Download"
4. System:
   - Increments `download_count`
   - Opens file URL
5. Download is tracked

### 6. Submit Partner Inquiry (Public)

1. Public user visits `/partners`
2. Fills out partner inquiry form
3. Submits form
4. System creates `partner_inquiries` record with `status='submitted'`
5. Admin can review and update status

## Video Embed System

**Supported Platforms:**
- YouTube (youtube.com/watch?v=, youtu.be/)
- Vimeo (vimeo.com/)

**How it works:**
- Extracts video ID from URL
- Converts to embed URL
- Displays in responsive iframe
- Maintains 16:9 aspect ratio

## Story Categories

1. **testimony** - Personal testimonies
2. **impact** - Impact stories
3. **farmer** - Farmer stories
4. **chef** - Chef stories
5. **community** - Community stories
6. **partner** - Partner stories

## Partner Organization Types

1. **media** - Media organizations
2. **nonprofit** - Nonprofit organizations
3. **business** - Businesses
4. **church** - Churches
5. **government** - Government entities
6. **other** - Other organizations

## Partnership Interests

1. **sponsorship** - Financial sponsorship
2. **collaboration** - Program collaboration
3. **media** - Media coverage
4. **distribution** - Distribution partnership
5. **other** - Other interests

## Testing Checklist

### 1. Database Migration

- [ ] Run migration SQL
- [ ] Verify tables created
- [ ] Verify triggers created
- [ ] Verify RLS policies enabled
- [ ] Test automatic approved_at timestamp

### 2. Submit Story

- [ ] Navigate to `/stories`
- [ ] Click "Share Your Story"
- [ ] Fill out form
- [ ] Submit story
- [ ] Verify success message
- [ ] Check database: `SELECT * FROM stories WHERE is_approved = false`

### 3. Admin Approve Story

- [ ] Navigate to `/admin/stories`
- [ ] View pending stories
- [ ] Click "Approve"
- [ ] Verify story moves to approved
- [ ] Verify `approved_at` is set

### 4. Feature Story

- [ ] Navigate to `/admin/stories`
- [ ] Find approved story
- [ ] Click "Feature"
- [ ] Verify story shows as featured
- [ ] Check public page: story appears in featured section

### 5. Publish Story

- [ ] Navigate to `/admin/stories`
- [ ] Find approved story
- [ ] Click "Publish"
- [ ] Verify story shows as public
- [ ] Check public `/stories` page: story appears

### 6. Video Embed

- [ ] Submit story with YouTube URL
- [ ] Verify video embeds correctly
- [ ] Test with Vimeo URL
- [ ] Verify responsive sizing

### 7. Press Kit Download

- [ ] Navigate to `/press`
- [ ] Click "Download" on press kit
- [ ] Verify file downloads
- [ ] Check database: `download_count` incremented

### 8. Partner Inquiry

- [ ] Navigate to `/partners`
- [ ] Fill out inquiry form
- [ ] Submit form
- [ ] Verify success message
- [ ] Check database: `SELECT * FROM partner_inquiries`

### 9. Public Pages

- [ ] Navigate to `/launch`
- [ ] Navigate to `/documentary`
- [ ] Navigate to `/stories`
- [ ] Navigate to `/press`
- [ ] Navigate to `/partners`
- [ ] Verify all pages load correctly

### 10. Edge Cases

- [ ] **Invalid video URL:** Should handle gracefully
- [ ] **Missing required fields:** Should show validation errors
- [ ] **Long story text:** Should handle long content
- [ ] **Duplicate submissions:** Should allow (no prevention)
- [ ] **Empty press kits:** Should show appropriate message

## Files Created

1. `supabase/migration-phase10b-launch-engine.sql` - Database migration
2. `types/launch.ts` - TypeScript types
3. `app/launch/page.tsx` - Launch page
4. `app/stories/page.tsx` - Stories page
5. `app/stories/StoriesClient.tsx` - Stories client
6. `app/stories/StorySubmissionForm.tsx` - Story submission form
7. `app/documentary/page.tsx` - Documentary page
8. `app/press/page.tsx` - Press page
9. `app/press/PressClient.tsx` - Press client
10. `app/partners/page.tsx` - Partners page
11. `app/partners/PartnersClient.tsx` - Partners client
12. `app/api/stories/submit/route.ts` - Submit story API
13. `app/api/partners/inquire/route.ts` - Partner inquiry API
14. `app/api/press/download/[id]/route.ts` - Track download API
15. `app/admin/stories/page.tsx` - Admin stories page
16. `app/admin/stories/StoriesDashboardClient.tsx` - Admin stories client
17. `app/api/admin/stories/[id]/approve/route.ts` - Approve story API
18. `app/api/admin/stories/[id]/feature/route.ts` - Feature story API
19. `app/api/admin/stories/[id]/publish/route.ts` - Publish story API
20. `PHASE10B_LAUNCH_ENGINE_SUMMARY.md` - This documentation

## Files Modified

1. `lib/validation.ts` - Added launch validation schemas

## Key Features

1. **Public Story Submissions** - Anyone can submit stories
2. **Moderation System** - Admin approval before publishing
3. **Video Support** - YouTube and Vimeo embeds
4. **Image Support** - Image URLs for stories
5. **Category Filtering** - Filter stories by category
6. **Featured Stories** - Highlight important stories
7. **Press Kit Management** - Download tracking and versioning
8. **Partner Pipeline** - Track partner inquiries and status

## Integration Points

### With Homepage (Phase 10A)

- Featured stories can appear on homepage
- Testimony slider can use stories
- Launch page linked from homepage

### With Testament (Phase 9A)

- Stories complement living testament
- Can cross-reference testimonies and stories
- Shared storytelling ecosystem

### With Impact (Phase 6C)

- Impact stories category
- Stories can reference impact metrics
- Visual storytelling of impact

## Future Enhancements

1. **Image Upload** - Direct image upload (not just URLs)
2. **Video Upload** - Direct video upload support
3. **Story Editing** - Allow authors to edit their stories
4. **Email Notifications** - Notify when story is approved
5. **Story Comments** - Public comments on stories
6. **Story Sharing** - Social media sharing buttons
7. **Press Release System** - Automated press releases
8. **Media Gallery** - Photo/video gallery
9. **Story Analytics** - View counts, engagement metrics
10. **Bulk Operations** - Approve/feature multiple stories

## Security Notes

- Public story submissions require moderation
- Admin routes require authentication
- RLS policies protect database tables
- Stories are private until approved and published
- Partner inquiries are private (admin-only)

## Troubleshooting

### Story Not Appearing on Public Page

**Problem:** Story not showing on `/stories`

**Solution:**
1. Verify `is_approved = true`
2. Verify `is_public = true`
3. Check RLS policies allow public SELECT
4. Verify category filter (if filtering)
5. Review server logs for query errors

### Video Not Embedding

**Problem:** Video URL not displaying as embed

**Solution:**
1. Verify URL format (YouTube/Vimeo)
2. Check video ID extraction logic
3. Verify iframe is rendering
4. Check browser console for errors
5. Test with different video URLs

### Download Count Not Incrementing

**Problem:** Download count not updating

**Solution:**
1. Verify API route is called
2. Check database update query
3. Verify press kit ID is correct
4. Check server logs for errors
5. Manually verify download_count field

## Next Steps

1. **Run Migration** - Apply database migration
2. **Create Press Kit** - Upload press kit PDF
3. **Test Story Submission** - Submit test story
4. **Test Approval Flow** - Approve and publish story
5. **Add Video Content** - Add video stories
6. **Public Launch** - Share launch page

## Support

For issues:
1. Check server logs for API errors
2. Verify database migration was applied
3. Check `stories`, `press_kit`, `partner_inquiries` tables
4. Verify triggers are active
5. Review RLS policies
6. Check this documentation for troubleshooting steps
