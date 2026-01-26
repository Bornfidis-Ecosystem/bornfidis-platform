# BORNFIDIS TECH STACK SPECIFICATION

## Phase 1 Stack (Current Build)

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **UI Components:** Headless UI or shadcn/ui (for forms, modals)
- **Icons:** Lucide React (simple line icons)
- **Fonts:** Google Fonts (Montserrat + Lora)

### Backend
- **API:** Next.js API Routes / Server Actions
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Phase 2 for admin)
- **ORM:** Supabase JS client (no need for Prisma initially)

### Email
- **Service:** Resend (modern, great DX)
- **Fallback:** Gmail SMTP or SendGrid
- **Templates:** React Email (type-safe email templates)

### Payments (Phase 1B)
- **Processor:** Stripe
- **Integration:** Stripe Checkout (hosted) or Elements (embedded)
- **Webhook handling:** Next.js API route for payment confirmations

### Hosting & Deployment
- **Frontend/Backend:** Vercel (seamless Next.js deployment)
- **Database:** Supabase (hosted PostgreSQL)
- **DNS:** Vercel or Cloudflare
- **Domain:** bornfidis.com (register if not already)

### Development Tools
- **IDE:** Cursor (AI-assisted development)
- **Version Control:** Git + GitHub
- **Package Manager:** pnpm (faster than npm/yarn)
- **Linting:** ESLint + Prettier (auto-format on save)
- **Type Checking:** TypeScript strict mode

---

## Directory Structure
```
bornfidis-web/
├── .cursorrules                 # Cursor AI instructions
├── .env.local                   # Local environment variables (gitignored)
├── .env.example                 # Example env file (committed)
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── README.md
│
├── app/
│   ├── layout.tsx               # Root layout (fonts, metadata)
│   ├── page.tsx                 # Homepage
│   ├── about/
│   │   └── page.tsx
│   ├── book/
│   │   └── page.tsx             # Booking form
│   ├── thanks/
│   │   └── page.tsx             # Confirmation page
│   ├── admin/
│   │   ├── layout.tsx           # Admin layout (auth check)
│   │   └── submissions/
│   │       └── page.tsx         # Admin dashboard
│   └── api/
│       ├── submit-booking/
│       │   └── route.ts         # Form submission endpoint
│       └── webhooks/
│           └── stripe/
│               └── route.ts     # Stripe webhook handler
│
├── components/
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   └── ...
│   ├── forms/
│   │   └── BookingForm.tsx      # Main booking form component
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   └── admin/
│       ├── SubmissionTable.tsx
│       └── StatusBadge.tsx
│
├── lib/
│   ├── supabase.ts              # Supabase client setup
│   ├── stripe.ts                # Stripe client setup
│   ├── email.ts                 # Email sending utilities
│   └── validation.ts            # Form validation schemas (Zod)
│
├── types/
│   ├── booking.ts               # TypeScript types for bookings
│   └── index.ts
│
├── emails/                      # React Email templates
│   ├── BookingConfirmation.tsx
│   └── AdminNotification.tsx
│
├── public/
│   ├── logo.svg
│   ├── images/
│   └── fonts/ (if self-hosting)
│
└── docs/
    └── setup.md                 # Setup instructions
```

---

## Environment Variables

### Required Variables (`.env.local`)
```bash
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

# Stripe (Phase 1B)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx

# Admin Auth (Temporary - Phase 1)
ADMIN_PASSWORD=secure_temporary_password_change_me

# Analytics (Optional - Phase 2)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Security Rules:
- **NEVER commit** `.env.local` to git
- **DO commit** `.env.example` with placeholder values
- Rotate `ADMIN_PASSWORD` regularly
- Use Vercel environment variables for production

---

## Database Setup (Supabase)

### Tables to Create:

**Table 1: `booking_inquiries`**
```sql
CREATE TABLE booking_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Customer Info
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  preferred_contact TEXT DEFAULT 'email',
  
  -- Event Details
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT,
  event_location TEXT NOT NULL,
  location_city TEXT,
  location_state TEXT DEFAULT 'VT',
  
  -- Service Specs
  guest_count INTEGER,
  budget_range TEXT,
  dietary_restrictions TEXT,
  menu_preferences TEXT,
  special_requests TEXT,
  
  -- Admin Fields
  status TEXT NOT NULL DEFAULT 'new',
  status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  follow_up_date DATE,
  deposit_status TEXT,
  deposit_amount DECIMAL(10,2),
  final_quote DECIMAL(10,2),
  internal_notes TEXT,
  
  -- Tracking
  referral_source TEXT,
  utm_source TEXT,
  utm_campaign TEXT
);

