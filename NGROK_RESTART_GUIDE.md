# 🔧 ngrok Restart Guide

## The Problem

ngrok tunnel is **offline** - that's why Twilio can't reach your webhook.

Error: `ERR_NGROK_3200 - The endpoint abc123.ngrok.io is offline`

## ✅ Quick Fix

### Step 1: Start ngrok

Open a **new terminal window** and run:

```powershell
ngrok http 3000
```

**Important:** Keep this terminal window open! If you close it, ngrok stops.

### Step 2: Copy the New ngrok URL

You'll see output like:
```
Forwarding   https://xyz789.ngrok.io -> http://localhost:3000
```

Copy the **HTTPS URL** (the one starting with `https://`)

### Step 3: Update Twilio Webhook URL

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to: **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Click **"Sandbox settings"** tab
4. Find **"When a message comes in"** field
5. Paste your NEW ngrok URL: `https://NEW-NGROK-URL.ngrok.io/api/whatsapp/inbound`
6. Method: `POST`
7. Click **"Save"**

### Step 4: Verify Dev Server is Running

In your main terminal (where you run `npm run dev`):
- Make sure it says "Ready" or "Local: http://localhost:3000"
- If not running, start it: `npm run dev`

### Step 5: Test

1. Send a WhatsApp message FROM your phone TO the Twilio number
2. Check your `npm run dev` terminal for `🔥` log
3. Check `/admin/intakes` for new record

## 🎯 Important Notes

- **ngrok URL changes every time you restart ngrok** (unless you have a paid plan)
- **You must update Twilio webhook URL** each time ngrok restarts
- **Keep ngrok terminal open** - closing it stops the tunnel
- **Both ngrok AND dev server must be running** for webhook to work

## 🔍 Verify Everything is Connected

After restarting ngrok and updating Twilio:

1. **Test webhook directly:**
   ```
   Visit: https://YOUR-NGROK-URL.ngrok.io/api/whatsapp/inbound
   ```
   Should show an error (405 Method Not Allowed) - that's fine, means route exists

2. **Send WhatsApp message** and watch terminal for `🔥` log

3. **Check admin dashboard** for new intake record

## 💡 Pro Tip

If you restart ngrok frequently, consider:
- Using ngrok's paid plan for static URLs
- Or creating a script to auto-update Twilio webhook URL

For now, just restart ngrok and update Twilio manually.
