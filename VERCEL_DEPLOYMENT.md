# ✅ Vercel Deployment Preparation

## Overview

Platform is now ready for Vercel deployment with proper configuration, health checks, and production optimizations.

## What Was Done

### 1. ✅ Vercel Configuration (`vercel.json`)

**File:** `vercel.json`

**Configuration:**
- Build command: `npm run build` (includes Prisma generate)
- Framework: Next.js (auto-detected)
- Region: `iad1` (US East)
- Function timeout: 30 seconds for API routes
- Prisma Data Proxy disabled (using direct connection)

**Key Settings:**
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 2. ✅ Prisma Generate in Build

**File:** `package.json`

**Updated Scripts:**
- `build`: Now runs `prisma generate && next build`
- `postinstall`: Runs `prisma generate` (for Vercel install step)

**Why:**
- Ensures Prisma Client is generated before build
- Required for serverless functions
- Prevents runtime errors from missing Prisma Client

### 3. ✅ Environment Variables (`.env.example`)

**File:** `.env.example`

**Comprehensive list of all environment variables:**

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `DATABASE_URL` - PostgreSQL connection string (direct)
- `DIRECT_URL` - PostgreSQL direct connection (for migrations)
- `NEXT_PUBLIC_SITE_URL` - Production site URL
- `ADMIN_EMAIL` or `ADMIN_EMAILS` - Admin email(s)
- `RESEND_API_KEY` - Resend email API key
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number

**Optional:**
- `RESEND_FROM_EMAIL` - Custom from email
- `TWILIO_MESSAGING_SERVICE_SID` - Twilio messaging service
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `TWILIO_WEBHOOK_AUTH` - Enable webhook auth
- `ENABLE_WHATSAPP` - Enable WhatsApp features
- Coordinator phone numbers

### 4. ✅ Health Check Endpoint

**File:** `app/api/health/route.ts`

**Endpoint:** `GET /api/health`

**Features:**
- Basic health status
- Database connection check (non-blocking)
- Supabase connection check (non-blocking)
- Environment variable validation
- Timestamp and version info

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-23T10:00:00Z",
  "environment": "production",
  "version": "0.1.0",
  "services": {
    "database": "connected",
    "supabase": "connected"
  },
  "environment": {
    "supabaseUrl": true,
    "supabaseAnonKey": true,
    "supabaseServiceKey": true,
    "databaseUrl": true,
    "allPresent": true
  }
}
```

**Usage:**
- Vercel monitoring
- Uptime monitoring services
- Load balancer health checks
- Manual status checks

### 5. ✅ Production Console Log Removal

**File:** `next.config.js`

**Configuration:**
```javascript
compiler: {
  removeConsole: process.env.NODE_ENV === 'production' ? {
    exclude: ['error', 'warn'], // Keep errors and warnings
  } : false,
}
```

**Behavior:**
- **Development:** All console logs work normally
- **Production:** `console.log`, `console.info`, `console.debug` removed
- **Production:** `console.error` and `console.warn` kept (important for debugging)

**Alternative:** Logger utility (`lib/logger.ts`)
- Use `logger.log()` instead of `console.log()`
- Automatically disabled in production
- Always logs errors (even in production)

---

## Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 3. Configure Environment Variables

In Vercel project settings → Environment Variables, add:

**Required Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
DATABASE_URL=postgresql://postgres:...@db.xxx.supabase.co:5432/postgres?sslmode=require
DIRECT_URL=postgresql://postgres:...@db.xxx.supabase.co:5432/postgres?sslmode=require
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
ADMIN_EMAIL=brian@bornfidis.com
RESEND_API_KEY=re_xxxxx
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+18761234567
```

