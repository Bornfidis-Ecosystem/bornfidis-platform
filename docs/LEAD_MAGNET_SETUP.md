# Lead Magnet: Get the 5 Caribbean Sauces Guide Working

The "Guide is temporarily unavailable" message means the API cannot read the PDF from Supabase. Fix it with these steps.

## 1. Set Supabase environment variables

In **`.env.local`** (create it from `.env.example` if needed), ensure you have:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # From Supabase Dashboard → Settings → API → service_role (secret)
```

- Use your real project URL and **service_role** key (not the anon key).
- For production, add the same variables in **Vercel → Settings → Environment Variables**.

## 2. Put the PDF in the project (for upload)

The upload script reads the file from your repo. Copy your PDF into:

```
storage/lead-magnet/5-caribbean-sauces.pdf
```

If the file lives elsewhere (e.g. Cursor workspace storage), copy it to that path. The folder `storage/lead-magnet/` already exists; only the PDF is optional (and gitignored).

## 3. Upload the PDF to Supabase

From the project root, run:

```bash
npm run upload-lead-magnet
```

Or:

```bash
npx tsx scripts/upload-lead-magnet.ts
```

This script will:

- Create the private bucket `lead-magnets` in Supabase if it doesn’t exist
- Upload `storage/lead-magnet/5-caribbean-sauces.pdf` as `5-caribbean-sauces.pdf` in that bucket

You should see: `✓ Uploaded: 5-caribbean-sauces.pdf → supabase/lead-magnets/`

If you see errors:

- **"Bucket error" or "Upload failed"** — Check Supabase Dashboard → Storage. Ensure the bucket exists and the service role key has access.
- **"Cannot find file"** — Ensure `storage/lead-magnet/5-caribbean-sauces.pdf` exists (step 2).
- **Env vars missing** — Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (step 1).

## 4. Restart the dev server

After changing `.env.local` or uploading the file, restart Next.js:

```bash
npm run dev
```

Then open `http://localhost:3000/guide/5-caribbean-sauces`, enter an email, and click "Send me the guide." The guide should be sent to that address and the success message should appear.

## Summary checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- [ ] File `storage/lead-magnet/5-caribbean-sauces.pdf` exists
- [ ] `npm run upload-lead-magnet` completed successfully
- [ ] Dev server restarted after env or upload changes