-- Add index for common queries
CREATE INDEX idx_booking_status ON booking_inquiries(status);
CREATE INDEX idx_booking_event_date ON booking_inquiries(event_date);
CREATE INDEX idx_booking_created_at ON booking_inquiries(created_at DESC);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_booking_inquiries_updated_at
BEFORE UPDATE ON booking_inquiries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### Row Level Security (RLS) Policies:
```sql
-- Enable RLS
ALTER TABLE booking_inquiries ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can INSERT (submit bookings)
CREATE POLICY "Public can submit bookings"
ON booking_inquiries
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy 2: Only authenticated users (admin) can SELECT
CREATE POLICY "Authenticated can view all bookings"
ON booking_inquiries
FOR SELECT
TO authenticated
USING (true);

-- Policy 3: Service role can do anything (for server-side operations)
CREATE POLICY "Service role has full access"
ON booking_inquiries
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 4: Authenticated can UPDATE (admin status changes)
CREATE POLICY "Authenticated can update bookings"
ON booking_inquiries
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
```

---

## API Routes Specification

### POST `/api/submit-booking`

**Purpose:** Handle booking form submissions

**Request Body:**
```typescript
{
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  preferred_contact?: 'email' | 'phone' | 'whatsapp';
  event_type: 'private_chef' | 'corporate_catering' | 'other';
  event_date: string; // ISO date
  event_time?: string;
  event_location: string;
  guest_count?: number;
  budget_range?: string;
  dietary_restrictions?: string;
  menu_preferences?: string;
  special_requests?: string;
  referral_source?: string;
}
```

**Response (Success):**
```typescript
{
  success: true,
  bookingId: string,
  message: "Booking inquiry received"
}
```

**Response (Error):**
```typescript
{
  success: false,
  error: string,
  details?: string
}
```

**Logic:**
1. Validate request body (Zod schema)
2. Check honeypot field
3. Rate limit check (max 3/hour per IP)
4. Insert into Supabase
5. Send confirmation email to customer
6. Send notification email to admin
7. Return success response

---

## Deployment Checklist

### Pre-Deploy:
- [ ] All environment variables set in Vercel
- [ ] Supabase database migrations run
- [ ] RLS policies tested
- [ ] Email templates tested
- [ ] Form validation working
- [ ] Admin dashboard password protected

### Deploy:
- [ ] Push to GitHub main branch
- [ ] Vercel auto-deploys
- [ ] Verify production site loads
- [ ] Test booking form submission end-to-end
- [ ] Check email delivery (confirmation + admin notification)

### Post-Deploy:
- [ ] Set up custom domain (bornfidis.com)
- [ ] Configure DNS records
- [ ] Set up SSL (Vercel handles automatically)
- [ ] Test all forms on production
- [ ] Monitor error logs (Vercel dashboard)

---

## Cost Breakdown (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Cursor Pro | Pro | $20 |
| Vercel | Hobby → Pro (if needed) | $0-20 |
| Supabase | Free → Pro | $0-25 |
| Resend | Free → Paid | $0-10 |
| Domain (annual/12) | - | ~$1.50 |
| **Total Phase 1** | | **$21.50-76.50** |

| Service | Phase | Cost |
|---------|-------|------|
| Stripe | Phase 1B (per transaction) | 2.9% + $0.30 |

---

## Upgrade Path (Future Phases)

### Phase 1B (1-2 weeks after Phase 1):
- Add Stripe deposit payment flow
- Payment confirmation email
- Admin dashboard: deposit tracking

### Phase 2 (1-3 months):
- Proper admin authentication (Supabase Auth)
- Email sequence automations
- Advanced analytics dashboard
- Calendar integration (Google Calendar sync)

### Phase 3 (3-6 months):
- ProJu Marketplace (separate subdomain or route)
- Product catalog with Stripe Products
- Subscription boxes
- Inventory management

### Phase 4 (6-12 months):
- Farmer/supplier portal
- Island Harvest Hub logistics dashboard
- Mobile app (React Native or PWA)