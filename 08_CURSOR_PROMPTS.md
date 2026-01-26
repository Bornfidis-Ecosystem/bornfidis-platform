# CURSOR PROMPTS FOR BORNFIDIS BUILD

## HOW TO USE THESE PROMPTS

1. **Prepare first:** Complete all requirement files (01-07)
2. **One prompt at a time:** Don't rush, verify each output
3. **Review before proceeding:** Check generated code against requirements
4. **Commit frequently:** Git commit after each successful prompt
5. **Test thoroughly:** Verify locally before moving to next prompt

---

## PROMPT 1: PROJECT INITIALIZATION
```
You are a senior full-stack engineer building a production-ready Next.js website.

PROJECT: Bornfidis Provisions - Premium chef services booking platform

REQUIREMENTS:
- Next.js 14+ (App Router, TypeScript strict mode)
- Tailwind CSS for styling
- Clean, professional design (forest green #2C5F2D + gold #D4AF37)
- Mobile-first responsive
- Brand voice: professional, warm, faith-anchored (not preachy)

PAGES TO CREATE:
1. Home (/) - Hero, services overview, call-to-action
2. About (/about) - Chef bio, mission, values
3. Book (/book) - Booking inquiry form
4. Thank You (/thanks) - Confirmation after form submission
5. Admin Submissions (/admin/submissions) - View inquiries (password-protected)

SETUP REQUIREMENTS:
- Configure Tailwind with brand colors
- Set up Google Fonts: Montserrat (headings) + Lora (body)
- Create reusable components: Button, Input, Select, Textarea
- Include proper metadata (SEO)
- Add /docs/README.md with setup instructions

FOLDER STRUCTURE:
Follow Next.js best practices:
- app/ (pages and layouts)
- components/ (reusable UI)
- lib/ (utilities, clients)
- types/ (TypeScript definitions)
- public/ (static assets)

DELIVERABLES:
1. Complete file tree
2. Implement files one-by-one
3. Include placeholder content (will be replaced with real copy)
4. Basic responsive navigation with mobile menu
5. Footer with contact info and links

Start with the file tree, then implement each file. Ask before proceeding to next file.
```

**Expected Output:**
- Project initialized with Next.js + TypeScript
- Tailwind configured with brand colors
- Basic page structure created
- Navigation and footer components

**Verification:**
- Run `npm run dev` - site loads without errors
- Check responsive behavior on mobile
- Verify fonts loading correctly

---

## PROMPT 2: SUPABASE DATABASE SETUP
```
Set up Supabase database for booking inquiries.

CONTEXT:
I have a Supabase project with these credentials:
- SUPABASE_URL: [your URL]
- SUPABASE_ANON_KEY: [your key]
- SUPABASE_SERVICE_ROLE_KEY: [your key]

TABLE SPECIFICATION:
Create table: booking_inquiries

FIELDS (refer to 05_DATA_FIELDS.md for complete spec):
Core: id (uuid), created_at, updated_at
Customer: name*, email, phone, whatsapp, preferred_contact
Event: event_type*, event_date*, event_time, event_location*, location_city, location_state
Service: guest_count, budget_range, dietary_restrictions, menu_preferences, special_requests
Admin: status (default 'new'), status_updated_at, follow_up_date, deposit_status, deposit_amount, final_quote, internal_notes
Tracking: referral_source, utm_source, utm_campaign

REQUIREMENTS:
1. Provide SQL migration script
2. Create indexes for: status, event_date, created_at
3. Add trigger for auto-updating updated_at
4. Implement Row Level Security (RLS):
   - Public (anon) can INSERT only
   - Authenticated can SELECT/UPDATE
   - Service role has full access

5. Create Supabase client in /lib/supabase.ts:
   - Server client (for API routes)
   - Client component client (for browser)
   - Type definitions for booking_inquiries table

DELIVERABLES:
1. SQL migration file (migrations/001_create_booking_inquiries.sql)
2. /lib/supabase.ts with both clients
3. /types/booking.ts with TypeScript types
4. Instructions for running migration in Supabase dashboard

Provide files one-by-one with clear instructions.
```

