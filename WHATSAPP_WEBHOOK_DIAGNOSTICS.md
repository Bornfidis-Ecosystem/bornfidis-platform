# WhatsApp Webhook Diagnostics & Fix

## Changes Made

### 1. Enhanced Logging
- Added `🔥` log at the very start to confirm webhook is hit
- Log all form data keys received
- Log extracted phone number
- Log Prisma write attempts and results
- Log TwiML response sending

### 2. Database Write Order
- Ensured Prisma `.create()` happens **before** TwiML response
- Added detailed error logging for database failures
- Continue execution even if DB fails (to prevent Twilio retries)

### 3. Better Error Handling
- Log full error stack traces
- Log Prisma error codes and metadata
- Always return valid TwiML even on errors

## Testing Steps

### Step 1: Verify Webhook is Hit
1. Restart your dev server
2. Send a WhatsApp message to your Twilio number
3. Check terminal for `🔥 WhatsApp inbound webhook HIT`

**If you DON'T see this log:**
- Twilio webhook URL is wrong
- ngrok tunnel is down
- Route path mismatch

### Step 2: Check Form Data
Look for `📋 Form data keys received:` in logs
- Should show: `['From', 'Body', 'MessageSid', 'To', ...]`
- If empty or missing keys → Twilio payload issue

### Step 3: Verify Phone Extraction
Look for `📞 Extracted phone:` in logs
- Should show a phone number (without `whatsapp:` prefix)
- If empty → phone extraction failing

### Step 4: Check Database Write
Look for:
- `💾 Attempting to create FarmerIntake record...`
- `✅ FarmerIntake record created successfully: [id]`
- OR `❌ Database error creating intake: [error details]`

### Step 5: Verify Response
Look for `📤 Returning TwiML response`
- Confirms response is sent after DB write

## Common Issues & Fixes

### Issue 1: No `🔥` Log
**Problem:** Webhook not being hit
**Fix:**
- Verify Twilio webhook URL: `https://YOUR-NGROK-URL.ngrok.io/api/whatsapp/inbound`
- Check ngrok is running: `ngrok http 3000`
- Verify ngrok URL matches Twilio config

### Issue 2: `❌ Database error`
**Problem:** Prisma write failing
**Possible causes:**
- Database connection issue
- Schema mismatch
- Missing required fields

**Fix:**
- Check terminal for full error details
- Verify `DATABASE_URL` in `.env.local`
- Check Prisma schema matches database

### Issue 3: Phone Number Empty
**Problem:** `📞 Extracted phone:` shows empty string
**Fix:**
- Check `From` field in logs
- Verify Twilio is sending `From` field
- May need to handle different phone formats

### Issue 4: Records Not Appearing in Admin
**Problem:** DB write succeeds but `/admin/intakes` shows nothing
**Possible causes:**
- Admin page using different table/view
- RLS policies blocking reads
- Cache issue

**Fix:**
- Check `/admin/intakes` uses `farmer_intakes` table
- Verify RLS policies allow admin reads
- Hard refresh browser (Ctrl+Shift+R)

## Quick Test: Force a Write

To verify Prisma + UI are working, you can temporarily add this at the top of the POST handler:

```typescript
// TEMPORARY: Force a test write
try {
  await db.farmerIntake.create({
    data: {
      channel: 'debug',
      fromPhone: '+10000000000',
      messageText: 'Debug test at ' + new Date().toISOString(),
      status: 'received',
    },
  })
  console.log('🧪 Debug record created')
} catch (e) {
  console.error('🧪 Debug write failed:', e)
}
```

Then:
1. Restart dev server
2. Visit `http://localhost:3000/api/whatsapp/inbound` (any request will trigger it)
3. Check `/admin/intakes` for debug record

If debug record appears → Prisma + UI work, issue is in webhook flow
If debug record doesn't appear → Prisma or UI issue

## Next Steps

1. ✅ Webhook code updated with diagnostics
2. ⏳ Restart dev server
3. ⏳ Send WhatsApp message
4. ⏳ Check terminal logs
5. ⏳ Verify record in `/admin/intakes`

## Expected Log Flow

When a WhatsApp message arrives, you should see:

```
🔥 WhatsApp inbound webhook HIT at 2024-01-XX...
📋 Form data keys received: ['From', 'Body', 'MessageSid', 'To', ...]
📲 WhatsApp inbound payload: { from: 'whatsapp:+1234567890', body: 'Hello...', ... }
📞 Extracted phone: +1234567890
💾 Attempting to create FarmerIntake record...
✅ FarmerIntake record created successfully: abc-123-def-456
📤 Returning TwiML response
```

If you see this flow, the system is working! 🎉
