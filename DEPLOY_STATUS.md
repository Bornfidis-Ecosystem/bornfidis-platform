# Deployment status – where things are

## The disconnect

| Branch   | Where it lives | What Vercel uses | Your fixes |
|----------|----------------|------------------|------------|
| **main** | GitHub (default branch) | ✅ **Production** (usually) | ❌ **Not here** – old code |
| **master** | GitHub + your PC     | ❌ Only if you set it      | ✅ **All fixes are here** |

**So:** Production is still building from **main**, which is **5 commits behind master**. The cron fix, invites fix, and other deploy fixes are only on **master**, so they never reached production. That’s why you still see 404 on `/admin/invites`.

---

## Quick check (run anytime)

From the project root:

```powershell
# 1. Fetch latest from GitHub (fix YOUR_TOKEN or use SSH if push fails)
git fetch origin

# 2. See how far ahead master is vs main
git log --oneline origin/main..origin/master

# 3. See what’s on production’s branch (main)
git log --oneline -5 origin/main
```

- If `origin/main..origin/master` lists commits → those commits are **not** on production.
- If the list is empty → main and master are in sync; production should have the latest after the next deploy.

---

## How to fix it (choose one)

### Option A: Merge master into main (recommended)

Get your fixes onto the default branch so the next production deploy has them.

**On GitHub (easiest):**

1. Open: `https://github.com/Bornfidis-Ecosystem/bornfidis-platform/compare/main...master`
2. Create a **Pull Request**: base **main** ← compare **master**.
3. Merge the PR (after checks pass).
4. Vercel will deploy from **main**; production will get the invites fix, cron fix, etc.

**Or via command line (if you have push access to main):**

```powershell
git fetch origin
git checkout main
git pull origin main
git merge origin/master -m "Merge master: invites fix, cron fix, deploy fixes"
git push origin main
```

### Option B: Make Vercel deploy from master

If you want production to follow **master** instead of **main**:

1. Vercel dashboard → your project → **Settings** → **Git**.
2. Set **Production Branch** to `master` (instead of `main`).
3. Save. The next deploy from **master** will be production.

---

## Remote URL (push failures)

Your `origin` is set to:

`https://YOUR_TOKEN@github.com/Bornfidis-Ecosystem/bornfidis-platform.git`

If **push** fails (e.g. 403 or connection errors):

1. Replace `YOUR_TOKEN` with a real [GitHub Personal Access Token](https://github.com/settings/tokens) (repo scope), **or**
2. Switch to SSH:  
   `git remote set-url origin git@github.com:Bornfidis-Ecosystem/bornfidis-platform.git`

Then run the “Quick check” again and, if you use Option A, push to **main** (or merge via the PR).

---

## Summary

| What you want | What to do |
|---------------|------------|
| See what’s not on production | `git log --oneline origin/main..origin/master` |
| Get current fixes to production | Merge **master** into **main** (PR or local merge + push). |
| Have production follow master | In Vercel, set Production Branch to **master**. |