**Optional Variables:**
```
RESEND_FROM_EMAIL=Bornfidis Provisions <noreply@bornfidis.com>
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

**Important:**
- Set `NEXT_PUBLIC_SITE_URL` to your production URL
- Use production API keys (not test keys)
- Keep `DATABASE_URL` and `DIRECT_URL` the same for Supabase
- Add variables for all environments (Production, Preview, Development)

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Check build logs for:
   - ✅ Prisma generate success
   - ✅ Next.js build success
   - ✅ No errors

### 5. Verify Deployment

**Health Check:**
```bash
curl https://your-domain.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "services": {
    "database": "connected",
    "supabase": "connected"
  }
}
```

**Manual Tests:**
- [ ] Home page loads
- [ ] Booking form works
- [ ] Admin dashboard accessible
- [ ] Database queries work
- [ ] SMS sending works
- [ ] Email sending works

---

## Supabase Connection Configuration

### For Vercel Deployment

**Use Direct Connection:**
- `DATABASE_URL`: Direct connection (port 5432)
- `DIRECT_URL`: Same as DATABASE_URL (for Prisma migrations)

**Why:**
- Prisma requires direct connection for migrations
- Session pooler may not work with Prisma CLI
- Direct connection is stable for serverless functions

**Connection String Format:**
```
postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require
```

**Get from Supabase:**
1. Dashboard → Project Settings → Database
2. Copy "Connection string" → "Direct connection"
3. Replace `[YOUR-PASSWORD]` with your database password

### Connection Pooling (Optional)

If you want to use connection pooling:
- Keep `DATABASE_URL` as direct connection (for Prisma)
- Use session pooler URL for runtime queries (if needed)
- Prisma will use `DATABASE_URL` automatically

---

## Build Process

### Vercel Build Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Post-Install Hook**
   ```bash
   prisma generate  # Runs automatically via postinstall script
   ```

3. **Build**
   ```bash
   npm run build  # Runs prisma generate && next build
   ```

4. **Deploy**
   - Vercel deploys the built application
   - Serverless functions are created
   - Static assets are optimized

### Prisma Client Generation

**Why It's Needed:**
- Prisma Client must be generated before build
- Serverless functions need Prisma Client at runtime
- Without it, you'll get "PrismaClient is not defined" errors

**How It Works:**
- `postinstall` script runs `prisma generate` after `npm install`
- `build` script also runs `prisma generate` before `next build`
- Ensures Prisma Client is always available

---

## Health Check Endpoint

### Usage

**Basic Check:**
```bash
curl https://your-domain.vercel.app/api/health
```

**With Monitoring:**
- Set up uptime monitoring (e.g., UptimeRobot, Pingdom)
- Point to `/api/health` endpoint
- Alert if status is not "ok"

**Response Codes:**
- `200`: Application is healthy
- `500`: Critical error (check logs)

**Response Fields:**
- `status`: "ok" or "error"
- `services.database`: "connected", "error", or "unknown"
- `services.supabase`: "connected", "error", or "unknown"
- `environment.allPresent`: `true` if all required env vars are set

---

## Production Console Logs

### Automatic Removal

Next.js compiler automatically removes:
- `console.log()`
- `console.info()`
- `console.debug()`

**Kept in Production:**
- `console.error()` - Important for error tracking
- `console.warn()` - Important for warnings

### Using Logger Utility

For more control, use the logger utility:

```typescript
import { logger } from '@/lib/logger'

// Only logs in development
logger.log('Debug message')
logger.info('Info message')
logger.debug('Debug message')

// Always logs (even in production)
logger.error('Error message')
logger.warn('Warning message')
```

---

## Environment Variables Checklist

### Required for Production

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `DATABASE_URL`
- [ ] `DIRECT_URL`
- [ ] `NEXT_PUBLIC_SITE_URL` (production URL)
- [ ] `ADMIN_EMAIL` or `ADMIN_EMAILS`
- [ ] `RESEND_API_KEY`
- [ ] `TWILIO_ACCOUNT_SID`
- [ ] `TWILIO_AUTH_TOKEN`
- [ ] `TWILIO_PHONE_NUMBER`

### Optional (but Recommended)

- [ ] `RESEND_FROM_EMAIL`
- [ ] `STRIPE_SECRET_KEY` (if using payments)
- [ ] `STRIPE_WEBHOOK_SECRET` (if using payments)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (if using payments)

---

## Troubleshooting

### Build Fails: "Prisma Client not found"

**Solution:**
- Ensure `postinstall` script is in `package.json`
- Check that `prisma generate` runs in build logs
- Verify `prisma/schema.prisma` is valid

### Database Connection Errors

**Check:**
- `DATABASE_URL` is set correctly
- Connection string uses direct connection (port 5432)
- Password is correct
- SSL mode is `require`

### Supabase Connection Errors

**Check:**
- `NEXT_PUBLIC_SUPABASE_URL` is correct
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- `SUPABASE_SERVICE_ROLE_KEY` is correct
- No typos in environment variable names

### Health Check Fails

**Check:**
- All required environment variables are set
- Database is accessible
- Supabase project is active
- Check Vercel function logs

---

## Files Created/Modified

1. **`vercel.json`** - Vercel configuration
2. **`package.json`** - Updated build scripts
3. **`.env.example`** - Comprehensive environment variables
4. **`app/api/health/route.ts`** - Health check endpoint
5. **`lib/logger.ts`** - Production-safe logger utility
6. **`next.config.js`** - Console log removal in production
7. **`lib/supabase.ts`** - Updated to use logger

---

## ✅ Complete!

The platform is now ready for Vercel deployment:
- ✅ `vercel.json` configuration
- ✅ Prisma generate in build process
- ✅ Comprehensive `.env.example`
- ✅ `/api/health` endpoint
- ✅ Console logs removed in production
- ✅ Supabase connections remain intact

**Ready to deploy!** 🚀
