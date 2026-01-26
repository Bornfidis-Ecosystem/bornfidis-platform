# Resend Email Setup Guide

## Current Status

If you're seeing emails from `onboarding@resend.dev`, that means you're using Resend's test domain. This works for development but you'll want to set up a custom domain for production.

## Development (Current Setup)

For now, emails will come from:
- `Bornfidis Provisions <onboarding@resend.dev>`

This works fine for testing and development.

## Production Setup (Custom Domain)

### Step 1: Add Domain in Resend

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain: `bornfidis.com` (or your domain)
4. Click "Add"

### Step 2: Add DNS Records

Resend will provide DNS records to add. You'll need to add these to your domain's DNS settings:

**Example DNS Records:**
```
Type: TXT
Name: @
Value: [provided by Resend]

Type: CNAME
Name: resend._domainkey
Value: [provided by Resend]
```

**Where to add DNS records:**
- If using Vercel: Vercel handles DNS automatically, but you may need to add records manually
- If using other DNS provider: Add records in your DNS management panel (GoDaddy, Namecheap, Cloudflare, etc.)

### Step 3: Verify Domain

1. Wait a few minutes for DNS to propagate
2. Go back to Resend dashboard
3. Click "Verify" on your domain
4. Once verified (green checkmark), you can use custom email addresses

### Step 4: Update Environment Variable

Once your domain is verified, update `.env.local`:

```env
# Use your verified domain
RESEND_FROM_EMAIL=Bornfidis Provisions <noreply@bornfidis.com>
# or
RESEND_FROM_EMAIL=Bornfidis Provisions <hello@bornfidis.com>
```

### Step 5: Restart Server

After updating `.env.local`, restart your dev server:
```bash
npm run dev
```

## Email Address Options

Once your domain is verified, you can use any email address on that domain:

- `noreply@bornfidis.com` - For automated emails (recommended)
- `hello@bornfidis.com` - For general inquiries
- `brian@bornfidis.com` - For personal emails
- `bookings@bornfidis.com` - For booking-related emails

## Current Configuration

The code uses an environment variable `RESEND_FROM_EMAIL` if set, otherwise falls back to:
- `Bornfidis Provisions <onboarding@resend.dev>` (Resend test domain)

## Testing

1. **Development:** Use `onboarding@resend.dev` (works immediately)
2. **Production:** Use your verified domain (e.g., `noreply@bornfidis.com`)

## Troubleshooting

**Issue: Emails not sending**
- Check Resend dashboard for errors
- Verify API key is correct
- Check domain verification status

**Issue: Domain not verifying**
- Wait 24-48 hours for DNS propagation
- Double-check DNS records are correct
- Contact Resend support if issues persist

**Issue: Emails going to spam**
- Verify SPF/DKIM records are set up correctly
- Use a proper "from" name (not just email)
- Avoid spam trigger words in subject/content

## Free Tier Limits

Resend's free tier includes:
- 3,000 emails/month
- 100 emails/day
- Custom domains supported

For production, the free tier should be sufficient for Phase 1.
