# Stripe Connect Setup Guide

## Error Message

If you see this error:
> "You can only create new accounts if you've signed up for Connect"

This means your Stripe account needs to have Stripe Connect enabled before you can create Express accounts for chefs.

## How to Enable Stripe Connect

### Step 1: Go to Stripe Dashboard

1. Log in to your Stripe Dashboard: https://dashboard.stripe.com
2. Make sure you're in the correct account (test or live mode)

### Step 2: Navigate to Connect Settings

1. In the left sidebar, click on **"Connect"**
2. If you don't see "Connect" in the sidebar, you may need to enable it first
3. Click on **"Get started"** or **"Activate Connect"**

### Step 3: Complete Connect Setup

1. **Choose Account Type:**
   - Select **"Express accounts"** (this is what we're using)
   - This is the simplest option for chef partners

2. **Provide Business Information:**
   - Business name: "Bornfidis Provisions"
   - Business type: Individual or Business (as appropriate)
   - Country: United States (or your country)

3. **Review Terms:**
   - Read and accept Stripe Connect terms
   - Accept the agreement

4. **Complete Setup:**
   - Stripe will verify your information
   - This usually takes a few minutes

### Step 4: Verify Connect is Enabled

1. Go back to **"Connect"** in the sidebar
2. You should see:
   - "Express accounts" enabled
   - A dashboard showing connected accounts (empty at first)
   - Settings and configuration options

### Step 5: Test in Your App

1. Go back to `/admin/chefs`
2. Click "Approve" on a pending chef
3. The error should be gone, and a Stripe account should be created

## Test Mode vs Live Mode

### Test Mode (Development)

- Use test API keys: `sk_test_...`
- Test Connect accounts are created instantly
- No real money involved
- Perfect for development and testing

### Live Mode (Production)

- Use live API keys: `sk_live_...`
- Requires full business verification
- Real money and payouts
- Only enable when ready for production

## Troubleshooting

### "Connect" Not Showing in Dashboard

**Solution:**
1. Make sure you're logged into the correct Stripe account
2. Some accounts may need to complete additional verification
3. Contact Stripe support if Connect option is missing

### Still Getting Error After Enabling

**Solution:**
1. Verify you're using the correct API key:
   - Test mode: `STRIPE_SECRET_KEY=sk_test_...`
   - Live mode: `STRIPE_SECRET_KEY=sk_live_...`
2. Make sure the API key matches the account where Connect is enabled
3. Restart your development server after changing `.env.local`

### API Key Mismatch

**Problem:** Using test key but Connect enabled in live account (or vice versa)

**Solution:**
- Ensure your `STRIPE_SECRET_KEY` matches the account where Connect is enabled
- Check Stripe Dashboard → Developers → API keys

## Quick Checklist

- [ ] Logged into Stripe Dashboard
- [ ] Navigated to "Connect" section
- [ ] Enabled "Express accounts"
- [ ] Completed business information
- [ ] Accepted terms and conditions
- [ ] Verified Connect is active
- [ ] Using correct API key in `.env.local`
- [ ] Restarted dev server after changes

## Next Steps After Setup

Once Connect is enabled:

1. **Test Account Creation:**
   - Approve a test chef
   - Verify Stripe account is created (`acct_xxx`)
   - Check database: `SELECT stripe_connect_account_id FROM chefs WHERE id = '...'`

2. **Test Onboarding:**
   - Click "Send Onboarding Link"
   - Complete Stripe onboarding flow
   - Verify webhook updates status

3. **Test Payouts:**
   - Assign chef to booking
   - Complete payment
   - Verify automatic payout

## Support

If you continue to have issues:

1. **Stripe Support:**
   - Dashboard → Help → Contact Support
   - Or email: support@stripe.com

2. **Stripe Documentation:**
   - https://stripe.com/docs/connect
   - https://stripe.com/docs/connect/express-accounts

3. **Check Server Logs:**
   - Look for detailed error messages
   - Check Stripe API response errors

## Important Notes

- **Express accounts** are the simplest option for chef partners
- Each chef gets their own Stripe account
- You (platform) control payouts
- Chefs receive funds directly to their bank account
- Platform fee (30%) stays with you automatically