**Expected Output:**
- SQL migration script
- Supabase client setup
- TypeScript types for database

**Verification:**
- Run migration in Supabase SQL Editor
- Test RLS policies (try INSERT without auth, should work)
- Verify types match database schema

---

## PROMPT 3: BOOKING FORM WITH VALIDATION
```
Build the booking inquiry form with full validation.

CONTEXT:
Form page: /app/book/page.tsx
Form submits to: Server Action or API route (your choice, but must be server-side)
Database: Supabase (client already configured in /lib/supabase.ts)

FORM FIELDS (refer to 05_DATA_FIELDS.md):
Section 1: Your Information
- name* (text)
- email* (email)
- phone (tel, optional)
- whatsapp (tel, optional)
- preferred_contact (radio: email/phone/whatsapp)

Section 2: Event Details
- event_type* (select: Private Chef, Corporate Catering, Other)
- event_date* (date picker, min: today + 14 days)
- event_time (time, optional)
- event_location* (textarea, min 10 chars)
- guest_count (number, optional)

Section 3: Preferences
- budget_range (select: under_1000, 1000_2000, 2000_5000, 5000_plus, flexible)
- dietary_restrictions (textarea, optional)
- menu_preferences (textarea, optional)
- special_requests (textarea, optional)

Section 4: How Did You Hear About Us?
- referral_source (select: Website, Instagram, Word of Mouth, Google, Other)

VALIDATION REQUIREMENTS:
- Use Zod for schema validation
- Client-side: Show errors immediately on blur
- Server-side: Validate again before DB insert (security)
- Required fields marked with asterisk
- Date validation: Must be at least 14 days from today
- Honeypot field (hidden "website_url" - reject if filled)

SPAM PROTECTION:
- Honeypot field
- Rate limit: Max 3 submissions per IP per hour (use Next.js middleware or simple in-memory cache)
- Basic email domain validation (block obvious spam domains)

UI/UX REQUIREMENTS:
- Mobile-first responsive design
- Clear error messages below each field
- Loading state during submission
- Disable submit button while processing
- Show success message or redirect to /thanks on success

DELIVERABLES:
1. /app/book/page.tsx - Form component
2. /lib/validation.ts - Zod schemas
3. Server Action or API route for form submission
4. Error handling with user-friendly messages
5. Success redirect to /thanks with booking ID in URL

Implement with TypeScript strict mode. Show me the form component first, then the validation and submission logic.
```

**Expected Output:**
- Fully functional booking form
- Client and server-side validation
- Database insertion working
- Error handling implemented

**Verification:**
- Submit valid form - should insert to database
- Submit invalid form - should show errors
- Check Supabase dashboard for new row
- Test honeypot (fill hidden field, should reject)

---

## PROMPT 4: EMAIL NOTIFICATIONS
```
Implement email confirmations for booking inquiries.

CONTEXT:
Using Resend for email delivery
API Key: [your RESEND_API_KEY]
Admin email: brian@bornfidis.com

EMAIL SETUP:
Install: npm install resend react-email
Create /lib/email.ts with Resend client
Create email templates in /emails/ using React Email

EMAIL 1: Customer Confirmation
TO: Customer email from form
SUBJECT: "Inquiry Received - Bornfidis Provisions"
CONTENT (refer to 05_DATA_FIELDS.md for template):
- Thank you message
- Summary of their request (event date, location, guests, dietary)
- Next steps (we'll respond in 24hrs)
- Contact info (email, WhatsApp)
- Professional but warm tone

EMAIL 2: Admin Notification
TO: brian@bornfidis.com
SUBJECT: "NEW BOOKING INQUIRY - [name] - [event_date]"
CONTENT:
- All form data formatted clearly
- Direct link to admin dashboard: /admin/submissions/[id]
- Highlighted: event date, guest count, budget

REQUIREMENTS:
1. Create email templates with React Email (type-safe, reusable)
2. Send both emails in the form submission flow
3. Handle email failures gracefully (log error, but don't block form submission)
4. Include proper error logging
5. Test mode: Log emails to console in development

DELIVERABLES:
1. /lib/email.ts - Resend client + send functions
2. /emails/BookingConfirmation.tsx - Customer email template
3. /emails/AdminNotification.tsx - Admin email template
4. Updated form submission to call email functions
5. Error handling for email failures

Design emails with:
- Clean HTML (table-based layout for email client compatibility)
- Brand colors (forest green + gold accents)
- Mobile-responsive
- Plain text fallback

Show me the email client setup first, then each template.
```

