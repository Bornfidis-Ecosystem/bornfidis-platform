# Founder Dashboard

The **Founder Dashboard** at `/admin` gives a single-page view of ecosystem health across Sportswear, Academy, Provisions, and ProJu.

## Access

- **Route:** `/admin`
- **Protection:** Admin layout ensures only users with role **ADMIN**, **STAFF**, or **COORDINATOR** can access. Others are redirected to `/admin/login` or their role-specific dashboard (e.g. Chef → `/chef`).

## Database

New tables (add via Prisma migration):

| Table | Purpose |
|-------|---------|
| `admin_settings` | Key-value store for `store_conversion_rate` and `cash_reserve` (editable from Zone 1). |
| `pipeline_items` | Upcoming revenue opportunities (title, division, expected_date, estimated_value, status). |
| `activity_log` | Last 20 events (event_type, description, division, created_at). |
| `email_subscribers` | Count used in Zone 1 “Email Subscribers” KPI. |

**Run migration (when ready):**

```bash
npx prisma migrate dev --name founder_dashboard
```

Then regenerate the client if needed:

```bash
npx prisma generate
```

**If you see:** `Migration 20250126_academy_product_snapshot failed to apply cleanly` (table `academy_purchases` does not exist) — the migrations were reordered so the snapshot is idempotent and the create uses `IF NOT EXISTS`. Re-run `npx prisma migrate dev --name founder_dashboard`. If Prisma reports that an already-applied migration was modified, you can continue (the founder_dashboard migration will still be created and applied).

## Seeding Test Data

After the migration has been applied, you can seed the new tables for local testing.

### 1. Admin settings (conversion rate & cash reserve)

From Prisma Studio or a seed script:

```ts
await db.adminSetting.upsert({
  where: { key: 'store_conversion_rate' },
  create: { key: 'store_conversion_rate', value: '2.5' },
  update: { value: '2.5' },
})
await db.adminSetting.upsert({
  where: { key: 'cash_reserve' },
  create: { key: 'cash_reserve', value: '25000' },
  update: { value: '25000' },
})
```

Or in SQL:

```sql
INSERT INTO admin_settings (id, key, value, "updated_at")
VALUES (gen_random_uuid(), 'store_conversion_rate', '2.5', NOW()),
       (gen_random_uuid(), 'cash_reserve', '25000', NOW())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, "updated_at" = NOW();
```

### 2. Pipeline items

```ts
await db.pipelineItem.createMany({
  data: [
    { title: 'Q1 Sportswear drop', division: 'Sportswear', expectedDate: new Date('2026-03-15'), estimatedValue: 5000, status: 'lead' },
    { title: 'Caribbean Foundations cohort', division: 'Academy', expectedDate: new Date('2026-02-01'), estimatedValue: 3000, status: 'confirmed' },
    { title: 'Corporate catering inquiry', division: 'Provisions', expectedDate: new Date('2026-02-20'), estimatedValue: 2500, status: 'lead' },
  ],
})
```

### 3. Activity log

```ts
await db.activityLog.createMany({
  data: [
    { eventType: 'order', description: 'Academy purchase: Regenerative Enterprise Foundations', division: 'Academy' },
    { eventType: 'booking', description: 'New inquiry: Private dinner, 12 guests', division: 'Provisions' },
    { eventType: 'farmer_contact', description: 'New farmer intake from WhatsApp', division: 'ProJu' },
    { eventType: 'download', description: '5 Caribbean Sauces guide delivered', division: 'Academy' },
  ],
})
```

### 4. Email subscribers (optional)

If you want “Email Subscribers” to show a non-zero count:

```ts
await db.emailSubscriber.createMany({
  data: [
    { email: 'test1@example.com', source: 'lead_magnet' },
    { email: 'test2@example.com', source: 'provisions' },
  ],
})
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/metrics` | Zone 1 KPIs (revenue, customers, subscribers, conversion rate, cash reserve). |
| GET | `/api/admin/divisions` | Zone 2 metrics per division (Sportswear, Academy, Provisions, ProJu). |
| GET | `/api/admin/pipeline` | All pipeline items. |
| POST | `/api/admin/pipeline` | Create pipeline item (body: title, division, expectedDate?, estimatedValue?, status?). |
| GET | `/api/admin/activity` | Last 20 activity log entries. |
| POST | `/api/admin/activity` | Log activity (body: eventType, description, division). |
| PUT | `/api/admin/settings` | Update conversion rate and/or cash reserve (body: storeConversionRate?, cashReserve?). |

All require admin auth (session with ADMIN/STAFF/COORDINATOR role).

## Zone Data Sources

- **Monthly revenue:** Sum of Academy `productPrice` (this month) + Provisions `totalCents` for bookings paid this month.
- **Total customers:** Distinct Academy purchasers (paid) + count of paid Provisions bookings.
- **Email subscribers:** Count of `email_subscribers` table.
- **Sportswear:** Stubbed to 0 until an orders/payments source is wired (e.g. Stripe).
- **ProJu buyer inquiries:** Stubbed to 0 until a buyer-inquiry table or source exists.

## Design

- Brand colors: forest `#1A3C34`, coral `#E07B54`, gold `#C9A84C`, sage `#8FBC8B`.
- Division dots: Sportswear `#CE472E`, Academy `#534AB7`, Provisions `#002747`, ProJu `#3B6D11`.
- Clean cards, thin borders, no gradients; responsive (Tailwind).
