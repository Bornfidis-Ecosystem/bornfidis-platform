# Project File Tree

```
bornfidis_requirements/
├── app/
│   ├── actions.ts                    # Server actions for booking submission
│   ├── admin/
│   │   └── submissions/
│   │       └── page.tsx             # Admin dashboard page
│   ├── api/
│   │   └── admin/
│   │       ├── auth/
│   │       │   └── route.ts         # Admin authentication endpoint
│   │       └── submissions/
│   │           └── route.ts        # Admin submissions API (GET, PATCH)
│   ├── book/
│   │   └── page.tsx                 # Booking form page
│   ├── globals.css                  # Global styles with Tailwind
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home page
│   └── thanks/
│       └── page.tsx                 # Confirmation page
│
├── lib/
│   ├── email.ts                     # Email utilities (Resend)
│   ├── supabase.ts                  # Supabase client setup
│   └── validation.ts                 # Form validation schemas (Zod)
│
├── types/
│   └── booking.ts                   # TypeScript types for bookings
│
├── supabase/
│   └── schema.sql                   # Database schema and RLS policies
│
├── public/
│   └── brand/
│       ├── icons/
│       │   ├── icon-anchor-gold.png
│       │   └── icon-anchor-navy.png
│       ├── logos/
│       │   ├── logo-lockup-gold-on-yellow.png
│       │   └── logo-lockup-navy-on-white.png
│       └── source/
│           ├── LOGO SOURCE FILES.ai
│           └── NEW LOGO.ai
│
├── .eslintrc.json                   # ESLint configuration
├── .gitignore                       # Git ignore rules
├── next.config.js                   # Next.js configuration
├── package.json                     # Dependencies and scripts
├── postcss.config.js                # PostCSS configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── README.md                        # Project documentation
└── FILE_TREE.md                     # This file
```

## Key Files Explained

### App Directory (Next.js App Router)
- **`app/page.tsx`**: Home page with hero, story, and contact sections
- **`app/book/page.tsx`**: Booking inquiry form (client component)
- **`app/thanks/page.tsx`**: Confirmation page after submission
- **`app/admin/submissions/page.tsx`**: Admin dashboard (password protected)
- **`app/actions.ts`**: Server action for form submission
- **`app/api/admin/*`**: API routes for admin operations

### Library Files
- **`lib/supabase.ts`**: Supabase client instances (public + admin)
- **`lib/email.ts`**: Email sending functions using Resend
- **`lib/validation.ts`**: Zod schemas for form validation

### Configuration
- **`supabase/schema.sql`**: Complete database schema with RLS policies
- **`tailwind.config.ts`**: Custom colors (navy, gold) defined
- **`package.json`**: All dependencies listed

### Documentation
- **`README.md`**: Complete setup and deployment guide
- **`FILE_TREE.md`**: This file structure overview