**Expected Output:**
- Email client configured
- React Email templates created
- Emails sending on form submission
- Error handling implemented

**Verification:**
- Submit form, check both emails received
- Verify email formatting (test in Gmail, Outlook)
- Check spam folder if not in inbox
- Test failure scenario (invalid API key)

---

## PROMPT 5: ADMIN DASHBOARD
```
Build the admin submissions dashboard.

CONTEXT:
Page: /app/admin/submissions/page.tsx
Protected by: Environment variable password (temporary - Phase 1)
Database: Supabase booking_inquiries table

AUTHENTICATION (Temporary):
- Create /app/admin/layout.tsx
- Check password from environment: ADMIN_PASSWORD
- Show login form if not authenticated
- Store auth state in session/cookie (simple implementation)
- Will be replaced with proper Supabase Auth in Phase 2

DASHBOARD FEATURES:
1. Table view of all inquiries:
   - Columns: Created Date, Name, Event Date, Guests, Status, Actions
   - Sortable by: Created Date (default desc), Event Date
   - Color-coded status badges (new=blue, contacted=yellow, confirmed=green, etc.)

2. Filters (optional Phase 1, nice to have):
   - By status
   - By date range
   - Search by name/email

3. Detail view (click row or "View" button):
   - Show all form data
   - Allow status update (dropdown)
   - Add internal notes (textarea)
   - Set follow-up date (date picker)
   - Update button saves changes to Supabase

4. Actions:
   - Update status
   - Add internal notes
   - Delete inquiry (with confirmation)
   - Send follow-up email (Phase 2)

UI REQUIREMENTS:
- Clean table layout (use shadcn/ui Table or build custom)
- Mobile responsive (cards on mobile instead of table)
- Loading states for data fetch
- Empty state if no inquiries
- Success/error toasts for actions

DELIVERABLES:
1. /app/admin/layout.tsx - Password protection
2. /app/admin/submissions/page.tsx - Main dashboard
3. /components/admin/SubmissionTable.tsx - Table component
4. /components/admin/StatusBadge.tsx - Color-coded status
5. /components/admin/SubmissionDetail.tsx - Detail/edit view (modal or separate page)
6. API route or Server Action for updates

Show me the auth layer first, then the table component, then detail view.
```

**Expected Output:**
- Admin dashboard with password protection
- Table of submissions loading from Supabase
- Status updates working
- Internal notes editable

**Verification:**
- Access /admin/submissions (should prompt for password)
- Enter correct password (from .env.local)
- View submissions table
- Update status, verify in Supabase
- Add internal note, verify saved

---

