# Bornfidis Branding Guide

How to add your logo and brand identity across the website so it looks professional and consistent.

**Full brand spec:** See [BRAND_STYLE_GUIDE.md](./BRAND_STYLE_GUIDE.md) for colors, typography, voice, and digital/print usage.

---

## 1. Login email (done)

- **Login form placeholder** is set to **bornfidisprovisions@gmail.com** so users see your brand email.
- **Who can log in:** Set in `.env` / `.env.local`:
  - `ADMIN_EMAILS=bornfidisprovisions@gmail.com`
  - Add more addresses comma-separated if needed (e.g. `ADMIN_EMAILS=bornfidisprovisions@gmail.com,partner@example.com`).
- Use the same email in **Supabase** (Auth → Users) for magic-link sign-in.

---

## 2. Logo files — where to put them

Place files in the **`public/`** folder so they are served from the site root. The site supports a **brand folder structure** for multiple logo variants:

| Path | Purpose |
|------|---------|
| `public/brand/logos/logo-lockup-navy-on-white.png` | Admin login (light card); fallback: `public/logo.png` |
| `public/brand/logos/logo-lockup-gold-on-navy.png` | Full lockup for dark backgrounds (optional) |
| `public/brand/icons/icon-anchor-gold.png` | Nav and footer (dark background) |
| `public/brand/icons/icon-anchor-navy.png` | Favicon and apple-touch icon (browser tab, mobile home screen) |
| `public/logo.png` | Fallback for admin login if brand logo is missing |
| `public/favicon.ico` | Optional; site uses navy icon from `brand/icons` if present |

Export logos as PNG with transparency. Use navy-on-white for light backgrounds and gold (or gold-on-navy) for dark nav/footer.

---

## 3. Where the logo is used

### Admin login page (`/admin/login`)

- **Wired:** Tries `public/brand/logos/logo-lockup-navy-on-white.png` first, then `public/logo.png`. If both are missing, “Bornfidis” text is shown.

### Main navigation (header)

- **Wired:** Shows `public/brand/icons/icon-anchor-gold.png` next to “Bornfidis | Provisions”. If the image fails to load, text-only is shown.

### Footer

- **Wired:** Shows `public/brand/icons/icon-anchor-gold.png` in the “About Bornfidis” section.

### Favicon (browser tab and mobile)

- **Wired:** `app/layout.tsx` sets the favicon and apple-touch icon to `public/brand/icons/icon-anchor-navy.png`. You can still add `public/favicon.ico` if you prefer a dedicated .ico file.

---

## 4. Brand colors (aligned with Brand Style Guide)

The site theme uses the official palette (see `app/globals.css` and `tailwind.config.ts`):

- **Bornfidis Navy** `#0B2540` – navigation, primary buttons, headings
- **Bornfidis Gold** `#F5A623` – accent, CTAs, nav active state
- **Forest Green** `#2D5016` – Jamaica/farmer content, Academy
- **Warm Cream** `#FFF8E7` – card/light backgrounds
- **Navy Light** `#1A3A5C` – hover states

Full palette and usage: [BRAND_STYLE_GUIDE.md](./BRAND_STYLE_GUIDE.md).

---

## 5. Checklist for a professional look

- [ ] Add brand assets under `public/brand/` (see section 2 for paths).
- [ ] Confirm logo appears on `/admin/login` (navy-on-white lockup or `public/logo.png`).
- [ ] Confirm nav and footer show the gold icon; favicon uses the navy icon from `brand/icons`.
- [ ] Set `ADMIN_EMAILS=bornfidisprovisions@gmail.com` in `.env.local` so only your email can log in.

---

## 6. Email and other materials

- **Support email** (support@bornfidis.com) is already used in Academy confirmation emails and error copy.
- For **Resend** (transactional email), set the “From” name and address in `.env` (e.g. `RESEND_FROM_EMAIL=Bornfidis <bornfidisprovisions@gmail.com>`) and verify the domain in Resend.
- For **magic-link login**, the email is sent by Supabase; the “From” is set in Supabase Auth settings (e.g. custom SMTP or Supabase default).

Once the brand assets are in `public/brand/` (or `public/logo.png` as fallback), the login, nav, footer, and favicon will show your brand automatically.
