# Legacy Field Deprecation Plan — Bornfidis Platform

**Date:** 2026-07-14 (Phase 8)

---

## Deprecated: Inline Prep Boolean Gates on BookingInquiry

### Fields

| Column | Map | Phase 8 Replacement |
|--------|-----|---------------------|
| `menu_confirmed` | `menuConfirmed` | BookingPrepItem with `task_type = 'menu_approval'` |
| `dietary_confirmed` | `dietaryConfirmed` | BookingPrepItem with `task_type = 'dietary'` |
| `guest_count_confirmed` | `guestCountConfirmed` | BookingPrepItem with `task_type = 'guest_count'` |
| `arrival_time_confirmed` | `arrivalTimeConfirmed` | BookingPrepItem with `task_type = 'arrival_time'` |
| `location_confirmed` | `locationConfirmed` | BookingPrepItem with `task_type = 'location'` |
| `ingredients_sourced` | `ingredientsSourced` | BookingPrepItem with `task_type = 'ingredients'` |
| `equipment_packed` | `equipmentPacked` | BookingPrepItem with `task_type = 'equipment'` |

### Migration Strategy

1. **Phase 8 (current):** Dashboard queries check for BookingPrepItem rows first. If rows exist, derive completion from task `status`. If no rows, fall back to boolean gates.

2. **Future migration:** Run a one-time backfill script that creates BookingPrepItem rows for any confirmed booking that lacks them, deriving initial `completed` status from the boolean columns.

3. **Column removal:** After all active bookings have prep item rows and the boolean fallback path has not been hit for 30 days, the boolean columns can be removed from the schema.

### Do Not Delete Yet

The boolean columns remain in the Prisma schema and DB. They are still written to by existing checklist toggle actions on the booking detail page. The `BOOKING_CHECKLIST_WRITABLE_KEYS` in `lib/bookings/checklist.ts` still references them.

---

## Deprecated: ChefPrepChecklist

### Current State
- Model exists in Prisma schema
- Table `chef_prep_checklists` exists in DB
- **Not auto-created** on booking confirmation — created via upsert when a chef first toggles a checklist item in the chef portal
- Uses a JSON blob (`completed`) keyed by template item index
- Items are template-driven from `PrepChecklistTemplate`, not hardcoded

### Active Consumers (7 code paths — Phase 9 audit)

| File | Usage |
|------|-------|
| `app/chef/bookings/[id]/page.tsx` | Loads checklist for chef detail view |
| `app/chef/bookings/actions.ts` | `updatePrep()` — upserts chef checklist |
| `lib/chef-performance.ts` | Reads for prep completion rate metric |
| `lib/leaderboard.ts` | Reads for leaderboard prep score |
| `lib/badges.ts` | Reads for "Prep Perfect" badge award |
| `lib/coaching-triggers.ts` | Reads for coaching trigger evaluation |
| `lib/ops-dashboard.ts` | Reads for ops dashboard risk flags |

**Conflict risk:** Neither ChefPrepChecklist nor BookingPrepItem reads or writes the other. A chef can mark all their items complete while admin BookingPrepItem tasks remain pending (or vice versa). Performance metrics derive from ChefPrepChecklist; dashboard prep attention derives from BookingPrepItem.

### Decision: Plan Migration, Do Not Remove

`ChefPrepChecklist` is marked `@deprecated` in schema comments to signal the long-term direction, but it **cannot be removed** without migrating all 7 consumers. The recommended path:

1. **Phase 8 (current):** Marked `@deprecated` in schema comments. Not removed. Active usage documented.
2. **Future phase:** Migrate chef-facing prep checks into `BookingPrepItem` with `assigned_to` pointing to the chef and `source = 'chef_portal'`. Update all 7 consumers to read `BookingPrepItem` rows instead.
3. **After migration:** Remove `ChefPrepChecklist`, `PrepChecklistTemplate` models and tables.

### Do Not Delete Yet

The model has active usage across 7 code paths (chef portal, performance, leaderboard, badges, coaching, ops dashboard). Removing it would break chef-facing functionality and metrics.

---

## Deprecated: sendDepositReceivedEmail

- Function in `lib/email.ts`
- Never called anywhere
- `sendPrivateDiningBookingConfirmedEmail` is used instead
- Marked `@deprecated` in Phase 7
- Safe to remove in a future cleanup phase

---

## Deprecated: STRIPE_DEPOSIT_PRICE_ID

- Was used for fixed-price deposit checkout
- Replaced by dynamic `price_data` in Phase 5
- `.env.example` notes it as deprecated
- Safe to remove from env after confirming no call sites reference it
