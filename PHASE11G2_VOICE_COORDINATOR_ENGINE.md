# Phase 11G.2: Voice Coordinator Engine

## Overview

Phase 11G.2 implements a complete voice coordinator system using Twilio Voice API to call farmers, track call outcomes, and send follow-up SMS. The system includes a coordinator dashboard for managing calls and recording call summaries.

## What Was Built

### 1. Database Schema

**File:** `supabase/migration-phase11g-2-voice-coordinator.sql`

**New Table: `farmer_call_logs`**
- `id` - UUID primary key
- `created_at` - Timestamp
- `farmer_id` - Reference to farmers_applications
- `coordinator_id` - Reference to auth.users
- `call_sid` - Twilio Call SID
- `call_status` - initiated, ringing, in-progress, completed, failed, no-answer, busy
- `call_duration_seconds` - Call duration
- `interest_level` - high, medium, low, not_interested
- `crops_confirmed` - Text field
- `volume_estimate` - Text field
- `preferred_contact_time` - Text field
- `notes` - Text field
- `call_outcome` - connected, no_answer, busy, failed, voicemail
- `follow_up_sms_sent` - Boolean
- `follow_up_sms_sid` - Twilio Message SID
- `completed_at` - Timestamp

**WhatsApp Preparation (Phase 11G.3):**
- Added `whatsapp_phone` to `farmers_applications`
- Added `whatsapp_opted_in` flag
- Added `whatsapp_opted_in_at` timestamp

### 2. Twilio Voice Helper

**File:** `lib/twilio-voice.ts`

**Functions:**
- `initiateFarmerCall()` - Initiates outbound call via Twilio Voice API
- `generateCallTwiML()` - Generates TwiML XML for call flow

**Call Flow:**
1. Twilio calls farmer
2. Plays greeting: "Hello, this is Bornfidis Portland. Thank you for joining our farmer network. A coordinator will speak with you now."
3. Connects to coordinator phone (if provided)
4. Or ends call if no coordinator phone

### 3. API Routes

#### `POST /api/farmers/call`
- Initiates call to farmer
- Requires authentication (coordinator/admin)
- Accepts: `farmer_id`, `coordinator_phone` (optional)
- Creates call log entry
- Returns call SID

#### `GET/POST /api/twilio/voice/greeting`
- Twilio webhook for call greeting
- Returns TwiML XML
- Handles coordinator connection

#### `POST /api/twilio/voice/status`
- Twilio status callback webhook
- Updates call log with status changes
- Sends follow-up SMS when call completed
- Tracks call duration and outcome

#### `POST /api/farmers/call/[id]/summary`
- Saves call summary
- Updates: interest_level, crops_confirmed, volume_estimate, preferred_contact_time, notes, call_outcome
- Requires authentication

#### `GET /api/farmers/call/[id]`
- Gets call history for a farmer
- Returns all call logs for farmer
- Requires authentication

### 4. Coordinator Dashboard

**File:** `app/admin/farmers/[id]/FarmerDetailClient.tsx`

**Features:**
- **Call Farmer Button:**
  - Input for coordinator phone (optional)
  - Initiates call when clicked
  - Shows loading state

- **Call History:**
  - Lists all calls for farmer
  - Shows call status, outcome, duration
  - "Add Summary" / "Edit Summary" buttons

- **Call Summary Modal:**
  - Call outcome (required)
  - Interest level
  - Crops confirmed
  - Volume estimate
  - Preferred contact time
  - Notes
  - Save button

### 5. Follow-up SMS

**Implementation:**
- Automatically sent after completed calls
- Message: "Thank you for speaking with Bornfidis. We will connect you to chefs and markets soon. 🇯🇲🌱"
- Only sent if call was connected (duration > 10 seconds)
- Tracked in call log (`follow_up_sms_sent`, `follow_up_sms_sid`)

### 6. WhatsApp Preparation

**File:** `lib/whatsapp.ts`

**Prepared for Phase 11G.3:**
- Placeholder functions for WhatsApp sending
- Database fields ready
- Structure in place for implementation

## Environment Variables

Add to `.env.local`:

```env
# Twilio Voice (required)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+18664917107
TWILIO_FROM_NUMBER=+18664917107

# App URL for webhooks (required)
NEXT_PUBLIC_APP_URL=https://your-domain.com
# OR
VERCEL_URL=your-vercel-url
```

## Database Migration

**To Apply:**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migration-phase11g-2-voice-coordinator.sql`
3. Run the migration
4. Verify table created:
   ```sql
   SELECT * FROM farmer_call_logs LIMIT 1;
   ```
5. Verify WhatsApp fields added:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'farmers_applications' 
   AND column_name LIKE 'whatsapp%';
   ```

## Twilio Configuration

### 1. Voice API Setup
- Ensure Twilio phone number is configured
- Voice API must be enabled in Twilio console
- Webhook URLs must be publicly accessible (HTTPS)

### 2. Webhook URLs
- Greeting: `https://your-domain.com/api/twilio/voice/greeting`
- Status: `https://your-domain.com/api/twilio/voice/status`

### 3. Test Mode
- Use Twilio test credentials for development
- Test phone numbers: +15005550006 (valid), +15005550001 (invalid)

## Testing Checklist