## PROMPT 6: CONTENT POPULATION & POLISH
```
Replace all placeholder content with real copy and polish the site.

CONTEXT:
I have prepared all content in 04_CONTENT.md including:
- About copy (short + long)
- Mission statement
- Chef bio
- Values
- Service descriptions
- FAQs
- Testimonials (placeholders for now)

TASKS:
1. Update homepage:
   - Hero section with compelling headline
   - Services overview (Private Chef, Corporate Catering)
   - Social proof section (awards, recognition)
   - Call-to-action (Book Now button)
   
2. Update /about page:
   - Chef bio (professional but warm)
   - Mission and values
   - Photo placeholders with alt text
   - Contact info

3. Add FAQ section (either standalone page or on /book):
   - 8 most common questions from 02_OFFERS.md
   - Accordion component for clean UX

4. Footer updates:
   - Quick links (About, Services, Book, FAQ)
   - Contact info (email, WhatsApp)
   - "Part of Bornfidis Ecosystem" tagline
   - Copyright

5. SEO metadata:
   - Update page titles and descriptions
   - Add Open Graph tags for social sharing
   - Add structured data (Schema.org) for local business

6. Accessibility:
   - Proper heading hierarchy (h1, h2, h3)
   - Alt text for all images
   - ARIA labels for form fields
   - Keyboard navigation working

CONTENT TO USE:
Paste content from 04_CONTENT.md here, or I'll provide section by section.

DELIVERABLES:
- All pages updated with real content
- SEO metadata implemented
- Accessibility improvements
- Final polish (spacing, typography, colors)

Go page by page, show me updates before implementing next page.
```

**Expected Output:**
- All pages have real content (no more "Lorem ipsum")
- SEO tags properly configured
- Accessibility improved
- Site feels complete and professional

**Verification:**
- Read through each page for typos/errors
- Check SEO with Google Lighthouse
- Test with screen reader (basic check)
- Verify mobile responsiveness

---

## PROMPT 7: DEPLOYMENT PREPARATION
```
Prepare the project for Vercel deployment.

TASKS:
1. Environment variables documentation:
   - Create .env.example with all required variables (placeholder values)
   - Update README.md with setup instructions
   - Document which variables are sensitive (never commit)

2. Build verification:
   - Run `npm run build` locally
   - Fix any TypeScript errors
   - Fix any build warnings
   - Verify all environment variables referenced exist

3. Create deployment checklist in /docs/deployment.md:
   - Pre-deploy steps
   - Vercel environment variable setup
   - Post-deploy verification
   - Rollback procedure

4. Security review:
   - Verify .env.local in .gitignore
   - Check no hardcoded secrets
   - Confirm RLS policies active
   - Rate limiting functional

5. Testing checklist:
   - Form submission end-to-end
   - Email delivery
   - Admin dashboard access
   - Mobile responsiveness
   - Cross-browser (Chrome, Firefox, Safari)

6. README.md updates:
   - Project description
   - Local development setup
   - Environment variables needed
   - Deployment instructions
   - Troubleshooting common issues

DELIVERABLES:
1. .env.example file
2. Updated README.md
3. /docs/deployment.md checklist
4. Build passing with no errors
5. All files properly committed to git

Provide the deployment checklist and README updates.
```

**Expected Output:**
- Clean build with no errors
- Documentation complete
- Ready to deploy to Vercel

**Verification:**
- `npm run build` succeeds
- `npm run start` (production mode) works locally
- All documentation readable and accurate

---

## PROMPT 8: VERCEL DEPLOYMENT
```
Guide me through deploying to Vercel.

CONTEXT:
- GitHub repository: [your repo URL]
- Custom domain: bornfidis.com (or subdomain)

STEPS TO WALK THROUGH:
1. Create Vercel project from GitHub repo
2. Configure build settings (Next.js auto-detected)
3. Set environment variables in Vercel dashboard
4. Deploy to preview first
5. Test preview deployment thoroughly
6. Promote to production
7. Configure custom domain
8. Set up DNS records

ENVIRONMENT VARIABLES TO SET:
List all from .env.example with production values:
- NEXT_PUBLIC_SITE_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- RESEND_API_KEY
- ADMIN_EMAIL
- ADMIN_PASSWORD

POST-DEPLOYMENT VERIFICATION:
1. Site loads at production URL
2. Form submission works end-to-end
3. Emails deliver successfully
4. Admin dashboard accessible with password
5. Database inserts working
6. No console errors

MONITORING SETUP:
- Enable Vercel Analytics
- Set up error tracking (optional: Sentry)
- Configure uptime monitoring (optional: UptimeRobot)

DELIVERABLES:
Step-by-step deployment guide with screenshots placeholders.
Troubleshooting section for common issues.
Post-deploy checklist for verification.

Provide deployment guide and verification checklist.
```

