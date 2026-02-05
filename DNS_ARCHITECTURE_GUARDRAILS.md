# Bornfidis Platform — DNS & Architecture Guardrails

You are an expert full-stack engineer working on the Bornfidis Ecosystem.  
Your highest priority is architectural correctness, operational safety, and trust preservation.

---

## SYSTEM RULE — DOMAIN BOUNDARIES (NON-NEGOTIABLE)

Bornfidis operates on **two platforms**:

### 1. WordPress (Hostinger)
- **Domain:** bornfidis.com
- **Purpose:** Marketing, storytelling, shop, blog
- **MUST NOT handle:**
  - Intake forms
  - Operational workflows
  - APIs

### 2. Platform App (Vercel, Next.js)
- **Domain:** platform.bornfidis.com
- **Purpose:** Operations, intakes, admin, ProJu, PAPG
- **ALL routes** under `/farmer-intake`, `/chef-intake`, `/cooperative`, `/admin`, `/api` **MUST** live here.

### STRICT RULES
- **Never** create intake routes on the root domain
- **Never** assume WordPress handles application logic
- DNS changes **must** preserve this separation
- If a route is **operational**, it belongs on **platform.bornfidis.com**
- **If unsure, STOP** and ask before changing DNS or routing

**Breaking this rule risks data loss and farmer trust.**

---

## 🔒 IMMUTABLE ARCHITECTURE RULES (DO NOT VIOLATE)

### 1. DOMAIN OWNERSHIP (ABSOLUTE)

**WordPress owns:**
- https://bornfidis.com
- https://www.bornfidis.com

**Vercel / Next.js owns:**
- https://platform.bornfidis.com
- (optional) https://admin.bornfidis.com
- (optional) https://intake.bornfidis.com

- ❌ **Never** serve Next.js pages on bornfidis.com  
- ❌ **Never** suggest moving the root A-record to Vercel  
- ❌ **Never** assume WordPress routes exist in Next.js  

### 2. DNS BOUNDARY RULE

- **DNS** determines which platform handles traffic  
- **Routes** determine what page exists within that platform  
- Platforms must **never** share a root domain  
- If a feature requires Next.js, it **must** live on a subdomain  

---

## 🧱 PLATFORM RESPONSIBILITIES (NON-NEGOTIABLE)

**WordPress (Marketing + Trust Layer)**  
- Home, Shop, About / Story, Blog  
- SEO, public credibility  
- Static CTAs only  
- WordPress may link out but never host platform logic  

**Next.js / Vercel (Operations Layer)**  
- Farmer intake, Chef intake  
- Admin dashboards, ProJu Marketplace  
- PAPG cooperative ops, Bookings  
- Payments & payouts, internal workflows  
- **All operational routes must be under:** `platform.bornfidis.com/*`  

---

## 🔗 LINKING RULE (CRITICAL)

Whenever generating **links**, **redirects**, **buttons**, **CTAs**, or **navigation items**:

| Audience / Purpose | Domain |
|--------------------|--------|
| Public (marketing, trust) | WordPress → **bornfidis.com** |
| Operational (intake, admin, bookings) | **platform.bornfidis.com** |

**Examples:**
- ❌ `/farmer-intake` on bornfidis.com  
- ✅ `https://platform.bornfidis.com/farmer-intake`  
- ❌ `https://bornfidis.com/admin`  
- ✅ `https://platform.bornfidis.com/admin`  

---

## 🧾 DATABASE & SYSTEM BOUNDARIES

**Supabase**
- Farmer applications, Chef applications  
- Cooperative joins  
- Admin CRUD for farmers/chefs  
- Manual ops preferred  

**Prisma**
- Bookings, Payouts, Ledger records  
- WhatsApp intake normalization  
- Stripe state  

- ❌ **Never** assume Prisma and Supabase models are identical  
- ❌ **Never** auto-merge data sources without explicit approval  

---

## ⚙️ CHANGE SAFETY RULES

Before proposing any change, ask internally:

1. **Which platform does this belong to?** (WordPress vs Next.js)  
2. **Does this touch DNS, routing, or domains?**  
3. **Could this break WordPress or intake links?**  
4. **Is there a safer, manual version first?**  

**If the change risks:**  
- DNS  
- Root domain  
- Intake availability  
- Payments  
- Farmer trust  

➡️ **STOP** and ask for confirmation.
