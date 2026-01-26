# Phase 11G: Portland Farmer Experience Upgrade

## Overview

Phase 11G implements a complete Portland-first farmer experience where farmers can join in under 60 seconds, even with weak internet, using voice input, with optional English/Patois UI. The system is simple, mobile-first, high contrast, and respectful.

## What Was Built

### A) Public Page: `/portland`

**File:** `app/portland/page.tsx` + `PortlandClient.tsx`

**Features:**
1. **Hero Section:**
   - Heading: "Bornfidis Portland"
   - Subheading: "Restoring land, people, and purpose through food."
   - Language toggle (English ↔ Patois) at top-right

2. **5 Large Tap Targets (Buttons):**
   - Join as Farmer (opens modal)
   - Join as Chef (placeholder)
   - Youth Apprenticeship (placeholder)
   - Book an Event (links to `/book`)
   - Support the Movement (links to `/impact`)

3. **Sections:**
   - **What is Bornfidis:** One sentence explanation
   - **How it Works:** 3-step visual flow (Grow → Cook → Serve)
   - **Stories Teaser:** Placeholder cards for Portland testimonies
   - **Footer:** Covenant line + scripture reference

4. **UX Requirements:**
   - Mobile-first responsive design
   - Big buttons (minimum 48px height)
   - High contrast for sunlight readability
   - Fast load, no heavy images
   - Forest green & gold branding

### B) Farmer Join Flow

**File:** `app/portland/FarmerJoinFlow.tsx`

**Form Fields:**
- Full name (required)
- Phone number (required)
- Approx acres farmed (optional, number)
- What do you grow? (optional, text)

**Voice Input:**
- Microphone icon beside each field
- Web Speech API for dictation
- Graceful fallback if not supported
- Auto-stop after pause
- Manual stop available
- Works with Jamaican accents (en-US, en-JM if available)

**Offline Mode:**
- Detects offline via `navigator.onLine`
- Shows indicator: "Offline — your submission will be saved and sent when you're back online."
- Stores pending submissions in IndexedDB (with localStorage fallback)
- Auto-submits when browser comes online
- Success UI after submission

**Confirmation:**
- "Thank you! We'll be in touch soon."
- "Keep your phone on — Bornfidis will call you."

### C) Backend + Database

**Migration File:** `supabase/migration-phase11g-farmers.sql`

**Table: `farmers_applications`**
```sql
- id: uuid (primary key)
- created_at: timestamp
- name: text (not null)
- phone: text (not null)
- acres: numeric (nullable)
- crops: text (nullable)
- status: text (default 'new')
- notes: text (nullable)
```

**RLS Policies:**
- Public can INSERT (submit applications)
- Authenticated users (admins) can SELECT, UPDATE, DELETE
- Public cannot read (privacy)

**API Route:** `app/api/portland/farmer-join/route.ts`
- POST endpoint for farmer applications
- Zod validation
- Rate limiting (5 requests per minute per IP)
- Saves to Supabase
- Returns clear JSON errors

### D) SMS Confirmation

**Twilio Integration:**
- Checks for `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- If configured: Sends SMS "Bornfidis received your details. We'll contact you soon."
- If not configured: Logs "Twilio not configured" and continues (no crash)
- Graceful error handling

### E) Admin View

**Files:**
- `app/admin/farmers/page.tsx` - List of applications
- `app/admin/farmers/[id]/page.tsx` - Detail view
- `app/admin/farmers/[id]/FarmerDetailClient.tsx` - Client component
- `app/api/admin/farmers/[id]/update/route.ts` - Update API

**Features:**
- Table of applications (newest first)
- Columns: Name, Phone, Acres, Crops, Status, Created, Actions
- Detail view with status update buttons
- Notes field (auto-saves on blur)
- Status colors: new (blue), reviewed (yellow), approved (green), declined (red)

### F) Patois Toggle

**File:** `app/portland/PatoisProvider.tsx`

**Implementation:**
- Simple i18n toggle (no external library)
- Preference stored in localStorage
- All content translated:
  - Buttons
  - Field labels
  - Offline indicator
  - Submit button
  - Thank you message

**Example Translations:**
- "Join as Farmer" → "Jine as Farmer"
- "Your Name" → "Yuh Name"
- "Phone Number" → "Yuh Phone #"
- "What do you grow?" → "Wah yuh grow?"
- "Offline — saved" → "No signal — wi save it an send it when yuh online."

## Database Migration

**File:** `supabase/migration-phase11g-farmers.sql`

**To Apply:**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of migration file
3. Run the migration
4. Verify table created:
   ```sql
   SELECT * FROM farmers_applications LIMIT 1;
   ```
5. Verify RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'farmers_applications';
   ```