**Expected Output:**
- Site deployed to Vercel
- Custom domain configured
- All functionality working in production
- Monitoring set up

**Verification:**
- Visit production URL
- Submit test booking
- Verify email received
- Check admin dashboard
- Test on mobile device
- Share with trusted friend for feedback

---

## PROMPT 9: STRIPE INTEGRATION (PHASE 1B)
```
Add Stripe payment for booking deposits.

CONTEXT:
Stripe account: [your Stripe account]
Product: Booking deposit (30% of total, or custom amount)
Flow: Customer receives email after inquiry → Email includes deposit payment link → Customer pays → Admin notified

SETUP:
1. Install Stripe: npm install stripe @stripe/stripe-js
2. Create /lib/stripe.ts with Stripe client (server-side)
3. Environment variables:
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET (for webhook verification)

IMPLEMENTATION:
1. API Route: POST /api/create-payment-link
   - Input: booking_id, amount
   - Create Stripe Checkout session
   - Return payment URL
   - Store session ID in booking_inquiries table

2. Update booking confirmation email:
   - Include payment link if deposit required
   - Clear instructions (optional but recommended)

3. Webhook: POST /api/webhooks/stripe
   - Listen for checkout.session.completed
   - Update booking_inquiries: deposit_status = 'paid'
   - Send confirmation email to customer + admin

4. Admin dashboard update:
   - Show deposit status
   - Button to generate payment link manually
   - Display payment history

DELIVERABLES:
1. /lib/stripe.ts - Stripe client
2. /app/api/create-payment-link/route.ts - Payment link generation
3. /app/api/webhooks/stripe/route.ts - Webhook handler
4. Updated email template with payment link
5. Admin dashboard: deposit tracking

Security requirements:
- Verify webhook signatures
- Never expose STRIPE_SECRET_KEY to client
- Use Stripe test mode for development

Show me Stripe setup first, then payment link creation, then webhook handler.
```

**Expected Output:**
- Stripe integrated
- Payment links generating
- Webhooks handling payments
- Deposit status updating

**Verification:**
- Create test booking
- Generate payment link
- Use Stripe test card (4242 4242 4242 4242)
- Verify webhook triggers
- Check deposit status updated in database

---

## ADDITIONAL PROMPTS (AS NEEDED)

### Analytics Setup
```
Add Google Analytics 4 tracking:
- Install next/script
- Add GA4 tag to layout
- Track form submissions as events
- Track page views
- Privacy-compliant (cookie consent Phase 2)
```

### Image Optimization
```
Add Next.js Image component:
- Replace all <img> with <Image>
- Configure remote image domains
- Add proper width/height
- Implement lazy loading
- Use WebP format
```

### Performance Optimization
```
Optimize site performance:
- Code splitting
- Dynamic imports for heavy components
- Font optimization (next/font)
- Minimize bundle size
- Implement caching strategies
```

---

## PROMPT USAGE TIPS

### Before Using Any Prompt:
1. Read through the entire prompt
2. Customize bracketed placeholders [like this]
3. Have all referenced files ready (01-07)
4. Clear plan for verification after

### During Prompt Execution:
1. Review Cursor's output carefully
2. Ask for explanations if unclear
3. Test incrementally (don't wait until end)
4. Commit working code before next prompt

### After Prompt Completion:
1. Run full verification checklist
2. Document any deviations or issues
3. Update requirements if scope changes
4. Git commit with clear message

### Troubleshooting:
- If Cursor generates incorrect code, paste the error and ask for fix
- If stuck, paste the relevant requirement doc section
- If output is too complex, ask for simpler version first
- If conflicting approaches, ask Cursor to explain trade-offs