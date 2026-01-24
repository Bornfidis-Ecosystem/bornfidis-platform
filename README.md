# Bornfidis Provisions - Booking & Inquiry System (Phase 1)

A production-ready Next.js application for Bornfidis Provisions, a faith-anchored food enterprise offering premium chef services and catering.

## Project Overview

This is Phase 1 of the Bornfidis Provisions platform - a minimal booking and inquiry system that allows customers to request chef services or catering. Admin reviews submissions and follows up offline.

**This is NOT a marketplace or SaaS app** - it's a simple, focused booking system.

## Tech Stack

- **Framework:** Next.js 14+ (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Email:** Resend
- **Hosting:** Vercel

## Project Structure

```
├── app/
│   ├── page.tsx              # Home page
│   ├── book/
│   │   └── page.tsx         # Booking form
│   ├── thanks/
│   │   └── page.tsx         # Confirmation page
│   ├── admin/
│   │   └── submissions/
│   │       └── page.tsx     # Admin dashboard
│   ├── api/
│   │   └── admin/           # Admin API routes
│   ├── actions.ts           # Server actions
│   └── layout.tsx           # Root layout
├── lib/
│   ├── supabase.ts          # Supabase clients
│   ├── email.ts             # Email utilities
│   └── validation.ts        # Form validation (Zod)
├── types/
│   └── booking.ts           # TypeScript types
├── supabase/
│   └── schema.sql           # Database schema
└── public/
    └── brand/               # Brand assets
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run the SQL from `supabase/schema.sql`
4. Copy your project URL and API keys

### 3. Set Up Resend (Email)

1. Create an account at [resend.com](https://resend.com)
2. Create an API key
3. Verify your domain (or use the test domain for development)

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Bornfidis Provisions

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx
ADMIN_EMAIL=brian@bornfidis.com

# Admin Auth (Temporary - Phase 1)
ADMIN_PASSWORD=secure_temporary_password_change_me
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add all environment variables in Vercel dashboard (Settings → Environment Variables)
4. Deploy

### 3. Post-Deployment Checklist

- [ ] Verify production site loads
- [ ] Test booking form submission end-to-end
- [ ] Check email delivery (confirmation + admin notification)
- [ ] Test admin dashboard access
- [ ] Set up custom domain (if applicable)

## Features

### Public Pages

- **Home (`/`):** Hero section, story, CTA, contact information
- **Booking Form (`/book`):** Complete inquiry form with validation
- **Thanks (`/thanks`):** Confirmation page after submission

### Admin Dashboard

- **Admin Submissions (`/admin/submissions`):** View and manage booking inquiries
  - Password-protected (simple env check for Phase 1)
  - View all submissions (newest first)
  - Update status (New / Contacted / Confirmed / Closed)
  - Set follow-up dates

### Email Notifications

- **Customer Confirmation:** Sent when booking is submitted (if email provided)
- **Admin Notification:** Sent to admin email for every new submission

## Database Schema

The `booking_inquiries` table includes:

- Customer info (name, email, phone)
- Event details (date, time, location, guests)
- Preferences (budget, dietary restrictions, notes)
- Admin fields (status, follow-up date)

See `supabase/schema.sql` for complete schema and RLS policies.

## Security Notes (Phase 1)

- Admin access uses simple password check (environment variable)
- Honeypot field on booking form for spam protection
- Row Level Security (RLS) enabled on Supabase
- Service role key used only server-side (never exposed to client)

**For Phase 2:** Implement proper authentication system (Supabase Auth).

## Brand Colors

- **Navy Blue:** `#002747`
- **Gold:** `#FFBC00`
- **White:** `#FFFFFF`

## Development Notes

- Uses Next.js App Router
- Server Actions for form submissions
- Type-safe with TypeScript
- Client-side and server-side validation
- Clean, minimal UI with Tailwind CSS

## Governance

Bornfidis operates under a faith-anchored governance framework that guides our decisions, operations, and community relationships. See [GOVERNANCE.md](./GOVERNANCE.md) for our complete governance manifest, including our covenant, values, decision-making principles, and accountability framework.

## Support

For questions or issues, contact: brian@bornfidis.com

---

**Phase 1 Status:** ✅ Complete

Next phases will include:
- Phase 1B: Stripe payment integration
- Phase 2: Proper authentication, analytics
- Phase 3+: Marketplace features
