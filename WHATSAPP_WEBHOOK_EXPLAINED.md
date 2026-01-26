# WhatsApp Webhook Issue - Explained Simply

## 🔍 The Problem

You're seeing:
- ✅ Form submission works (web form)
- ✅ WhatsApp message sent TO farmer (outbound)
- ❌ No intake record when farmer REPLIES (inbound)

## 📤 vs 📥 Two Different Flows

### 📤 OUTBOUND (Sending TO farmers)
- Bornfidis → Farmer
- This is working ✅
- Uses: `lib/twilio.ts` → `sendWhatsAppMessage()`
- Triggered by: Form submission, coordinator actions

### 📥 INBOUND (Receiving FROM farmers)
- Farmer → Bornfidis
- This is NOT working ❌
- Uses: Webhook endpoint
- Triggered by: Farmer replying to WhatsApp

## 🎯 The Issue

When a farmer **replies** to your WhatsApp message, Twilio needs to:
1. Receive the farmer's message
2. POST it to your webhook URL
3. Your webhook saves it to database
4. Your webhook replies with confirmation

**Right now, step 2-3 aren't happening.**

## 🔧 Two Webhook Endpoints (Confusing!)

You have TWO different webhook endpoints:

### Option 1: `/api/whatsapp/inbound` (Simple, uses Prisma)
- File: `app/api/whatsapp/inbound/route.ts`
- Uses: Prisma (`db.farmerIntake.create()`)
- Status: ✅ Ready, has diagnostics

### Option 2: `/api/twilio/whatsapp` (Advanced, uses Supabase)
- File: `app/api/twilio/whatsapp/route.ts`
- Uses: Supabase (`supabaseAdmin.from('farmer_intakes')`)
- Status: Has voice transcription logic

## ✅ Solution: Pick ONE and Configure Twilio

### Step 1: Choose Your Webhook Endpoint

**Recommendation:** Use `/api/whatsapp/inbound` (simpler, already has diagnostics)

### Step 2: Configure Twilio Webhook URL

In Twilio Console:
1. Go to: **Messaging** → **Try it out** → **Send a WhatsApp message**
2. OR: **Messaging** → **Settings** → **WhatsApp Sandbox**
3. Find: **"When a message comes in"** or **"Inbound webhook"**
4. Set URL to: `https://YOUR-NGROK-URL.ngrok.io/api/whatsapp/inbound`
5. Method: `POST`

### Step 3: Test Inbound Message

1. Send a WhatsApp message FROM your phone TO the Twilio number
2. Watch terminal for `🔥` log
3. Check `/admin/intakes` for new record

## 🧪 Quick Test

### Test 1: Is webhook being hit?
Send a WhatsApp message and check terminal:
- ✅ See `🔥` log = Webhook is hit
- ❌ No `🔥` log = Twilio URL wrong or ngrok down

### Test 2: Is database write working?
If you see `🔥` but no record:
- Check terminal for `❌ Database error`
- Verify `DATABASE_URL` is correct
- Check Prisma schema matches database

### Test 3: Is admin page reading correctly?
If record exists but not showing:
- Hard refresh browser (Ctrl+Shift+R)
- Check `/admin/intakes` uses correct table
- Verify RLS policies

## 📋 Current Status Checklist

- [ ] ngrok is running
- [ ] Twilio webhook URL is set to `/api/whatsapp/inbound`
- [ ] Dev server is running
- [ ] Sent test WhatsApp message FROM your phone
- [ ] Checked terminal for `🔥` log
- [ ] Checked `/admin/intakes` for new record

## 🎯 Most Likely Issue

**Twilio webhook URL is not configured or pointing to wrong endpoint.**

To fix:
1. Go to Twilio Console
2. Find WhatsApp Sandbox settings
3. Set "When a message comes in" URL
4. Use: `https://YOUR-NGROK-URL.ngrok.io/api/whatsapp/inbound`

## 🔍 How to Find Webhook Settings in Twilio

1. **Twilio Console** → **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Look for: **"Sandbox settings"** or **"Configuration"**
3. Find: **"When a message comes in"** field
4. This is where you set the webhook URL

If you can't find it, the webhook might be set at:
- **Phone Numbers** → Your WhatsApp number → **Messaging** tab
- **Messaging** → **Settings** → **WhatsApp Sandbox**

## 💡 Key Insight

**Outbound messages (you → farmer) work because you're calling Twilio API directly.**

**Inbound messages (farmer → you) need Twilio to call YOUR webhook, which requires:**
1. Webhook URL configured in Twilio
2. ngrok tunnel active
3. Your endpoint responding correctly

Right now, #1 is likely missing or incorrect.