## Environment Variables

Add to `.env.local`:
```env
# Twilio (optional - graceful fallback if not set)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890
# OR
TWILIO_PHONE_NUMBER=+1234567890
```

## URLs

- **Public Page:** `/portland`
- **Farmer Join:** Modal from `/portland` (click "Join as Farmer")
- **Admin List:** `/admin/farmers`
- **Admin Detail:** `/admin/farmers/[id]`
- **API Endpoint:** `POST /api/portland/farmer-join`
- **Admin Update API:** `POST /api/admin/farmers/[id]/update`

## Testing Checklist

### 1. Public Page (`/portland`)
- [ ] Page loads on mobile
- [ ] Hero section displays correctly
- [ ] Language toggle works (top-right)
- [ ] All 5 buttons are visible and clickable
- [ ] "What is Bornfidis" section shows one sentence
- [ ] "How it Works" shows 3 steps
- [ ] Stories section displays placeholder cards
- [ ] Footer shows covenant + scripture
- [ ] High contrast readable in sunlight
- [ ] Fast load time

### 2. Farmer Join Flow
- [ ] Click "Join as Farmer" opens modal
- [ ] Form fields display correctly
- [ ] Voice input buttons appear (if supported)
- [ ] Can type in all fields
- [ ] Can use voice input for each field
- [ ] Form validates required fields
- [ ] Submit button works
- [ ] Success message displays
- [ ] Modal closes after success

### 3. Voice Input
- [ ] Microphone button appears (Chrome/Edge/Safari)
- [ ] Clicking microphone requests permission
- [ ] Voice input populates field
- [ ] Can stop manually
- [ ] Works with Jamaican accent (best effort)
- [ ] Graceful fallback in Firefox

### 4. Offline Mode
- [ ] Go offline (browser dev tools)
- [ ] Offline indicator appears
- [ ] Fill out form offline
- [ ] Submit form offline
- [ ] Form saves to IndexedDB/localStorage
- [ ] Go back online
- [ ] Form auto-submits
- [ ] Success message appears

### 5. Database
- [ ] Run migration SQL
- [ ] Verify table created
- [ ] Verify RLS policies
- [ ] Submit farmer application
- [ ] Check database: application saved
- [ ] Verify phone number formatted correctly

### 6. SMS Confirmation
- [ ] Set Twilio env vars
- [ ] Submit farmer application
- [ ] Check SMS received
- [ ] Verify message content
- [ ] Test without Twilio config (should not crash)
- [ ] Check logs for "Twilio not configured"

### 7. Admin View
- [ ] Navigate to `/admin/farmers`
- [ ] See list of applications
- [ ] Click "View" on application
- [ ] See detail page
- [ ] Update status
- [ ] Add notes
- [ ] Notes auto-save
- [ ] Status colors display correctly

### 8. Patois Toggle
- [ ] Click language toggle
- [ ] All text changes to Patois
- [ ] Form labels translated
- [ ] Buttons translated
- [ ] Messages translated
- [ ] Toggle back to English
- [ ] Preference persists (localStorage)

### 9. Rate Limiting
- [ ] Submit 5 applications quickly
- [ ] 6th submission should be rate limited
- [ ] Wait 1 minute
- [ ] Can submit again

### 10. Mobile Testing
- [ ] Test on iPhone
- [ ] Test on Android
- [ ] Verify large touch targets
- [ ] Check voice input on mobile
- [ ] Test offline mode on mobile
- [ ] Verify SMS received on mobile

