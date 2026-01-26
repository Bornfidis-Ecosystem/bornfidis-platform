# WhatsApp Messages Not Appearing - Fix Applied

## What Was Fixed

1. **Webhook Route** (`/api/whatsapp-simple/route.ts`):
   - ✅ Now uses `supabaseAdmin` (service role key) instead of `supabase` (anon key)
   - ✅ This bypasses RLS policies that were blocking inserts
   - ✅ Fixed phone number extraction (now keeps `+` prefix)

2. **Admin Page** (`/admin/whatsapp/page.tsx`):
   - ✅ Now fetches messages via API route instead of direct client query
   - ✅ Uses service role key server-side to bypass RLS

3. **New API Routes**:
   - ✅ `/api/admin/whatsapp-messages` - Fetches messages for admin page
   - ✅ `/api/admin/whatsapp-diagnose` - Diagnostic endpoint to check table status

## Critical: Twilio Webhook Configuration

**Twilio MUST be pointing to the correct webhook URL:**

### For Local Development:
```
http://localhost:3000/api/whatsapp-simple
```

### For Production (Vercel):
```
https://your-domain.vercel.app/api/whatsapp-simple
```

**⚠️ IMPORTANT:** Make sure Twilio is calling `/api/whatsapp-simple` (not `/api/whatsapp/inbound`)

## How to Test

### Step 1: Check if Table Exists
Visit: `http://localhost:3000/api/admin/whatsapp-diagnose`

You should see:
```json
{
  "success": true,
  "tableExists": true,
  "messageCount": 0,
  "latestMessages": []
}
```

### Step 2: Send a Test WhatsApp Message
1. Send a WhatsApp message to your Twilio number
2. Check your terminal/console for logs: `📲 WhatsApp message received`
3. Check the diagnostic endpoint again - `messageCount` should increase

### Step 3: Check Admin Page
Visit: `http://localhost:3000/admin/whatsapp`

Messages should now appear!

## Troubleshooting

### If messages still don't appear:

1. **Check Twilio Webhook URL:**
   - Go to Twilio Console → Messaging → Try WhatsApp → Sandbox
   - Verify webhook URL is: `http://localhost:3000/api/whatsapp-simple`
   - Make sure method is `POST`

2. **Check Terminal Logs:**
   - When you send a WhatsApp message, you should see: `📲 WhatsApp message received`
   - If you don't see this, Twilio isn't calling your webhook

3. **Check Supabase Table:**
   - Go to Supabase Dashboard → Table Editor → `whatsapp_messages`
   - Check if rows are being inserted
   - If table doesn't exist, create it with these columns:
     - `id` (uuid, primary key, default: `gen_random_uuid()`)
     - `created_at` (timestamptz, default: `now()`)
     - `phone_number` (text)
     - `message_text` (text)
     - `farmer_name` (text, nullable)

4. **Check RLS Policies:**
   - Go to Supabase Dashboard → Authentication → Policies
   - For `whatsapp_messages` table:
     - If RLS is enabled, you need policies OR use service role key (which we're doing)
     - Service role key bypasses RLS, so this should work

5. **Test Webhook Directly:**
   ```bash
   curl -X POST http://localhost:3000/api/whatsapp-simple \
     -d "From=whatsapp:+18761234567" \
     -d "Body=Test message"
   ```
   
   Then check diagnostic endpoint to see if message was saved.

## Next Steps

Once messages are appearing:
1. ✅ Messages are being saved
2. ✅ Admin can view messages
3. 🔄 Next: Add farmer profile creation from messages
4. 🔄 Next: Add parsing and status updates
