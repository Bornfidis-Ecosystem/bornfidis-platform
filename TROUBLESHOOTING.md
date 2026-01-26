# Troubleshooting Guide

## Common Issues and Solutions

### Error: "Failed to save booking. Please try again."

This error occurs when the form submission fails to save to Supabase. Here's how to fix it:

#### 1. Check if Database Table Exists

**Problem:** The `booking_inquiries` table hasn't been created yet.

**Solution:**
1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click "Run" to execute the SQL
5. Verify the table was created:
   - Go to Table Editor
   - You should see `booking_inquiries` table

#### 2. Check Row Level Security (RLS) Policies

**Problem:** RLS policies might not be set up correctly, blocking inserts.

**Solution:**
1. In Supabase dashboard, go to Authentication → Policies
2. Find the `booking_inquiries` table
3. Verify these policies exist:
   - **Policy 1:** "Public can submit bookings"
     - Type: INSERT
     - Target roles: anon
     - WITH CHECK: true
   - **Policy 2:** "Service role has full access"
     - Type: ALL
     - Target roles: service_role
     - USING: true, WITH CHECK: true

If policies are missing, run the SQL from `supabase/schema.sql` again.

#### 3. Check Environment Variables

**Problem:** Supabase credentials might be missing or incorrect.

**Solution:**
1. Verify `.env.local` exists and has all variables:
   ```bash
   # Check if file exists
   cat .env.local
   ```

2. Verify these variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL` - Should start with `https://`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Should be a long string
   - `SUPABASE_SERVICE_ROLE_KEY` - Should be a long string (keep secret!)

3. Restart your dev server after changing `.env.local`:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

#### 4. Check Supabase Connection

**Problem:** Network or connection issues.

**Solution:**
1. Check your Supabase project is active (not paused)
2. Verify the URL in `.env.local` matches your Supabase project URL
3. Check browser console for network errors
4. Check terminal/console for error messages

#### 5. Check Server Logs

**Problem:** More detailed error information might be in logs.

**Solution:**
1. Check your terminal where `npm run dev` is running
2. Look for error messages starting with "Database error:"
3. The error message will tell you exactly what's wrong

### Error: "Spam detected"

**Problem:** The honeypot field was filled (likely a bot).

**Solution:** This is working as intended. Real users shouldn't see this error. If you're testing and seeing this, make sure the hidden `website_url` field stays empty.

### Error: Validation Errors

**Problem:** Form data doesn't pass validation.

**Solution:**
- Check that all required fields are filled
- Verify email format is correct
- Ensure phone number has at least 10 characters
- Ensure location has at least 10 characters
- Ensure event date is today or in the future

### Admin Dashboard Not Loading

**Problem:** Can't access `/admin/submissions`

**Solution:**
1. Check `ADMIN_PASSWORD` is set in `.env.local`
2. Restart dev server after changing password
3. Clear browser session storage if you had a previous session

### Emails Not Sending

**Problem:** Confirmation or admin notification emails aren't being sent.

**Solution:**
1. Verify `RESEND_API_KEY` is set in `.env.local`
2. Check Resend dashboard for API key status
3. Verify `ADMIN_EMAIL` is set correctly
4. Check Resend dashboard for email logs/errors
5. For development, Resend might have rate limits on free tier

## Quick Debug Checklist

When form submission fails:

- [ ] Database table `booking_inquiries` exists in Supabase
- [ ] RLS policies are set up correctly
- [ ] `.env.local` has all Supabase variables
- [ ] Dev server was restarted after changing `.env.local`
- [ ] Supabase project is active (not paused)
- [ ] Check terminal/console for detailed error messages
- [ ] Verify Supabase URL and keys are correct

## Getting More Detailed Errors

The error handling has been improved to show more specific error messages. Check:

1. **Browser Console** (F12 → Console tab) - Client-side errors
2. **Terminal/Server Logs** - Server-side errors with full details
3. **Supabase Logs** - Database-level errors

## Still Having Issues?

1. Check Supabase dashboard → Logs for database errors
2. Verify all environment variables are correct
3. Try creating a test record directly in Supabase Table Editor
4. Check network tab in browser DevTools for failed requests
