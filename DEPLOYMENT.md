# Deployment Guide - Bornfidis Provisions Phase 1

## Pre-Deployment Checklist

### 1. Environment Setup

Ensure you have accounts for:
- [ ] **Supabase** - Database hosting
- [ ] **Resend** - Email service
- [ ] **Vercel** - Hosting (or GitHub for version control)
- [ ] **Domain** (optional) - Custom domain setup

### 2. Database Setup (Supabase)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for project to initialize (2-3 minutes)

2. **Run Database Schema**
   - Open SQL Editor in Supabase dashboard
   - Copy contents of `supabase/schema.sql`
   - Paste and run the SQL
   - Verify table `booking_inquiries` was created
   - Verify RLS policies are enabled

3. **Get API Keys**
   - Go to Project Settings → API
   - Copy:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 3. Email Setup (Resend)

1. **Create Resend Account**
   - Go to [resend.com](https://resend.com)
   - Sign up for free account
   - Verify your email

2. **Get API Key**
   - Go to API Keys section
   - Create new API key
   - Copy key → `RESEND_API_KEY`

3. **Domain Verification** (Optional for production)
   - Add your domain in Resend dashboard
   - Add DNS records as instructed
   - For development, you can use Resend's test domain

### 4. Local Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Create `.env.local`**
   ```bash
   # Copy from .env.example and fill in values
   cp .env.example .env.local
   ```

3. **Fill in Environment Variables**
   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SITE_NAME=Bornfidis Provisions
   
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
   
   RESEND_API_KEY=re_xxxxx
   ADMIN_EMAIL=brian@bornfidis.com
   ADMIN_PASSWORD=your_secure_password_here
   ```

4. **Test Locally**
   ```bash
   npm run dev
   ```
   - Visit http://localhost:3000
   - Test booking form submission
   - Check Supabase dashboard for new record
   - Verify emails are sent

### 5. Deploy to Vercel

#### Option A: Deploy from GitHub

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Phase 1"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add ALL variables from `.env.local`:
     - `NEXT_PUBLIC_SITE_URL` (use production URL)
     - `NEXT_PUBLIC_SITE_NAME`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `RESEND_API_KEY`
     - `ADMIN_EMAIL`
     - `ADMIN_PASSWORD`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your deployment URL

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow prompts
   - Add environment variables when asked

### 6. Post-Deployment Testing

Test the following:

- [ ] **Home Page**
  - [ ] Page loads correctly
  - [ ] Logo/branding displays
  - [ ] "Request a Booking" button works

- [ ] **Booking Form**
  - [ ] Form validation works
  - [ ] Submit button creates record in Supabase
  - [ ] Redirects to `/thanks` page
  - [ ] Confirmation email sent to customer (if email provided)
  - [ ] Admin notification email sent

- [ ] **Admin Dashboard**
  - [ ] Password protection works
  - [ ] Can view all submissions
  - [ ] Can update status
  - [ ] Can set follow-up dates

- [ ] **Database**
  - [ ] Records appear in Supabase dashboard
  - [ ] RLS policies working (public can insert, service role can read/update)

### 7. Custom Domain Setup (Optional)

1. **In Vercel Dashboard**
   - Go to Project Settings → Domains
   - Add your domain (e.g., `bornfidis.com`)
   - Follow DNS configuration instructions

2. **Update Environment Variables**
   - Update `NEXT_PUBLIC_SITE_URL` to your custom domain

3. **Update Resend**
   - Add domain in Resend dashboard
   - Update email "from" address in `lib/email.ts`

### 8. Production Checklist

- [ ] All environment variables set in Vercel
- [ ] `ADMIN_PASSWORD` is strong and unique
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Email domain verified in Resend
- [ ] Test booking submission end-to-end
- [ ] Admin dashboard accessible and functional
- [ ] Error monitoring set up (optional)

## Troubleshooting

### Common Issues

**Issue: "Failed to save booking"**
- Check Supabase connection
- Verify RLS policies are correct
- Check service role key is set

**Issue: "Emails not sending"**
- Verify Resend API key
- Check Resend dashboard for errors
- Ensure domain is verified (for production)

**Issue: "Admin dashboard not loading"**
- Check `ADMIN_PASSWORD` is set
- Verify API routes are accessible
- Check browser console for errors

**Issue: "Build fails on Vercel"**
- Check all environment variables are set
- Verify TypeScript compiles locally
- Check build logs in Vercel dashboard

## Security Notes

- **Never commit** `.env.local` to git
- **Rotate** `ADMIN_PASSWORD` regularly
- **Keep** `SUPABASE_SERVICE_ROLE_KEY` secret (server-side only)
- **Use** strong passwords for admin access
- **Monitor** Supabase logs for suspicious activity

## Support

For issues or questions:
- Check Supabase logs
- Check Vercel deployment logs
- Review Resend email logs
- Contact: brian@bornfidis.com