### 1. Database Migration
- [ ] Run migration SQL
- [ ] Verify `farmer_call_logs` table created
- [ ] Verify WhatsApp fields added
- [ ] Verify indexes created
- [ ] Verify RLS policies

### 2. Initiate Call
- [ ] Navigate to farmer detail page
- [ ] Enter coordinator phone (optional)
- [ ] Click "Call Farmer"
- [ ] Verify call initiated
- [ ] Check call log created
- [ ] Verify farmer receives call

### 3. Call Flow
- [ ] Farmer answers call
- [ ] Greeting plays correctly
- [ ] Coordinator connected (if phone provided)
- [ ] Call completes successfully

### 4. Status Callback
- [ ] Check webhook receives status updates
- [ ] Verify call log updated
- [ ] Check call duration recorded
- [ ] Verify call outcome determined

### 5. Follow-up SMS
- [ ] Complete a call (duration > 10s)
- [ ] Verify SMS sent to farmer
- [ ] Check `follow_up_sms_sent` flag
- [ ] Verify SMS SID stored

### 6. Call Summary
- [ ] Complete a call
- [ ] Click "Add Summary"
- [ ] Fill out all fields
- [ ] Save summary
- [ ] Verify data saved
- [ ] Check call history updated

### 7. Call History
- [ ] View call history for farmer
- [ ] See all previous calls
- [ ] View call details
- [ ] Edit existing summaries

### 8. Error Handling
- [ ] Test with invalid farmer ID
- [ ] Test with missing Twilio config
- [ ] Test webhook with invalid data
- [ ] Verify graceful error handling

## Files Created

1. `supabase/migration-phase11g-2-voice-coordinator.sql` - Database migration
2. `lib/twilio-voice.ts` - Twilio Voice helper
3. `app/api/farmers/call/route.ts` - Initiate call endpoint
4. `app/api/twilio/voice/greeting/route.ts` - TwiML webhook
5. `app/api/twilio/voice/status/route.ts` - Status callback webhook
6. `app/api/farmers/call/[id]/summary/route.ts` - Save call summary
7. `app/api/farmers/call/[id]/route.ts` - Get call history
8. `lib/whatsapp.ts` - WhatsApp preparation (Phase 11G.3)
9. `PHASE11G2_VOICE_COORDINATOR_ENGINE.md` - This documentation

## Files Modified

1. `app/admin/farmers/[id]/FarmerDetailClient.tsx` - Added call functionality
2. `lib/twilio.ts` - Added comment for Phase 11G.2

## Workflow

### 1. Coordinator Initiates Call
1. Coordinator navigates to farmer detail page
2. Optionally enters their phone number
3. Clicks "Call Farmer"
4. API initiates Twilio call
5. Call log created with status "initiated"

### 2. Call Flow
1. Twilio calls farmer
2. Farmer answers
3. Greeting plays
4. If coordinator phone provided: Call connected to coordinator
5. If no coordinator phone: Call ends after greeting

### 3. Status Updates
1. Twilio sends status updates to webhook
2. Call log updated with status
3. When completed: Duration and outcome recorded
4. If connected: Follow-up SMS sent

### 4. Call Summary
1. Coordinator clicks "Add Summary"
2. Fills out call details
3. Saves summary
4. Call log updated with summary data

## TwiML Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">
    Hello, this is Bornfidis Portland. Thank you for joining our farmer network. A coordinator will speak with you now.
  </Say>
  <Dial>
    <Number>+1234567890</Number>
  </Dial>
</Response>
```

## Security

1. **Authentication:**
   - All API routes require authentication
   - Only coordinators/admins can initiate calls
   - RLS policies protect call logs

2. **Webhook Security:**
   - Twilio webhooks should validate requests
   - Consider adding signature validation
   - Use HTTPS for all webhooks

3. **Rate Limiting:**
   - Consider adding rate limits for call initiation
   - Prevent abuse of Twilio API

## Performance

1. **Non-Blocking:**
   - SMS sending is async
   - Doesn't delay API response
   - Errors logged but don't fail request

2. **Webhook Processing:**
   - Status callbacks processed quickly
   - Always return 200 to Twilio
   - Errors logged but don't retry

## Troubleshooting

### Call Not Initiating
1. Verify Twilio credentials
2. Check phone number format
3. Verify webhook URLs are accessible
4. Check Twilio account balance
5. Review Twilio logs
6. Check API response

### Greeting Not Playing
1. Verify TwiML URL is accessible
2. Check TwiML XML format
3. Test TwiML in Twilio console
4. Review webhook logs

### Status Not Updating
1. Verify status webhook URL
2. Check webhook is receiving requests
3. Review webhook logs
4. Verify call log updates

### SMS Not Sending
1. Verify SMS helper function
2. Check follow-up SMS logic
3. Review call outcome determination
4. Check Twilio SMS logs

## Next Steps

1. **Set Up Twilio:**
   - Configure Voice API
   - Set webhook URLs
   - Test call flow

2. **Test End-to-End:**
   - Initiate test call
   - Verify greeting plays
   - Test coordinator connection
   - Verify follow-up SMS

3. **Phase 11G.3:**
   - Implement WhatsApp integration
   - Use prepared database fields
   - Build WhatsApp messaging

## Support

For issues:
1. Check Twilio console logs
2. Verify webhook URLs
3. Review API responses
4. Check database call logs
5. Test TwiML in Twilio console
6. Review this documentation
