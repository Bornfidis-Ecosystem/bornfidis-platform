# Deploy to production (platform.bornfidis.com)

Use this when you're ready to ship. The app is configured for **Vercel** (`vercel.json` is in place).

---

## 1. Commit and push (if using Git → Vercel)

```bash
git add -A
git status   # confirm brand, academy covers, style guide, nav/footer
git commit -m "Brand style guide, navy nav/footer, academy covers, deploy ready"
git push origin master
```

If your Vercel project is connected to this repo, **push triggers a deploy**. Check the Vercel dashboard for build status.

---

## 2. Or deploy with Vercel CLI

```bash
npm i -g vercel   # once
vercel --prod     # from project root; follow prompts if first time
```

Use `vercel --prod` to deploy to production. First run may ask to link the project.

---

## 3. Environment variables (Vercel Dashboard)

In **Vercel → Project → Settings → Environment Variables**, set these for **Production** (and Preview if you want):

**Required for app + Academy:**
- `NEXT_PUBLIC_SITE_URL` = `https://platform.bornfidis.com`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`, `DIRECT_URL` (Supabase connection strings)
- `ADMIN_EMAILS` = `bornfidisprovisions@gmail.com`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (e.g. `Bornfidis <noreply@bornfidis.com>`)
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_ACADEMY_WEBHOOK_SECRET` (from Stripe webhook for `/api/webhooks/academy`)
- `NEXT_PUBLIC_STRIPE_ACADEMY_REGENERATIVE_ENTERPRISE`, `_FARMER`, `_VERMONT_CONTRACTOR`, `_JAMAICAN_CHEF` (Stripe Price IDs)
- `NEXT_PUBLIC_BASE_URL` = `https://platform.bornfidis.com`

See `.env.example` for the full list. Add any optional vars (cron, SMS, etc.) if you use them.

---

## 4. After deploy

- **Production URL:** `https://your-project.vercel.app` or `https://platform.bornfidis.com` (once domain is added).
- **Domain:** Vercel → Settings → Domains → add `platform.bornfidis.com`; add the CNAME at your DNS provider (see `DNS_SETUP_PLATFORM.md`).
- **Health check:** `curl https://platform.bornfidis.com/api/health`
- **Academy:** Open `/academy` and `/academy/regenerative-enterprise-foundations`; confirm covers and buy button work.
- **Supabase:** In Auth → URL Configuration, set **Site URL** to `https://platform.bornfidis.com` and add it to **Redirect URLs** so magic-link login works from production.

---

## 5. Local build failed?

If `npm run build` failed locally with a Prisma `EPERM`/rename error, it’s usually because the **dev server** has a lock on the generated files. Stop `npm run dev` (Ctrl+C), then run `npm run build` again. Deployment on Vercel runs the build in the cloud, so it’s not affected by that local lock.
