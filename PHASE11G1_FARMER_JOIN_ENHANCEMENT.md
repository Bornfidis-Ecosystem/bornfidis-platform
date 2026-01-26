# Phase 11G.1: Farmer Join Enhancement

## Overview

Phase 11G.1 enhances the farmer join system with Twilio Messaging Service support, coordinator notifications, offline queue, and additional fields (parish, voice_ready).

## What Was Built

### 1. Database Enhancement

**File:** `supabase/migration-phase11g-1-farmers-enhancement.sql`

**New Fields:**
- `parish` (TEXT, nullable) - Farmer's parish
- `voice_ready` (BOOLEAN, default FALSE) - Flag for Phase 11G.2 voice features

**Indexes:**
- `idx_farmers_applications_parish` - For filtering by parish
- `idx_farmers_applications_voice_ready` - For filtering voice-ready farmers

### 2. Twilio Helper

**File:** `lib/twilio.ts`

**Features:**
- Messaging Service support (preferred)
- Fallback to From Number if Messaging Service not configured
- `sendSMS()` - Generic SMS sending function
- `sendFarmerWelcomeSMS()` - Sends welcome message to farmer
- `sendCoordinatorNotificationSMS()` - Sends notification to coordinators

**SMS Messages:**
- **Farmer:** "Bornfidis Portland: Thank you for joining our farmer network. We will call you soon to connect your farm to chefs and markets. 🇯🇲🌱"
- **Coordinators:** "New farmer joined: {name} from {parish}. Phone: {phone}. Crops: {crops}. Acres: {acres}"

### 3. Offline Queue System

**File:** `lib/offline-queue.ts`

**Features:**
- Queues failed requests in localStorage
- Auto-retries when browser comes online
- Max 3 retries per request
- 5-second delay before retry
- Processes queue on page load and online event

**Functions:**
- `queueRequest()` - Add request to queue
- `getQueue()` - Get all queued requests
- `removeFromQueue()` - Remove request from queue
- `processQueue()` - Process all queued requests
- `initOfflineQueue()` - Initialize queue processing

### 4. New API Endpoint

**File:** `app/api/farmers/join/route.ts`

**Endpoint:** `POST /api/farmers/join`

**Accepts:**
```json
{
  "name": "string (required)",
  "phone": "string (required)",
  "parish": "string (optional)",
  "acres": "string (optional)",
  "crops": "string (optional)",
  "voice_ready": "boolean (optional, default false)"
}
```

**Process:**
1. Rate limiting (5 requests/minute per IP)
2. Phone number validation and formatting
3. Save to Supabase `farmers_applications` table
4. Send SMS to farmer (non-blocking)
5. Send SMS to coordinators (non-blocking)
6. Return success response

### 5. Updated Farmer Join Flow

**File:** `app/portland/FarmerJoinFlow.tsx`

**New Features:**
- Added `parish` field with voice input
- Added `voice_ready` flag (hidden, for future use)
- Integrated offline queue
- Updated to use `/api/farmers/join` endpoint
- Auto-initializes offline queue on mount

### 6. Admin Updates

**Files:**
- `app/admin/farmers/page.tsx` - Added parish column
- `app/admin/farmers/[id]/FarmerDetailClient.tsx` - Added parish display

## Environment Variables

Add to `.env.local`:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_MESSAGING_SERVICE_SID=your_messaging_service_sid

# Optional: Fallback if Messaging Service not used
TWILIO_FROM_NUMBER=+18664917107
TWILIO_PHONE_NUMBER=+18664917107