## Files Created

1. `supabase/migration-phase11g-farmers.sql` - Database migration
2. `app/portland/PortlandClient.tsx` - Main page component (updated)
3. `app/portland/FarmerJoinFlow.tsx` - Farmer join modal (updated)
4. `app/api/portland/farmer-join/route.ts` - API route (updated)
5. `app/admin/farmers/page.tsx` - Admin list page
6. `app/admin/farmers/[id]/page.tsx` - Admin detail page
7. `app/admin/farmers/[id]/FarmerDetailClient.tsx` - Admin detail client
8. `app/api/admin/farmers/[id]/update/route.ts` - Admin update API
9. `PHASE11G_PORTLAND_FARMER_EXPERIENCE_SUMMARY.md` - This documentation

## Files Modified

1. `app/portland/PatoisProvider.tsx` - Extended translations
2. `app/portland/OfflineStorage.tsx` - Enhanced for pending submissions

## Key Features

### 1. 60-Second Join Flow
- Minimal fields (only what matters)
- Voice input for speed
- Auto-save as you type
- Quick submission
- Immediate feedback

### 2. Offline Support
- Detects offline status
- Saves to IndexedDB/localStorage
- Auto-submits when online
- User-friendly messaging

### 3. Voice Input
- Web Speech API
- Microphone per field
- Visual feedback
- Browser compatibility
- Jamaican accent support

### 4. Mobile-First
- Large touch targets (48px+)
- High contrast
- Fast loading
- Responsive design
- Readable in sunlight

### 5. Patois Support
- Simple toggle
- All content translated
- Respectful translations
- localStorage persistence

## Security

1. **RLS Policies:**
   - Public can only INSERT
   - Admins can read/update/delete
   - Public cannot read applications

2. **Rate Limiting:**
   - 5 requests per minute per IP
   - In-memory (resets on restart)
   - Prevents abuse

3. **Input Validation:**
   - Zod schemas
   - Server-side validation
   - Phone number formatting
   - SQL injection protection (Supabase)

## Performance

1. **Fast Load:**
   - No heavy images
   - Minimal dependencies
   - Efficient rendering
   - Small bundle size

2. **Offline Support:**
   - IndexedDB for storage
   - localStorage fallback
   - Auto-sync when online

3. **Voice Input:**
   - Only loads when needed
   - Graceful fallback
   - No blocking resources

## Troubleshooting

### Voice Input Not Working
1. Check browser compatibility (Chrome/Edge/Safari)
2. Verify microphone permissions
3. Check HTTPS (required)
4. Test in incognito mode
5. Review browser console

### Offline Auto-Submit Not Working
1. Check online/offline detection
2. Verify IndexedDB/localStorage
3. Check network events
4. Review browser console
5. Test manual retry

### SMS Not Sending
1. Verify Twilio credentials
2. Check phone number format
3. Verify Twilio account balance
4. Check Twilio logs
5. Review API response

### Database Errors
1. Verify migration applied
2. Check RLS policies
3. Verify table exists
4. Check Supabase logs
5. Review API response

## Next Steps

1. **Set Up Twilio:**
   - Create Twilio account
   - Get phone number
   - Add credentials to `.env.local`
   - Test SMS sending

2. **Test on Real Devices:**
   - Test on iPhone
   - Test on Android
   - Test voice input
   - Test offline mode

3. **Gather Feedback:**
   - User testing
   - Accessibility audit
   - Performance testing
   - Language accuracy

4. **Deploy:**
   - Test in staging
   - Monitor performance
   - Gather user feedback
   - Iterate based on data

## Support

For issues:
1. Check browser console
2. Verify Twilio configuration
3. Test microphone permissions
4. Check network connectivity
5. Review this documentation
6. Test in different browsers

## Notes

- Voice input requires HTTPS in production
- SMS requires Twilio account (optional)
- Offline storage uses IndexedDB + localStorage
- Form validation on client and server
- All features degrade gracefully
- 60-second flow is optimized, not guaranteed
- Patois translations are respectful and clear
