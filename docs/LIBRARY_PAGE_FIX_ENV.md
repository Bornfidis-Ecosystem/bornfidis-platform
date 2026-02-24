# Library Page Crash Fix — PR Summary & Required Env Vars

## Problem

Production crash on `/dashboard/library` with Next.js server components error (digest 381123350). The page could throw when:
- Supabase auth failed or env was missing
- Prisma/DB query failed (e.g. `DATABASE_URL` missing or connection error)
- Product lookup was missing and code accessed `product!.slug`

## Code Changes

### 1. `app/dashboard/library/page.tsx`

- **Defensive auth:** Wrapped `getCurrentSupabaseUser()` in try/catch. On throw, log `LIBRARY_LOAD_ERROR` and render error UI instead of crashing. If user is null, redirect to `/admin/login?next=/dashboard/library` (unchanged).
- **Defensive DB:** Wrapped `db.academyPurchase.findMany(...)` in try/catch. On failure, log `LIBRARY_LOAD_ERROR` with `authUserId` and error message, and render error UI with “We couldn’t load your library” and links to log in again / Academy.
- **Error UI:** New `LibraryErrorUI` component: “Something went wrong” message, “Log in again” button, “Back to Academy” link.
- **Safe product render:** No more `product!.slug`. Use `product` only when defined; if course product is missing, show “File not available” instead of a link.
- **Logging:** All failures logged with label `LIBRARY_LOAD_ERROR` and context (e.g. `getCurrentSupabaseUser threw`, `db.academyPurchase.findMany failed` + authUserId and error). Check Vercel Functions logs for this label to see root cause.

### 2. `app/api/academy/download/[slug]/route.ts`

- **Defensive auth and DB:** Wrapped `getCurrentSupabaseUser()` and `db.academyPurchase.findFirst(...)` in try/catch. On throw, log with label `ACADEMY_DOWNLOAD` and return 500 JSON (or redirect for missing user).
- **File not available:** When filename is missing or file is missing on disk (or `readFileSync` fails), return 404 with body `{ error: 'File not available' }` (or “File not available for this product”) and log `ACADEMY_DOWNLOAD` so Vercel logs show the cause.

## Required Vercel Env Vars (Library & Download)

These must be set in **Vercel → Project → Settings → Environment Variables** for **Production** (and Preview if you use it):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL; used by server to get session and verify user. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key; used by server Supabase client for auth. |
| `DATABASE_URL` | Postgres connection string for Prisma; required for `AcademyPurchase` and all DB access. |
| `DIRECT_URL` | Optional; use if you use Prisma migrations or direct connection. |

**Note:** Library and download do **not** use Supabase for reading purchase records. Purchases are stored in Postgres and read via **Prisma** with `DATABASE_URL`. `SUPABASE_SERVICE_ROLE_KEY` is not required for the library page or for the download route; it is used elsewhere (e.g. admin, farmers_applications) if needed.

## How to Debug in Vercel

1. Vercel → Project → **Deployments** → latest deployment.
2. Open **Functions** (or **Logs**) and reproduce the library or download request.
3. Search for:
   - **`LIBRARY_LOAD_ERROR`** — library page (auth or DB failure).
   - **`ACADEMY_DOWNLOAD`** — download API (auth, DB, or file failure).

The log line will include the error message or context so you can fix the underlying cause (e.g. missing env, DB unreachable, or missing file).
