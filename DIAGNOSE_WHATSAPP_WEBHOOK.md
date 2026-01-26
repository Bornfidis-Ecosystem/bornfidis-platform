# 🔍 Diagnose WhatsApp Webhook Issue

## The Problem in Simple Terms

You can **send** WhatsApp messages TO farmers ✅
But when farmers **reply**, those replies aren't being saved ❌

## Why This Happens

**Outbound (You → Farmer):**
- You call Twilio API → Twilio sends message ✅
- This works because you control it

**Inbound (Farmer → You):**
- Farmer sends message → Twilio needs to call YOUR webhook
- Twilio doesn't know where to send it ❌
- **This is the missing link**

## 🎯 The Fix (3 Steps)

### Step 1: Check if Webhook is Being Hit

**Send a WhatsApp message FROM your phone TO the Twilio number**

Then check your terminal (where `npm run dev` is running):

**✅ If you see:**
```
🔥 WhatsApp inbound webhook HIT at [timestamp]
```
→ Webhook IS being hit, but database write might be failing

**❌ If you DON'T see this:**
→ Twilio webhook URL is not configured or wrong

### Step 2: Configure Twilio Webhook URL

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to: **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Click **"Sandbox settings"** tab (or look for "Configuration")
4. Find **"When a message comes in"** field
5. Enter your ngrok URL: `https://YOUR-NGROK-URL.ngrok.io/api/whatsapp/inbound`
6. Method: `POST`
7. Click **"Save"**

**Important:** Make sure ngrok is running and copy the exact URL

### Step 3: Test Again

1. Restart dev server (to ensure latest code)
2. Send WhatsApp message FROM your phone
3. Check terminal for `🔥` log
4. Check `/admin/intakes` for new record

## 🔍 Quick Diagnostic

Run this in your terminal to see if webhook endpoint is accessible:

```powershell
# Test if endpoint exists (should return 405 Method Not Allowed for GET, which is fine)
curl http://localhost:3000/api/whatsapp/inbound
```

If you get an error, the route might not be registered.

## 📋 Most Common Issues

### Issue 1: No `🔥` log when sending WhatsApp
**Cause:** Twilio webhook URL not configured
**Fix:** Set webhook URL in Twilio Console (see Step 2 above)

### Issue 2: `🔥` log appears but no database record
**Cause:** Database write failing
**Fix:** Check terminal for `❌ Database error` and fix the error

### Issue 3: ngrok URL changed
**Cause:** ngrok restarted, URL changed
**Fix:** Update Twilio webhook URL with new ngrok URL

## 🎯 What to Check Right Now

1. **Is ngrok running?**
   - Check your ngrok terminal window
   - Copy the HTTPS URL

2. **Is webhook configured in Twilio?**
   - Go to Twilio Console
   - Check "When a message comes in" field
   - Should match: `https://YOUR-NGROK-URL.ngrok.io/api/whatsapp/inbound`

3. **Is dev server running?**
   - Check your `npm run dev` terminal
   - Should show "Ready" message

4. **Send a test message**
   - From your phone to Twilio number
   - Watch terminal for `🔥` log

## 💡 Key Insight

**The webhook URL in Twilio is like a phone number - Twilio needs it to know where to send incoming messages.**

Without it configured, Twilio receives the message but doesn't know where to forward it.

Once configured, every WhatsApp message FROM farmers will:
1. Hit your webhook (`/api/whatsapp/inbound`)
2. Get saved to database
3. Appear in `/admin/intakes`

This is literally the final piece! 🌱
