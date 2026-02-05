# Pre-deploy checklist

Use this before deploying to Vercel (or your first production deploy).

## 1. Code and fixes applied

- **Admin chefs page:** `getFeaturedChefIdsForDisplay` is imported from `@/lib/featured-chefs`.
- **Chef payouts page:** Inner `statusLabel` has no return type (avoids an SWC quirk); stray `</>` in payouts table branch removed.
- **Succession client:** Ternary closed with `)}` instead of `}`.
- **Coaching:** `evaluateAllChefsAction` is exported from `app/admin/coaching/actions.ts`; `EvaluateAllButton` is wired and works.

## 2. Build

```bash
npm run build
```

- **Font fetch errors (e.g. `ECONNREFUSED` to Google Fonts):** Usually a local proxy/network issue. Vercel builds have network; the same command there should succeed.
- **"Unexpected token `div`. Expected jsx identifier":** Known SWC parser bug in some Next.js 14.x builds. Fix: upgrade Next.js so it uses a newer SWC (e.g. Next.js 14.2.x latest or 15.x):
  ```bash
  npm install next@latest
  ```
  Then run `npm run build` again.

## 3. Environment variables (Vercel)

In the Vercel project → **Settings → Environment Variables**, set (at least for Production):

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `DATABASE_URL` | Yes | Direct Postgres URL (port 5432), e.g. `postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres?sslmode=require` |
| `DIRECT_URL` | Yes | Same as `DATABASE_URL` for Supabase |
| `NEXT_PUBLIC_SITE_URL` | Yes | Production URL (e.g. `https://your-app.vercel.app`) |
| `ADMIN_EMAIL` or `ADMIN_EMAILS` | Yes | Comma-separated admin emails |
| `RESEND_API_KEY` | Yes | Resend API key |
| `TWILIO_ACCOUNT_SID` | Yes | Twilio SID |
| `TWILIO_AUTH_TOKEN` | Yes | Twilio token |
| `TWILIO_PHONE_NUMBER` | Yes | E.164 number |
| `CRON_SECRET` | If using Vercel Cron | Same value as in `vercel.json` crons (Bearer secret) |

Optional but recommended: `RESEND_FROM_EMAIL`, Stripe vars if used, `ENABLE_WHATSAPP`, etc. See `.env.example` and `VERCEL_DEPLOYMENT.md`.

## 4. Deploy

- Push to your connected Git branch; Vercel will build and deploy.
- Or from CLI: `npx vercel --prod` (after `vercel link` if needed).

## 5. After deploy

- **Health:** `curl https://your-domain/api/health` → expect `"status":"ok"` and service checks.
- **Smoke test (≈5 min):**
  - `/api/health`
  - Admin login
  - Admin → Bookings → open a booking detail
  - Assign chef → open portal
  - Chef payouts page loads

## 6. Post-deploy cleanup (recommended)

- **Single lockfile:** Multiple lockfiles can confuse Vercel’s build cache. If you use **npm** only, remove the other lockfile so it’s not in any parent of the repo, e.g.:
  ```powershell
  Remove-Item C:\Users\<you>\pnpm-lock.yaml -ErrorAction SilentlyContinue
  ```
  (Or move it outside the repo and any parent Vercel might use.)

## References

- **Full deployment guide:** `VERCEL_DEPLOYMENT.md`
- **Env reference:** `.env.example`
- **Vercel config:** `vercel.json` (build, crons, API timeouts)
