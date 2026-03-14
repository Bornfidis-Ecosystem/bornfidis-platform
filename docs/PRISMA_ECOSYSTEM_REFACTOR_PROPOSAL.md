# Prisma Schema Refactor: Multi-Division Ecosystem

Proposed structure for Bornfidis before changing the live schema. **No schema files have been modified yet.**

---

## 1. Goals

- One shared **User** model for the whole platform.
- Clear **UserRole** and **Division** enums for access and reporting.
- **Centralized Payment** model for all revenue (Academy, Provisions, Sportswear).
- Division-specific models that map to current and near-term needs: Academy, Provisions (chef bookings), ProJu (farmers/listings), Sportswear, lead capture, founder dashboard.

---

## 2. Proposed Enums

```prisma
// Already exist; keep as-is. Optional: add a role if needed (e.g. BUYER for ProJu).
enum UserRole {
  ADMIN
  STAFF
  PARTNER
  USER
  COORDINATOR
  CHEF
  FARMER
  VOLUNTEER
  EDUCATOR
}

// New: for Payment and reporting (Founder Dashboard, pipeline, activity).
enum Division {
  ACADEMY
  PROVISIONS
  SPORTSWEAR
  PROJU
}

// New: for Payment status.
enum PaymentStatus {
  PENDING
  PAID
  REFUNDED
  FAILED
}
```

---

## 3. Proposed Core Models (Summary)

### 3.1 User (unchanged)

- Keep existing **User** model and `users` table.
- No structural change; already shared across platform.

### 3.2 Payment (new — centralize revenue)

```prisma
model Payment {
  id            String        @id @default(cuid())
  division      Division
  amountCents   Int           @map("amount_cents")
  currency      String        @default("USD")
  status        PaymentStatus @default(PENDING)
  stripeSessionId   String?   @unique @map("stripe_session_id")
  stripePaymentIntentId String? @map("stripe_payment_intent_id")
  paidAt        DateTime?     @map("paid_at")
  createdAt     DateTime      @default(now()) @map("created_at")

  // Polymorphic reference: one of these set per division
  academyPurchaseId String?   @unique @map("academy_purchase_id")
  chefBookingId     String?   @map("chef_booking_id")  // booking_inquiries.id
  sportswearOrderId String?   @map("sportswear_order_id")

  academyPurchase   AcademyPurchase? @relation(fields: [academyPurchaseId], references: [id])
  // chefBooking: keep BookingInquiry name in DB; relation by id
  sportswearOrder   SportswearOrder? @relation(fields: [sportswearOrderId], references: [id])

  @@index([division])
  @@index([paidAt])
  @@map("payments")
  @@schema("public")
}
```

- **Migration risk (high):** Today Academy uses `academy_purchases.product_price` and `stripe_session_id`; Provisions uses `booking_inquiries` deposit/balance Stripe fields and `total_cents`. Introducing `Payment` implies either:
  - **Option A:** New payments only go to `Payment`; existing rows stay as-is (no backfill). Application code reads from both for a while.
  - **Option B:** One-time migration: create `Payment` rows from existing `academy_purchases` and booking payment data, then switch code to use `Payment` and deprecate old columns.
- Recommendation: Add `Payment` for **new** flows first (e.g. new Academy purchases, new Sportswear orders). Optionally backfill later.

### 3.3 Academy

**AcademyProduct (new — optional catalog in DB)**

- Today products live in `lib/academy-products.ts`. Moving to DB is optional and allows admin-editable catalog.
- Minimal proposal:

```prisma
model AcademyProduct {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  description String   @db.Text
  type        String   // DOWNLOAD | COURSE | BUNDLE
  priceCents  Int      @map("price_cents")
  stripePriceId String? @map("stripe_price_id")
  active      Boolean  @default(true)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  purchases AcademyPurchase[]
  @@map("academy_products")
  @@schema("public")
}
```

- **Migration risk (low):** New table. Existing code can keep using `lib/academy-products.ts` until you seed `academy_products` and switch.

**AcademyPurchase (existing — align with Payment and optional product)**

