# Phase 11G.2: WhatsApp + Voice-first Farmer Intake

## Overview

Phase 11G.2 adds WhatsApp intake support with voice note transcription using OpenAI Whisper. Farmers can join via WhatsApp by sending text messages or voice notes, which are automatically processed and transcribed.

## What Was Built

### 1. Database Changes

**File:** `supabase/migration-phase11g-2-whatsapp-voice.sql`

**New Table: `farmer_intakes`**
- Tracks all WhatsApp messages and voice notes
- Stores transcript, extracted fields, and processing status
- Links to farmer records via `farmer_id`

**Updated Table: `farmers_applications`**
- Added `transcript` column for voice note transcripts
- Added `intake_channel` ('web' | 'whatsapp')
- Added `intake_source` ('voice' | 'text')

### 2. Twilio WhatsApp Support

**File:** `lib/twilio.ts`

**New Function: `sendWhatsAppMessage()`**
- Sends WhatsApp messages via Twilio WhatsApp API
- Uses `TWILIO_WHATSAPP_FROM` environment variable
- Formats phone numbers as `whatsapp:+1234567890`
- Gracefully no-ops if not configured

### 3. OpenAI Whisper Transcription

**File:** `lib/transcribe.ts`

**Function: `transcribeAudio()`**
- Transcribes audio using OpenAI Whisper API
- Supports multiple audio formats (mp3, wav, ogg, webm, m4a)
- Returns transcript text
- Handles errors gracefully

### 4. Field Extraction

**File:** `lib/voice-extract.ts`

**Function: `extractFarmerFields()`**
- Extracts name, parish, acres, crops from text/transcript
- Uses heuristics first (regex patterns, keyword matching)
- Falls back to OpenAI if confidence is low
- Handles Jamaican parishes and Patois

### 5. WhatsApp Webhook Endpoint

**File:** `app/api/twilio/whatsapp/route.ts`

**Endpoint:** `POST /api/twilio/whatsapp`

**Features:**
- Validates Twilio webhook (optional signature validation)
- Rate limiting (10 requests/minute per IP)
- Handles text messages
- Handles voice notes (downloads, transcribes, extracts fields)
- Creates farmer records automatically
- Notifies coordinators via SMS
- Replies to farmers via WhatsApp

**Processing Flow:**

1. **Text Message:**
   - Creates intake record
   - Creates minimal farmer record (name='Pending')
   - Notifies coordinators
   - Replies asking for more info (name, parish, crops, acres) or voice note

2. **Voice Note:**
   - Creates intake record
   - Downloads audio using Twilio auth
   - Transcribes using OpenAI Whisper
   - Extracts fields (name, parish, acres, crops)
   - Creates farmer record with `voice_ready=true`
   - Updates intake with transcript and extracted fields
   - Notifies coordinators (includes "VOICE NOTE" marker)
   - Replies confirming receipt

### 6. Admin UI Updates

**Files Modified:**
- `app/admin/farmers/page.tsx` - Added voice_ready badge
- `app/admin/farmers/[id]/FarmerDetailClient.tsx` - Shows transcript and intake info

**New Page:**
- `app/admin/intakes/page.tsx` - Shows last 50 intakes with status, transcript preview, links to farmers

## Environment Variables

Add to `.env.local`:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886  # Twilio sandbox sender

# OpenAI Configuration (optional but recommended)
OPENAI_API_KEY=your_openai_api_key

# Coordinator Phone Numbers
COORDINATOR_SHAMAINE_PHONE=+1XXXXXXXXXX
COORDINATOR_SUZETTE_PHONE=+1XXXXXXXXXX

