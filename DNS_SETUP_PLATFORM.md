# platform.bornfidis.com — DNS & Vercel Setup

If **"This site can't be reached"** or **DNS_PROBE_FINISHED_NXDOMAIN** when opening `https://platform.bornfidis.com`, the subdomain is not yet configured. Follow these steps.

---

## 1. Add domain in Vercel

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → your project.
2. **Settings** → **Domains**.
3. Add: **`platform.bornfidis.com`**
4. Vercel will show the required DNS record (usually a **CNAME** pointing to `cname.vercel-dns.com` or your project URL).

---

## 2. Add DNS record at your domain registrar

Where you manage **bornfidis.com** (e.g. GoDaddy, Namecheap, Cloudflare, Google Domains):

1. Add a **CNAME** record:
   - **Name/Host:** `platform` (or `platform.bornfidis.com` if the registrar uses full name)
   - **Value/Target:** `cname.vercel-dns.com` (or the value Vercel shows)
   - **TTL:** 3600 or default

2. **Do not** change the root (`bornfidis.com` or `@`) A/CNAME records — those stay pointed at WordPress.

3. Save.

---

## 3. Wait for DNS propagation

- Can take from a few minutes up to 24–48 hours.
- Check: [https://dnschecker.org](https://dnschecker.org) for `platform.bornfidis.com` — when it resolves globally, the site should load.

---

## 4. SSL (HTTPS)

Vercel will issue a certificate for `platform.bornfidis.com` once DNS is pointing to Vercel. No extra step unless you use a custom certificate.

---

## 5. Test locally while DNS is pending

- **Local:** `http://localhost:3000/farmer-intake`
- **Vercel preview:** Every deployment has a URL like `https://your-project-xxx.vercel.app/farmer-intake` — use that until `platform.bornfidis.com` resolves.

---

## Quick checklist

- [ ] Domain `platform.bornfidis.com` added in Vercel → **Domains**
- [ ] CNAME `platform` → `cname.vercel-dns.com` (or Vercel’s value) at your DNS provider
- [ ] Root domain (`bornfidis.com`) still points to WordPress
- [ ] Waited for DNS propagation (check with dnschecker.org)
- [ ] Open `https://platform.bornfidis.com/farmer-intake` in browser

If it still fails after 24–48 hours, double-check the CNAME target and that the project in Vercel is the one you deployed.
