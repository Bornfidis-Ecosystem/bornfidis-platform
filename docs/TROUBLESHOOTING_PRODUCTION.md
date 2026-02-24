# Production troubleshooting

Quick fixes for common errors on platform.bornfidis.com.

---

## 1. "Access Denied" on `/admin` (admin-area role required)

**Symptom:** You log in at `/admin/login` with magic link, then see "Access Denied – You need an admin-area role (ADMIN, STAFF, or COORDINATOR)."

**Cause:** Your account is authenticated but either (a) your Prisma user has role `USER`, and (b) your email is not in the admin allowlist.

**Fix:**

1. **Set admin allowlist in Vercel**
   - Vercel → your project → **Settings** → **Environment Variables**
   - Add (or update) for **Production** (and Preview if needed):
   - **Name:** `ADMIN_EMAILS`  
   - **Value:** your admin email, e.g. `bornfidisprovisions@gmail.com`  
   - Multiple admins: comma-separated, e.g. `admin1@example.com,admin2@example.com`
   - Redeploy so the new env is picked up.

2. **Optional – set role in DB**
   - Once you can access `/admin`, go to **User Management** (`/admin/users`), find your user, and set **Role** to **ADMIN** (or STAFF/COORDINATOR). Then you can remove `ADMIN_EMAILS` later if you rely only on DB roles.

**Note:** `ADMIN_EMAILS` is a fallback; the primary source of truth is Prisma `users.role`. New magic-link users get role `USER` until updated.

---

## 2. "Failed to save application. Please try again." (Join as a Farmer form)

**Symptom:** Submitting the "Join as a Farmer" form shows a red banner: "Failed to save application. Please try again."

**Cause:** The backend call to save the application failed. Common causes:

1. **Supabase table missing or schema mismatch**
   - The app writes to the `farmers_applications` table in Supabase.
   - Required columns: `name`, `phone`, `parish`, `acres`, `crops`, `status`, `voice_ready` (and any others added by later migrations).

**Fix:**

1. **Run Supabase migrations in your production project**
   - In Supabase Dashboard → **SQL Editor**, run (in order):
     - `supabase/migration-phase11g-farmers.sql` – creates `farmers_applications` and RLS
     - `supabase/migration-phase11g-1-farmers-enhancement.sql` – adds `parish`, `voice_ready`
   - If you have later migrations that touch `farmers_applications`, run those too.

2. **Confirm Supabase env in Vercel**
   - **Settings** → **Environment Variables** (Production):
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (used by the API to insert; must have access to the table).

3. **Check Vercel logs for the real error**
   - Vercel → your project → **Deployments** → latest → **Functions** → open the log for the request that hit `/api/farmers/join`.
   - Look for `Error saving farmer application:` – the next line will show the Supabase error code (e.g. column does not exist, permission denied). That will tell you if it’s schema or RLS/key related.

**After fixing:** Redeploy if you changed env; no redeploy needed if you only ran SQL in Supabase. Test the form again.

---

## 3. "Still getting errors" after setting env vars

**Symptoms:** You set `NEXT_PUBLIC_SUPABASE_URL`, `DATABASE_URL`, `ADMIN_EMAILS`, etc. in Vercel but still see "Application error" or "Something went wrong" on `/admin` or `/dashboard/library`.

### 3.1 You must redeploy

- **Env var changes do not apply to the running app until you redeploy.**  
  After saving variables in Vercel, use **Redeploy** (or push a new commit) so a new build and deployment run with the new values.
- **`NEXT_PUBLIC_*`** vars are inlined at **build time**. If they were missing or wrong when the last build ran, the deployed app will keep using those old values until you trigger a **new build** (redeploy).

### 3.2 Vercel warning icons on env vars

- A **warning icon** next to a variable usually means:
  - **Sensitive value** (e.g. `DATABASE_URL`, `ADMIN_EMAILS`) – the value is hidden by default; the warning does **not** mean the value is invalid.
  - **`NEXT_PUBLIC_*`** – the value is exposed to the client; that’s expected for Supabase URL/anon key.
- You can ignore these if the values are correct. If errors persist, check **Vercel → Deployments → [latest] → Functions / Logs** (see below).

### 3.3 Required env vars and formats (Vercel Production)

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | e.g. `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | From Supabase → Settings → API |
| `DATABASE_URL` | Yes | Postgres connection string. For **Supabase pooler** use port **6543** and `?pgbouncer=true&sslmode=require`. |
| `DIRECT_URL` | Yes (with Prisma) | When using the **pooler** for `DATABASE_URL`, set `DIRECT_URL` to the **direct** connection (port **5432**) so Prisma can run migrations and avoid pooler limits. Format: `postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require` (get from Supabase → Settings → Database → Connection string → Direct). |
| `ADMIN_EMAILS` | For admin access | Comma-separated emails allowed to access `/admin` before role is set in DB. |

- If **`DIRECT_URL`** is missing and your schema uses `directUrl = env("DIRECT_URL")`, Prisma may fail at build or startup. Set it to the **direct** (non-pooler) URL.
- **Password in URL:** If the DB password contains `@`, `#`, or `%`, percent-encode it (e.g. `%40` for `@`).

### 3.4 Find the real error in Vercel logs

1. Vercel → your project → **Deployments** → open the **latest** deployment.
2. Open **Functions** (or **Logs**), then reproduce the error (e.g. open `/admin` or `/dashboard/library`).
3. Search the log for:
   - **`ADMIN_LOAD_ERROR`** – error in the admin layout (auth, Supabase, or DB).
   - **`LIBRARY_LOAD_ERROR`** – error on the library page (auth or DB).

The next line(s) after that label will show the actual error (e.g. missing env, connection refused, invalid credentials). Fix that root cause, then redeploy if you changed env.
