# Email Debugging Guide

## Why You Might Not Receive Emails

### 1. Check RESEND_API_KEY

**Problem:** API key not set or incorrect.

**Solution:**
1. Check `.env.local` has `RESEND_API_KEY` set
2. Verify the key is correct in Resend dashboard
3. Restart dev server after changing `.env.local`:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### 2. Check Email Address

**Problem:** Email field might be empty or invalid.

**Solution:**
- Check the form submission - was an email address provided?
- Look in terminal/console for: `"Sending confirmation email to: [email]"`
- If you see "Invalid email address", the email field was empty or malformed

### 3. Check Resend Dashboard

**Problem:** Emails might be blocked or failed.

**Solution:**
1. Go to [Resend Dashboard](https://resend.com/emails)
2. Check the "Emails" section
3. Look for your sent emails
4. Check status (sent, delivered, failed)
5. If failed, check the error message

### 4. Check Spam Folder

**Problem:** Email went to spam.

**Solution:**
- Check spam/junk folder
- For `onboarding@resend.dev`, emails often go to spam
- Once you verify a custom domain, spam rate decreases

### 5. Check Terminal/Console Logs

**Problem:** Errors are logged but not visible.

**Solution:**
Look in your terminal where `npm run dev` is running for:
- ✅ `"Sending confirmation email to: [email]"`
- ✅ `"Confirmation email sent successfully"`
- ❌ `"Error sending confirmation email:"`
- ❌ `"Resend client not initialized"`

### 6. Resend Free Tier Limits

**Problem:** Hit rate limits.

**Solution:**
- Free tier: 100 emails/day, 3,000/month
- Check Resend dashboard for usage
- Wait if you've hit the limit

## Debugging Steps

### Step 1: Verify Environment Variables

```bash
# Check if RESEND_API_KEY is set
# In your terminal, run:
echo $RESEND_API_KEY
# (Linux/Mac)

# Or check .env.local file
cat .env.local | grep RESEND
```

### Step 2: Check Server Logs

When you submit the form, watch your terminal for:
```
Sending confirmation email to: your@email.com
✅ Confirmation email sent successfully
```

If you see errors instead, note the error message.

### Step 3: Test Email Directly

You can test if Resend is working by checking:
1. Resend dashboard → API Keys → Verify key is active
2. Resend dashboard → Emails → See if any emails were attempted

### Step 4: Verify Email Address Format

The email must:
- Include `@` symbol
- Have a valid domain
- Not be empty

Check the form - was the email field filled in?

## Common Issues

### Issue: "Resend client not initialized"

**Fix:** Add `RESEND_API_KEY` to `.env.local` and restart server.

### Issue: "Invalid email address"

**Fix:** Make sure email field in form is filled and valid.

### Issue: Emails in Resend dashboard but not received

**Fix:**
- Check spam folder
- Verify email address is correct
- Check Resend shows "delivered" status

### Issue: No emails in Resend dashboard

**Fix:**
- Check API key is correct
- Check server logs for errors
- Verify email sending code is being called

## Quick Test

1. Submit the booking form with a valid email
2. Check terminal for email logs
3. Check Resend dashboard for sent emails
4. Check your inbox (and spam folder)

## Still Not Working?

1. Check terminal/console for detailed error messages
2. Verify `RESEND_API_KEY` in `.env.local`
3. Check Resend dashboard for email status
4. Try a different email address
5. Check Resend account status (not suspended)
