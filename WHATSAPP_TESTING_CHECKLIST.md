# WhatsApp Webhook Testing Checklist

## ✅ Confirmed Working

1. ✅ Database connectivity (`/api/test-db` returns success)
2. ✅ Database writes (`/api/whatsapp/test-write` creates records)
3. ✅ Admin UI (`/admin/intakes` displays records)
4. ✅ Prisma client (can read/write `farmer_intakes` table)

## 🧪 Next: Test Real WhatsApp Message

### Step 1: Verify ngrok is Running
```powershell
# Check if ngrok is running
# You should see: "Forwarding https://xxxx.ngrok.io -> http://localhost:3000"
```

### Step 2: Verify Twilio Webhook URL
In Twilio Console → WhatsApp Sandbox → Configuration:
- Webhook URL should be: `https://YOUR-NGROK-URL.ngrok.io/api/whatsapp/inbound`
- HTTP method: `POST`

### Step 3: Restart Dev Server
```powershell
# Stop server (Ctrl+C)
npm run dev
```

### Step 4: Send WhatsApp Message
Send a message to your Twilio WhatsApp number (the sandbox join code number).

### Step 5: Watch Terminal Logs
You should see this sequence:

```
🔥 WhatsApp inbound webhook HIT at [timestamp]
📋 Form data keys received: ['From', 'Body', 'MessageSid', 'To', ...]
📲 WhatsApp inbound payload: { from: 'whatsapp:+1234567890', body: 'Hello...', ... }
📞 Extracted phone: +1234567890
💾 Attempting to create FarmerIntake record...
✅ FarmerIntake record created successfully: [uuid]
📤 Returning TwiML response
```

### Step 6: Check Admin Dashboard
Visit: `http://localhost:3000/admin/intakes`

You should see a new record with:
- Channel: "whatsapp"
- From: [actual phone number]
- Type: Text
- Status: "received"
- Preview: [your message text]

## 🔍 Troubleshooting

### If you DON'T see `🔥` log:
- **Problem:** Webhook not being hit
- **Check:**
  - ngrok URL matches Twilio config
  - ngrok is still running
  - Route path is exactly `/api/whatsapp/inbound`

### If you see `🔥` but no `✅ Record created`:
- **Problem:** Database write failing
- **Check terminal for:**
  - `❌ Database error creating intake:`
  - Full error message and stack trace
  - Verify `DATABASE_URL` is correct

### If you see `✅ Record created` but no record in admin:
- **Problem:** UI or RLS issue
- **Check:**
  - Hard refresh browser (Ctrl+Shift+R)
  - Verify `/admin/intakes` uses `farmer_intakes` table
  - Check Supabase RLS policies

## 🎯 Success Criteria

When a WhatsApp message arrives, you should see:
1. ✅ `🔥` log in terminal (webhook hit)
2. ✅ `✅ Record created` log (database write)
3. ✅ New record appears in `/admin/intakes`
4. ✅ Farmer receives confirmation message on WhatsApp

## 📊 Expected Flow

```
Farmer sends WhatsApp
        ↓
Twilio POSTs to /api/whatsapp/inbound
        ↓
🔥 Webhook hit (logged)
        ↓
📋 Form data parsed
        ↓
📞 Phone extracted
        ↓
💾 Prisma write
        ↓
✅ Record created
        ↓
📤 TwiML response sent
        ↓
Farmer sees confirmation
        ↓
Admin sees intake in dashboard
```

## 🚀 Once This Works

You'll have completed the core WhatsApp intake flow! Next steps:
- Add voice note transcription (OpenAI Whisper)
- Add field extraction from voice/text
- Add coordinator notifications
- Add farmer record auto-creation

But first, let's get the basic message flow working! 🌱