- Keep table `academy_purchases`; add optional `productId` FK to `AcademyProduct` if you add that table.
- For central payments: add optional `paymentId` FK to `Payment` when you create a Payment per purchase.
- Existing columns (`product_slug`, `product_title`, `product_price`, `stripe_session_id`) can remain for backward compatibility; new flow can write to `Payment` + `AcademyPurchase`.

**AcademyEnrollment (new — minimal)**

- Use for “course” progress (e.g. modules completed) when you have structured courses. For download-only products, `AcademyPurchase` is enough.

```prisma
model AcademyEnrollment {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")   // or authUserId
  productSlug String   @map("product_slug")
  enrolledAt  DateTime @default(now()) @map("enrolled_at")
  progress    Json?    // e.g. { completedModuleIds: [] }
  completedAt DateTime? @map("completed_at")

  @@unique([userId, productSlug])
  @@index([userId])
  @@map("academy_enrollments")
  @@schema("public")
}
```

- **Migration risk (low):** New table; no change to existing data.

### 3.4 Provisions (Chef bookings)

**ChefBooking**

- Current implementation is **BookingInquiry** (`booking_inquiries`). It is heavily used (admin, portal, Stripe, payouts).
- **Recommendation:** Do **not** rename the table or model. Keep **BookingInquiry** in Prisma and in the DB. In docs and product language you can call it “chef booking”; in code it stays `BookingInquiry` / `booking_inquiries`.
- **Migration risk (high) if renamed:** Every reference to `BookingInquiry`, `booking_inquiries`, `bookingId` would break. No rename proposed.

### 3.5 Provisions products (catalog)

**ProvisionsProduct (new — minimal)**

- Today in `lib/provisions-products.ts`. Optional DB table for status and future ecommerce.

```prisma
model ProvisionsProduct {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String?  @db.Text
  status      String   // Coming Soon | Small Batch | Available
  sortOrder   Int      @default(0) @map("sort_order")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("provisions_products")
  @@schema("public")
}
```

- **Migration risk (low):** New table; app can keep using code-defined list until seeded.

### 3.6 Sportswear

**SportswearProduct (new — minimal)**

```prisma
model SportswearProduct {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String?  @db.Text
  priceCents  Int?     @map("price_cents")
  active      Boolean  @default(true)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  orderLines  SportswearOrderLine[]
  @@map("sportswear_products")
  @@schema("public")
}
```

**SportswearOrder (new — minimal)**

```prisma
model SportswearOrder {
  id          String   @id @default(cuid())
  userId      String?  @map("user_id")
  email       String?
  totalCents  Int      @map("total_cents")
  status      String   @default("pending")
  stripeSessionId String? @map("stripe_session_id")
  paidAt      DateTime? @map("paid_at")
  createdAt   DateTime @default(now()) @map("created_at")

  payment     Payment?
  lines       SportswearOrderLine[]
  @@map("sportswear_orders")
  @@schema("public")
}

model SportswearOrderLine {
  id        String   @id @default(cuid())
  orderId   String   @map("order_id")
  productId String   @map("product_id")
  quantity  Int      @default(1)
  priceCents Int     @map("price_cents")

  order   SportswearOrder   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product SportswearProduct @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@map("sportswear_order_lines")
  @@schema("public")
}
```

- **Migration risk (low):** New tables; no existing data.

### 3.7 ProJu (farmers & marketplace)

**FarmerProfile**

- You already have **Farmer** (farmers table) with crops, intakes, booking assignments, payouts. It is the real “farmer profile” today.
- **Recommendation:** Keep **Farmer** as the main entity. Optionally add **FarmerProfile** only if you need a separate profile linked to **User** (e.g. when farmers log in). For “farmer onboarding” and founder dashboard, **Farmer** + **FarmerIntake** are enough.
- If you add FarmerProfile, it could be: `userId` → User, plus farmer-specific fields; then link to **Farmer** if one farmer record is created per profile.

**FarmListing (new — minimal)**

- For “listings live” and buyer inquiries: a listing per farmer/crop or per product.

```prisma
model FarmListing {
  id        String   @id @default(cuid())
  farmerId  String   @map("farmer_id")
  crop      String
  quantity  Float?
  unit      String?
  status    String   @default("active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  farmer Farmer @relation(fields: [farmerId], references: [id], onDelete: Cascade)
  @@index([farmerId])
  @@index([status])
  @@map("farm_listings")
  @@schema("public")
}
```

