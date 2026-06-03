# Platform Status & Readiness — What’s In Place vs What You Need

This doc gives you a single place to see what’s built, what’s configured, and what’s missing so the site is fully ready for users and selling.

---

## 1. What’s already built (code)

| Area | Status | Notes |
|------|--------|--------|
| **Academy** | Done | `/academy`, product detail `/academy/[slug]`, 4 manuals in catalog, cover images |
| **Stripe checkout** | Done | “Buy Now” → `/api/academy/checkout` → redirect to Stripe → success page & webhook |
| **Academy after purchase** | Done | Webhook creates purchase record, sends confirmation email (if Resend configured), My Library + secure PDF download |
| **Admin login** | Done | Magic link via Supabase; login at `/admin/login` |
| **Admin dashboard** | Done | Role badge and **your logged-in email** in the header (from Supabase session) |
| **Farmer signup** | Done | “Join as a Farmer” form → `/api/farmers/join` → saves to Supabase `farmers_applications` |
| **Sportswear** | Done | “Coming soon” page at `/sportswear`, nav/footer links |
| **Brand** | Done | Navy/gold theme, logo in nav/footer/login, favicon |

So the **application logic** for login, dashboard, Academy, and forms is in place. What’s left is **configuration and external services** (env vars, Supabase, Resend, Stripe).

---

## 2. Login and dashboard email (why it might look “wrong”)

**How it works**

- You enter **your email** on the login page and request a magic link.
- The **magic link** is sent by **Supabase** (not by this app’s Resend).
- When you click the link, you’re logged in. The **dashboard header** shows the **email of that Supabase user** (i.e. the address you used to request the link).

**What you might be seeing**

1. **Placeholder on the login form**  
   The login input has placeholder text `bornfidisprovisions@gmail.com` so people know what kind of email to use. That is **not** your account — it’s just hint text. The real value is whatever **you type** before clicking “Send magic link”.

2. **Same email on every device**  
   If you always request the magic link with the **same email** (e.g. `bornfidisprovisions@gmail.com`), then on every device you’re logging in as that **one** user. So the dashboard will show that same email everywhere. That’s expected: one account = one email.

3. **If the header shows something like “example”**  
   The header does **not** use a placeholder; it shows `user.email` from Supabase. So if you see an “example” address there, that would mean the **Supabase user** you’re logged in as has that email (e.g. a test account). Fix: log out, then request a magic link with the **real** admin email you want (e.g. `bornfidisprovisions@gmail.com` or `brian@bornfidis.com`) and use that link. After that, the dashboard will show that email.

**Making sure you can access admin**

- In **Vercel** (production), set **`ADMIN_EMAILS`** to the exact address you use to log in, e.g.  
  `bornfidisprovisions@gmail.com`  
  (or comma-separated: `bornfidisprovisions@gmail.com,brian@bornfidis.com`).
- Redeploy after changing env.  
- If that email is in `ADMIN_EMAILS`, you can open the admin area even before the Prisma user has role ADMIN. Later you can set the role in **User Management** (`/admin/users`).

So: the login page and dashboard are **individualized per user** — they show the Supabase account you’re actually logged in with. If something looks wrong, it’s usually the placeholder on the form or using a test/example account; fixing the email you use to request the magic link (and `ADMIN_EMAILS`) fixes it.

---

## 3. Emails not arriving (what must be configured)

The app **does not** send the magic link itself. Supabase does. Other emails (Academy confirmation, farmer submission notifications, etc.) are sent by this app using **Resend**.

**For Supabase magic link to work**

- **Supabase Dashboard** → Authentication → URL Configuration:
  - **Site URL:** your production URL, e.g. `https://platform.bornfidis.com`
  - **Redirect URLs:** add `https://platform.bornfidis.com/**` (and `/admin/login` if you use it in redirects)
- Users must request the magic link from the **same** domain (e.g. production) they’ll open the link on; otherwise Supabase may block the redirect.

**For app-sent emails (e.g. Academy confirmation, submission notifications)**

- **Resend** is used for:
  - Academy purchase confirmation (with library link)
  - Invites, admin notifications, farmer submission notifications (if wired in code), etc.
