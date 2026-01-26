# Twilio WhatsApp Webhook Setup Guide

## 🎯 The Problem

You can **send** WhatsApp messages (outbound ✅), but when farmers **reply**, those replies aren't being saved (inbound ❌).

## 🔍 Why This Happens

Twilio needs to know **where to send** incoming WhatsApp messages. This is called a **webhook URL**.

Right now, Twilio either:
- Doesn't have a webhook URL configured
- Has the wrong webhook URL
- Webhook URL points to a dead endpoint

## ✅ Step-by-Step Fix

### Step 1: Get Your ngrok URL

Make sure ngrok is running:
```powershell
ngrok http 3000
```

Copy the HTTPS URL (looks like: `https://abc123.ngrok.io`)

### Step 2: Configure Twilio Webhook

**Option A: Via WhatsApp Sandbox Settings**

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to: **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Click **"Sandbox settings"** tab
4. Find **"When a message comes in"** field
5. Enter: `https://YOUR-NGROK-URL.ngrok.io/api/whatsapp/inbound`
6. Method: `POST`
7. Click **"Save"**

**Option B: Via Phone Number Settings**

1. Go to: **Phone Numbers** → **Manage** → **Active numbers**
2. Click your WhatsApp-enabled number
3. Scroll to **"Messaging"** section
4. Find **"A MESSAGE COMES IN"** field
5. Enter: `https://YOUR-NGROK-URL.ngrok.io/api/whatsapp/inbound`
6. Method: `POST`
7. Click **"Save"**

### Step 3: Test the Webhook

1. **Restart your dev server** (to ensure latest code is running)
2. **Send a WhatsApp message** FROM your phone TO the Twilio number
3. **Watch your terminal** - you should see:
   ```
   🔥 WhatsApp inbound webhook HIT at [timestamp]
   ```
4. **Check `/admin/intakes`** - you should see the new record

## 🧪 Verification Checklist

After configuring the webhook:

- [ ] ngrok is running and URL is stable
- [ ] Twilio webhook URL matches ngrok URL exactly
- [ ] Webhook URL ends with `/api/whatsapp/inbound`
- [ ] Method is set to `POST` (not GET)
- [ ] Dev server is running
- [ ] Sent test message FROM your phone
- [ ] Terminal shows `🔥` log
- [ ] `/admin/intakes` shows new record

## 🔍 Troubleshooting

### Issue: No `🔥` log in terminal

**Problem:** Webhook not being hit

**Possible causes:**
1. Twilio webhook URL is wrong
2. ngrok tunnel is down
3. Route path mismatch

**Fix:**
- Verify Twilio webhook URL exactly matches: `https://YOUR-NGROK-URL.ngrok.io/api/whatsapp/inbound`
- Check ngrok is still running
- Restart ngrok if needed (URL will change - update Twilio!)

### Issue: See `🔥` but no record in admin

**Problem:** Database write failing

**Check terminal for:**
- `❌ Database error creating intake:`
- Full error message

**Fix:**
- Verify `DATABASE_URL` in `.env.local`
- Check Prisma schema matches database
- Restart dev server

### Issue: Record appears but wrong data

**Problem:** Field mapping issue

**Check:**
- Terminal logs show correct `from` and `body` values
- Prisma model field names match what you're inserting

## 📱 Testing Flow

1. **Configure webhook** in Twilio (use ngrok URL)
2. **Restart dev server**
3. **Send WhatsApp message** from your phone to Twilio number
4. **Watch terminal** for diagnostic logs
5. **Check admin dashboard** for new intake

## 🎯 Expected Result

When you send a WhatsApp message, you should see:

**Terminal:**
```
🔥 WhatsApp inbound webhook HIT at 2026-01-22T...
📋 Form data keys received: ['From', 'Body', 'MessageSid', ...]
📲 WhatsApp inbound payload: { from: 'whatsapp:+18764488446', body: 'Hello...', ... }
📞 Extracted phone: +18764488446
💾 Attempting to create FarmerIntake record...
✅ FarmerIntake record created successfully: abc-123-def
📤 Returning TwiML response
```

**Admin Dashboard:**
- New record with Channel: "whatsapp"
- From: Your actual phone number
- Preview: Your message text

## 💡 Key Point

**The webhook URL in Twilio is the missing link.**

Once configured correctly, every WhatsApp message FROM farmers will:
1. Hit your webhook
2. Get saved to database
3. Appear in admin dashboard

This is the final piece! 🌱