# Webhook Security (optional)
TWILIO_WEBHOOK_AUTH=false  # Set to 'true' to enable signature validation
TWILIO_WEBHOOK_SECRET=your_webhook_secret  # Required if TWILIO_WEBHOOK_AUTH=true
```

## Twilio Console Setup

### 1. Join WhatsApp Sandbox

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Messaging** > **Try it out** > **Send a WhatsApp message**
3. Follow instructions to join the sandbox
4. Send the join code to your WhatsApp number
5. You'll receive a confirmation message

### 2. Configure Webhook URL

1. In Twilio Console, go to **Messaging** > **Settings** > **WhatsApp Sandbox Settings**
2. Set **When a message comes in** to:
   ```
   https://yourdomain.com/api/twilio/whatsapp
   ```
3. Set **HTTP method** to `POST`
4. Save configuration

### 3. Get WhatsApp Sender Number

- The sandbox sender number is typically: `whatsapp:+14155238886`
- Use this for `TWILIO_WHATSAPP_FROM`

### 4. Production Setup (Later)

- Apply for WhatsApp Business API access
- Get approved WhatsApp Business number
- Update `TWILIO_WHATSAPP_FROM` with production number

## Testing Checklist

### 1. Database Migration

- [ ] Run migration: `supabase/migration-phase11g-2-whatsapp-voice.sql`
- [ ] Verify `farmer_intakes` table created
- [ ] Verify `farmers_applications` columns added
- [ ] Check RLS policies are active

### 2. Environment Setup

- [ ] Add all required environment variables
- [ ] Verify Twilio credentials are correct
- [ ] Verify OpenAI API key (if using transcription)
- [ ] Test WhatsApp sender number format

### 3. Twilio Sandbox

- [ ] Join WhatsApp sandbox
- [ ] Configure webhook URL
- [ ] Test webhook receives messages
- [ ] Verify webhook returns TwiML XML

### 4. Text Message Intake

- [ ] Send text message to WhatsApp sandbox number
- [ ] Verify intake record created in database
- [ ] Verify farmer record created (name='Pending')
- [ ] Verify coordinator SMS received
- [ ] Verify WhatsApp reply received
- [ ] Check admin intakes page shows entry

### 5. Voice Note Intake

- [ ] Send voice note to WhatsApp sandbox number
- [ ] Verify intake record created
- [ ] Verify audio downloaded successfully
- [ ] Verify transcription completed
- [ ] Verify fields extracted (name, parish, acres, crops)
- [ ] Verify farmer record created with `voice_ready=true`
- [ ] Verify transcript stored in farmer record
- [ ] Verify coordinator SMS received (with "VOICE NOTE" marker)
- [ ] Verify WhatsApp reply received
- [ ] Check admin intakes page shows entry with transcript
- [ ] Check admin farmer detail shows transcript

### 6. Error Handling

- [ ] Test with missing OpenAI API key (should gracefully handle)
- [ ] Test with invalid audio format (should handle error)
- [ ] Test with empty voice note (should handle)
- [ ] Test rate limiting (send 11 messages quickly)
- [ ] Verify error messages logged
- [ ] Verify farmer still receives reply even on error

### 7. Admin UI

- [ ] Navigate to `/admin/farmers`
- [ ] Verify voice_ready badge appears for voice intakes
- [ ] Navigate to `/admin/farmers/[id]` for voice intake
- [ ] Verify transcript displayed
- [ ] Verify intake_channel and intake_source shown
- [ ] Navigate to `/admin/intakes`
- [ ] Verify all intakes listed
- [ ] Verify status colors correct
- [ ] Verify transcript preview works
- [ ] Verify links to farmers work

### 8. Field Extraction

- [ ] Test with clear English text
- [ ] Test with Patois text
- [ ] Test with partial information
- [ ] Test with all fields present
- [ ] Test with no fields found (should use 'Unknown' for name)
- [ ] Verify parish matching works
- [ ] Verify acres extraction works
- [ ] Verify crops extraction works

### 9. Integration

- [ ] Verify existing web farmer join still works
- [ ] Verify SMS notifications still work
- [ ] Verify no breaking changes to existing flows
- [ ] Test multiple intakes from same phone number

## Security Notes

### 1. Webhook Authentication

- Signature validation is optional (controlled by `TWILIO_WEBHOOK_AUTH`)
- If enabled, requires `TWILIO_WEBHOOK_SECRET`
- Currently logs warning if enabled but not fully implemented
- For production, implement proper Twilio signature validation

### 2. Rate Limiting

- Basic in-memory rate limiting (10 requests/minute per IP)
- Resets on server restart
- For production, consider Redis-based rate limiting

### 3. Data Privacy

- Voice notes are processed via OpenAI (review privacy policy)
- Transcripts stored in database
- Phone numbers stored in E.164 format
- RLS policies protect data access

## Troubleshooting

### WhatsApp Not Receiving Messages

1. Verify webhook URL is correct in Twilio console
2. Check webhook is accessible (not behind firewall)
3. Verify webhook returns valid TwiML XML
4. Check Twilio console logs for errors

### Transcription Failing

1. Verify `OPENAI_API_KEY` is set
2. Check OpenAI API quota/balance
3. Verify audio format is supported
4. Check audio file size (Whisper has limits)
5. Review error logs for details

### Field Extraction Not Working

1. Check transcript quality
2. Review extracted fields in database (`extracted_json`)
3. Test with clearer voice notes
4. Verify OpenAI API key if using AI extraction

### Coordinator Not Receiving SMS

1. Verify coordinator phone numbers in env vars
2. Check Twilio SMS logs
3. Verify SMS sending function works
4. Check phone number format (E.164)

## Production Considerations

1. **WhatsApp Business API:**
   - Apply for production access
   - Get approved WhatsApp Business number
   - Update webhook URL
   - Test opt-in flow

2. **OpenAI Costs:**
   - Monitor Whisper API usage
   - Set up billing alerts
   - Consider caching transcripts

3. **Rate Limiting:**
   - Implement Redis-based rate limiting
   - Add per-phone-number limits
   - Monitor for abuse

4. **Error Monitoring:**
   - Set up error tracking (Sentry, etc.)
   - Monitor webhook failures
   - Alert on transcription failures

5. **Data Retention:**
   - Consider archiving old intakes
   - Clean up failed intakes after 30 days
   - Backup transcripts

## Files Created

1. `supabase/migration-phase11g-2-whatsapp-voice.sql` - Database migration
2. `lib/transcribe.ts` - OpenAI Whisper transcription
3. `lib/voice-extract.ts` - Field extraction logic
4. `app/api/twilio/whatsapp/route.ts` - WhatsApp webhook endpoint
5. `app/admin/intakes/page.tsx` - Admin intakes page
6. `PHASE11G2_WHATSAPP_VOICE_INTAKE.md` - This documentation

## Files Modified

1. `lib/twilio.ts` - Added `sendWhatsAppMessage()`
2. `app/admin/farmers/page.tsx` - Added voice_ready badge
3. `app/admin/farmers/[id]/FarmerDetailClient.tsx` - Added transcript display

## How to Test

### Quick Test Steps

1. **Setup:**
   ```bash
   # Add env vars to .env.local
   # Run database migration
   # Configure Twilio webhook URL
   ```

2. **Test Text Message:**
   - Send WhatsApp text to sandbox number
   - Check database for intake and farmer records
   - Verify coordinator SMS received
   - Verify WhatsApp reply received

3. **Test Voice Note:**
   - Send WhatsApp voice note to sandbox number
   - Wait for processing (may take 10-30 seconds)
   - Check database for transcript
   - Verify farmer record created with voice_ready=true
   - Verify coordinator SMS received
   - Verify WhatsApp reply received

4. **Check Admin:**
   - Visit `/admin/intakes` - see intake records
   - Visit `/admin/farmers` - see voice_ready badges
   - Visit `/admin/farmers/[id]` - see transcript

### Expected Results

- Text messages create "Pending" farmer records
- Voice notes create farmer records with extracted fields
- Transcripts stored for voice notes
- Coordinators notified via SMS
- Farmers receive WhatsApp replies
- Admin can view all intakes and transcripts

## Support

For issues:
1. Check Twilio console logs
2. Check server logs for errors
3. Verify environment variables
4. Test webhook URL accessibility
5. Review this documentation
6. Check database for intake records

## Notes

- Voice notes require OpenAI API key for transcription
- Transcription may take 10-30 seconds
- Field extraction uses heuristics + optional OpenAI
- All features degrade gracefully if services unavailable
- WhatsApp sandbox is for testing only
- Production requires WhatsApp Business API approval