- **Required in Vercel (or .env):**
  - **`RESEND_API_KEY`**  
    Get it from [Resend](https://resend.com) → API Keys. If this is missing, the app logs “RESEND_API_KEY not set” and **does not send** those emails.
  - **`RESEND_FROM_EMAIL`** (optional but recommended)  
    e.g. `bornfidisprovisions@gmail.com` or `noreply@bornfidis.com`.  
    If you use your own domain (e.g. `noreply@bornfidis.com`), you must **verify the domain** in Resend; otherwise Resend may block or reject.
- After adding or changing these, **redeploy** so the new env is used.

So: **login link** = Supabase (check Supabase URL/redirect settings). **Other emails** = Resend (set `RESEND_API_KEY` and optionally `RESEND_FROM_EMAIL` + domain verification).

---

## 4. What’s needed to start selling (Academy)

| Item | Where / how |
|------|-------------|
| **Stripe (test first)** | In Stripe Dashboard create 4 Products + one-time Prices; copy each **Price ID** into Vercel env: `NEXT_PUBLIC_STRIPE_ACADEMY_REGENERATIVE_ENTERPRISE`, `_REGENERATIVE_FARMER`, `_VERMONT_CONTRACTOR`, `_JAMAICAN_CHEF`. |
| **Stripe keys** | In Vercel: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test keys for testing). |
| **Stripe webhook** | In Stripe: add endpoint `https://platform.bornfidis.com/api/webhooks/academy`, event `checkout.session.completed`; put the **signing secret** in Vercel as `STRIPE_ACADEMY_WEBHOOK_SECRET`. |
| **Base URL** | In Vercel: `NEXT_PUBLIC_BASE_URL=https://platform.bornfidis.com` (for success/cancel redirects). |
| **Academy confirmation email** | Set `RESEND_API_KEY` (and optionally `RESEND_FROM_EMAIL`) so the webhook can send “Your manual is ready” + library link. |
| **PDFs** | Place the 4 manual PDFs in `storage/academy-products/` (filenames per `storage/academy-products/README.txt`) so “My Library” download works. |

See **`docs/STRIPE_ENV_CHECKLIST.md`** and **`docs/ACADEMY_PRE_LAUNCH_CHECKLIST.md`** for step-by-step.

---

## 5. Farmer “Join” form not saving

If “Join as a Farmer” shows “Failed to save application”:

- The app writes to Supabase table **`farmers_applications`**.
- Run the Supabase migrations (e.g. `supabase/migration-phase11g-farmers.sql` and `migration-phase11g-1-farmers-enhancement.sql`) in your **production** Supabase project.
- In Vercel, set **`NEXT_PUBLIC_SUPABASE_URL`**, **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**, and **`SUPABASE_SERVICE_ROLE_KEY`** for that project.

Details: **`docs/TROUBLESHOOTING_PRODUCTION.md`**.

---

## 6. Quick checklist — “fully ready for users and selling”

Use this to confirm nothing is missing.

**Auth & admin**

- [ ] Supabase Auth: Site URL and Redirect URLs set for production.
- [ ] You log in with the **real** admin email (not a test/example); dashboard shows that email.
- [ ] In Vercel: `ADMIN_EMAILS` includes that email (comma-separated if multiple).

**Email (magic link + app emails)**

- [ ] Magic link works when requested from production URL (Supabase config).
- [ ] In Vercel: `RESEND_API_KEY` set (and optionally `RESEND_FROM_EMAIL`; domain verified in Resend if using custom domain).
- [ ] After an Academy test purchase, confirmation email is received (checks Resend).

**Academy selling**

- [ ] In Vercel: all four `NEXT_PUBLIC_STRIPE_ACADEMY_*` Price IDs, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_ACADEMY_WEBHOOK_SECRET`, `NEXT_PUBLIC_BASE_URL`.
- [ ] Stripe webhook for `checkout.session.completed` points to production `/api/webhooks/academy`.
- [ ] PDFs in `storage/academy-products/`; test purchase → My Library → download works.

**Farmer form**

- [ ] Supabase migrations for `farmers_applications` run in production; Vercel has correct Supabase env vars.

**General**

- [ ] Domain and SSL (e.g. `platform.bornfidis.com`) working; no broken links in nav/footer.

---

## 7. Summary

- **Built:** Academy, Stripe checkout, admin login/dashboard, farmer form, Sportswear page, brand. Dashboard email is **your** Supabase user email; the login form placeholder is just a hint.
- **To fix “wrong” email:** Use the correct email when requesting the magic link; set `ADMIN_EMAILS` in Vercel to that email; redeploy.
- **To get emails (magic link vs app):** Magic link = Supabase URL/redirect. Other emails = `RESEND_API_KEY` (and optional `RESEND_FROM_EMAIL` + domain verification).
- **To sell:** Stripe keys + 4 Price IDs + webhook secret + `NEXT_PUBLIC_BASE_URL` + Resend for confirmation email + PDFs in storage.

If you tell us exactly what you see (e.g. “dashboard shows xyz@example.com” or “no email after purchase”), we can target the next fix (Supabase user, Resend, or Stripe) precisely.
