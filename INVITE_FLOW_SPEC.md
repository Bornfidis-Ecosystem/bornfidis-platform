# Invite Flow — Spec vs Implementation

This project uses **Supabase** (not NextAuth). Auth handoff is done via `/invite/continue` + login `?next=` redirect.

---

## 1️⃣ Invite Entry Route

| Spec | Status | Implementation |
|------|--------|----------------|
| **Create** `app/invite/page.tsx` | ✅ Done | Exists |
| Reads `?role=FARMER\|CHEF\|EDUCATOR\|PARTNER` | ✅ | Validated via `isValidInviteRole()`; fallback = show "Invalid invite" (no default PARTNER in URL) |
| “You’re invited to Bornfidis” | ✅ | Heading + tagline |
| 1 dynamic sentence (why invited by role) | ✅ | `WHY_INVITED` in `lib/invite-copy.ts` |
| Primary button “Continue as [ROLE]” | ✅ | Links to `/invite/continue?role=...` (+ `&token=...` when from email) |
| Store role temporarily | ✅ | Role passed in URL to `/invite/continue`; no session needed |
| On click → auth or continue | ✅ | `/invite/continue` checks auth; if not logged in → redirect to `/admin/login?next=...` |

---

## 2️⃣ Auth Handoff

| Spec | Status | Implementation |
|------|--------|----------------|
| **Check** `app/api/auth/[...nextauth]/route.ts` | N/A | Project uses **Supabase**; no NextAuth |
| After login, persist invited role to user | ✅ | Done in `app/invite/continue/page.tsx`: create/update `User` with role |
| Redirect based on role | ✅ | FARMER→`/farmer/welcome`, CHEF→`/chef/welcome`, EDUCATOR→`/educator/welcome`, PARTNER→`/partner/welcome` |

**Flow:** Invite page → “Continue” → `/invite/continue?role=X&token=Y` → if no session, redirect to `/admin/login?next=/invite/continue?role=X&token=Y` → after magic link, user returns to `/invite/continue` → role persisted → redirect to `/[role]/welcome`.

---

## 3️⃣ Role Welcome Pages

| Spec | Status | Implementation |
|------|--------|----------------|
| **Create** `app/farmer/welcome/page.tsx` | ✅ | Exists |
| **Create** `app/chef/welcome/page.tsx` | ✅ | Exists |
| **Create** `app/educator/welcome/page.tsx` | ✅ | Exists |
| **Create** `app/partner/welcome/page.tsx` | ✅ | Exists |
| “Welcome, here’s what happens next” | ✅ | “Welcome, [Role]” + 3 sections |
| 3 bullets: What you can do \| What we’ll contact you about \| Who to message | ✅ | `lib/welcome-content.ts` + `WelcomePageContent.tsx` |
| No forms, no payments | ✅ | Static content + links only |

---

## 4️⃣ Invite Tracking

| Spec | Status | Implementation |
|------|--------|----------------|
| **Prisma** Invite with id, email, role, status, createdAt | ✅ | Model has `email`, `role`, `accepted` (we show Sent/Accepted/Expired), `createdAt`; optional `status` enum can be added later |
| **Admin** `app/admin/invites/page.tsx` | ✅ | Exists |
| Columns: Email, Role, Status, Date | ✅ | Table has Email, Role, Invited by, Status (Sent/Accepted/Expired), Date, Expires, Actions |

---

## 🔁 Redirect Rules

| After login | Route | Status |
|-------------|--------|--------|
| FARMER | `/farmer/welcome` | ✅ |
| CHEF | `/chef/welcome` | ✅ |
| EDUCATOR | `/educator/welcome` | ✅ |
| PARTNER | `/partner/welcome` | ✅ |

(No dashboards yet — welcome pages only.)

---

## ❌ Not Added (per spec)

- No long copy
- No PDFs
- No payments
- No coordinator logic
- No multi-step forms

---

## 🚀 Order Implemented

1. `app/invite/page.tsx` ✅  
2. Auth role persistence + redirect (`/invite/continue` + login `?next=`) ✅  
3. Welcome pages (all 4) ✅  
4. Admin invite list ✅  
