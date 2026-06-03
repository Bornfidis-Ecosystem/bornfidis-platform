# Get the admin bookings fix live

**Problem:** `/admin/bookings` shows "Application error" in production because the fix is only on `master`, not on `main`. Production deploys from `main`.

**Fix:** Merge `master` into `main` again (one more time).

## Steps

1. **On GitHub**, open:
   ```
   https://github.com/Bornfidis-Ecosystem/bornfidis-platform/compare/main...master
   ```

2. You’ll see something like: “main is X commits behind master” and a list of commits (including **“fix: admin bookings - catch auth errors…”**).

3. Click **“Create pull request”**.

4. Create the PR (e.g. title: “Merge master: admin bookings error handling”), then **Merge** it.

5. **Vercel** will deploy production from `main` again. Wait 1–2 minutes.

6. Open **https://platform.bornfidis.com/admin/bookings** again. You should see either the bookings list or a red error box with a clear message (e.g. “Authentication required”) instead of “Application error”.

---

**In short:** Production = `main`. Your fix = `master`. Merge `master` → `main` so production gets the fix.