# Coordinator Phone Numbers
COORDINATOR_SHAMAINE_PHONE=+1XXXXXXXXXX
COORDINATOR_SUZETTE_PHONE=+1XXXXXXXXXX
```

## Database Migration

**To Apply:**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase11g-1-farmers-enhancement.sql`
3. Run the migration
4. Verify columns added:
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'farmers_applications' 
   AND column_name IN ('parish', 'voice_ready');
   ```

## Testing Checklist

### 1. Database Migration
- [ ] Run migration SQL
- [ ] Verify `parish` column exists
- [ ] Verify `voice_ready` column exists
- [ ] Verify indexes created

### 2. API Endpoint
- [ ] Test POST `/api/farmers/join` with all fields
- [ ] Test with missing required fields
- [ ] Test rate limiting (5 requests/minute)
- [ ] Verify data saved to Supabase
- [ ] Check phone number formatting

### 3. SMS to Farmer
- [ ] Set Twilio env vars
- [ ] Submit farmer application
- [ ] Verify SMS received by farmer
- [ ] Check message content
- [ ] Test without Twilio config (should not crash)

### 4. SMS to Coordinators
- [ ] Set coordinator phone numbers
- [ ] Submit farmer application
- [ ] Verify SMS received by coordinators
- [ ] Check message content includes all fields
- [ ] Test with missing coordinator numbers (should log warning)

### 5. Offline Queue
- [ ] Go offline (browser dev tools)
- [ ] Submit farmer application
- [ ] Verify request queued in localStorage
- [ ] Go back online
- [ ] Verify queue processed automatically
- [ ] Check application saved to database
- [ ] Verify SMS sent after queue processing

### 6. Parish Field
- [ ] Open farmer join form
- [ ] See parish field
- [ ] Enter parish via text
- [ ] Enter parish via voice input
- [ ] Submit form
- [ ] Verify parish saved to database
- [ ] Check admin view shows parish

### 7. Voice Ready Flag
- [ ] Check database for `voice_ready` column
- [ ] Verify default is FALSE
- [ ] (Future: Test voice features when implemented)

## Files Created

1. `supabase/migration-phase11g-1-farmers-enhancement.sql` - Database migration
2. `lib/twilio.ts` - Twilio SMS helper
3. `lib/offline-queue.ts` - Offline queue manager
4. `app/api/farmers/join/route.ts` - New API endpoint
5. `PHASE11G1_FARMER_JOIN_ENHANCEMENT.md` - This documentation

## Files Modified

1. `app/portland/FarmerJoinFlow.tsx` - Added parish field, offline queue
2. `app/portland/PatoisProvider.tsx` - Added parish translations
3. `app/admin/farmers/page.tsx` - Added parish column
4. `app/admin/farmers/[id]/FarmerDetailClient.tsx` - Added parish display

## Key Features

### 1. Twilio Messaging Service
- Uses Messaging Service SID (preferred)
- Falls back to From Number if needed
- Graceful error handling
- Non-blocking SMS sending

### 2. Coordinator Notifications
- Sends to multiple coordinators
- Includes all farmer details
- Configurable via env vars
- Logs warning if not configured

### 3. Offline Queue
- Automatic queueing on network failure
- Auto-retry when online
- Max 3 retries per request
- Persistent storage (localStorage)

### 4. Parish Field
- Optional field
- Voice input support
- Displayed in admin view
- Included in coordinator SMS

### 5. Voice Ready Flag
- Boolean flag for future use
- Default FALSE
- Stored in database
- Ready for Phase 11G.2

## Workflow

### 1. Farmer Submits Application
1. Fills out form (name, phone, parish, acres, crops)
2. Submits form
3. If online: Request sent immediately
4. If offline: Request queued

### 2. API Processing
1. Rate limiting check
2. Validation (Zod)
3. Phone number formatting
4. Save to Supabase
5. Send SMS to farmer (async)
6. Send SMS to coordinators (async)
7. Return success

### 3. Offline Queue Processing
1. Browser comes online
2. `processQueue()` called automatically
3. For each queued request:
   - Retry API call
   - If success: Remove from queue
   - If failure: Increment retry count
   - If max retries: Remove from queue

## Error Handling

### Twilio Errors
- Logged but don't fail request
- Application still saved
- User notified of success
- SMS retry can be manual

### Offline Errors
- Request queued automatically
- Retried when online
- Max 3 retries
- Removed if exceeds max

### Database Errors
- Request fails
- Error returned to user
- Request can be queued for retry
- User can resubmit

## Security

1. **Rate Limiting:**
   - 5 requests per minute per IP
   - In-memory (resets on restart)
   - Prevents abuse

2. **Input Validation:**
   - Zod schemas
   - Server-side validation
   - Phone number formatting
   - SQL injection protection (Supabase)

3. **RLS Policies:**
   - Public can INSERT
   - Admins can read/update/delete
   - Public cannot read

## Performance

1. **Non-Blocking SMS:**
   - SMS sent asynchronously
   - Doesn't delay response
   - Errors logged but don't fail request

2. **Offline Queue:**
   - localStorage for persistence
   - Efficient processing
   - Automatic retry

3. **Database:**
   - Indexed fields
   - Efficient queries
   - Fast inserts

## Troubleshooting

### SMS Not Sending
1. Verify Twilio credentials
2. Check Messaging Service SID
3. Verify phone number format
4. Check Twilio account balance
5. Review Twilio logs
6. Check API response

### Offline Queue Not Working
1. Check localStorage support
2. Verify online/offline detection
3. Check browser console
4. Review queue processing logs
5. Test manual retry

### Parish Not Saving
1. Verify migration applied
2. Check database column exists
3. Review API logs
4. Check form submission
5. Verify Supabase insert

## Next Steps

1. **Set Up Twilio:**
   - Configure Messaging Service
   - Add coordinator phone numbers
   - Test SMS sending

2. **Test Offline Queue:**
   - Test on real devices
   - Test with slow connections
   - Verify auto-retry

3. **Phase 11G.2:**
   - Implement voice features
   - Use `voice_ready` flag
   - Add voice callbacks

## Support

For issues:
1. Check browser console
2. Verify Twilio configuration
3. Check Supabase logs
4. Review API responses
5. Test offline queue manually
6. Review this documentation