- **Migration risk (low):** New table. You could derive “listings” from **Farmer** + **FarmerCrop** initially and add this when you need explicit listing lifecycle.

### 3.8 Lead capture & dashboard

**LeadCapture**

- You already have **EmailSubscriber** (`email_subscribers`) for lead magnet and interest signups.
- **Recommendation:** Keep **EmailSubscriber**; in naming/docs you can treat it as “lead capture.” If you prefer the name **LeadCapture**, that would be a **rename** of the table/model (and all references). Risk: medium (find/replace and migration rename).
- Optional: add a **LeadCapture** model with a broader shape (e.g. source, type, payload) and keep **EmailSubscriber** for email-only; adds complexity. Not recommended unless you need more than email + source.

**ActivityLog**

- Already exists; keep as-is. Optionally add a **Division** enum field (or keep division as string) for consistency with the rest of the schema.

---

## 4. What Stays As-Is (no structural change)

- **User**, **UserRole**, **Invite**, **PartnerProfile**
- **BookingInquiry** (Provisions chef bookings) — name and table
- **Farmer**, **FarmerCrop**, **FarmerIntake**, **Intake**, **WhatsAppMessage**
- **AcademyPurchase** — keep; optionally add `paymentId` and `productId` later
- **AdminSetting**, **PipelineItem**, **ActivityLog**, **EmailSubscriber**
- All chef-side and booking-side models (ChefAssignment, ChefProfile, ChefAvailability, Review, etc.)
- All operational models (RegionPricing, SurgeConfig, Incident, ImprovementItem, etc.)

---

## 5. Migration Risks Summary

| Change | Risk | Notes |
|--------|------|------|
| Add **Division** enum | Low | New enum; no existing column uses it until you add division to new tables. |
| Add **Payment** and use for new flows only | Medium | New table + code paths for new payments; old paths unchanged. |
| Backfill **Payment** from Academy + Bookings | High | Data migration + validation; run once and then switch reads. |
| Add **AcademyProduct** table | Low | New table; seed from code or admin; keep using code catalog until ready. |
| Add **AcademyEnrollment** | Low | New table. |
| Rename **BookingInquiry** → ChefBooking | High | Breaks all Prisma and SQL references; **not recommended**. |
| Add **ProvisionsProduct**, **SportswearProduct**, **SportswearOrder**, **FarmListing** | Low | New tables only. |
| Rename **EmailSubscriber** → LeadCapture | Medium | Rename table + all references. |
| Add **FarmerProfile** (separate from Farmer) | Low | New table; only if you need User-linked farmer profile. |

---

## 6. Recommended Phased Approach

1. **Phase 1 (low risk)**  
   - Add **Division** (and **PaymentStatus** if you add Payment).  
   - Add **AcademyProduct**, **AcademyEnrollment**, **ProvisionsProduct**, **SportswearProduct**, **SportswearOrder** (+ **SportswearOrderLine**), **FarmListing** as above.  
   - No changes to existing tables (except optional new FKs on AcademyPurchase later).

2. **Phase 2 (optional)**  
   - Add **Payment**; use it only for **new** Academy purchases and/or new Sportswear orders.  
   - Leave existing `academy_purchases` and `booking_inquiries` payment columns as-is.

3. **Phase 3 (optional, higher risk)**  
   - Backfill **Payment** from existing academy and booking payment data; point Academy and booking code at **Payment** and deprecate direct Stripe/amount columns over time.

4. **Do not** rename **BookingInquiry** or **users**; avoid renaming **EmailSubscriber** unless you have a strong reason.

---

## 7. Next Step

- If you confirm this direction, next step is to **apply Phase 1 only** in `schema.prisma`: add the new enums and new models (AcademyProduct, AcademyEnrollment, ProvisionsProduct, Sportswear*, FarmListing, and optionally Payment with no backfill), **without** removing or renaming any existing models.  
- Then add a migration and update any code that should use the new tables (e.g. seed AcademyProduct from `lib/academy-products.ts`).  

Say which phase you want to implement (e.g. “Phase 1 only” or “Phase 1 + Phase 2”) and we can translate this into exact Prisma schema edits and migration steps.
