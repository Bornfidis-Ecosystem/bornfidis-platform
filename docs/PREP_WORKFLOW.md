# Preparation Workflow — Bornfidis Platform

**Date:** 2026-07-14 (Phase 8)

---

## Source of Truth

**`BookingPrepItem`** (table: `booking_prep_items`) is the authoritative source for prep completion.

Dashboard queries, action queues, and completion percentages are derived from prep item rows — not from inline boolean fields on `BookingInquiry`.

Legacy boolean gates (`menuConfirmed`, `guestCountConfirmed`, etc.) are kept as fallback for pre-Phase-8 bookings and are documented in `docs/LEGACY_FIELD_DEPRECATION.md`.

---

## BookingPrepItem Model (Phase 8)

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Primary key |
| `booking_id` | FK | Links to BookingInquiry |
| `title` | String | Human-readable task name |
| `task_type` | String? | Semantic type (menu_approval, guest_count, etc.) |
| `order` | Int | Display order |
| `status` | String | pending / in_progress / blocked / completed / cancelled |
| `priority` | String | low / normal / high / urgent |
| `assigned_to` | String? | User/role responsible |
| `due_at` | DateTime? | Deadline (high-priority items default to event - 2 days) |
| `completed` | Boolean | Derived from status for backward compat |
| `completed_at` | DateTime? | When marked complete |
| `notes` | String? | Free-form notes |
| `source` | String | system / manual |
| `metadata` | Json? | Extensible data |
| `created_at` | DateTime | Auto |
| `updated_at` | DateTime | Auto |

---

## Default Prep Items (13 tasks)

Created idempotently when a booking is confirmed:

| # | Title | Task Type | Priority |
|---|-------|-----------|----------|
| 1 | Menu approved | menu_approval | high |
| 2 | Guest count confirmed | guest_count | high |
| 3 | Location confirmed | location | high |
| 4 | Dietary and allergies confirmed | dietary | high |
| 5 | Arrival time confirmed | arrival_time | normal |
| 6 | Service time confirmed | service_time | normal |
| 7 | Equipment and rentals | equipment | normal |
| 8 | Ingredient sourcing and purchasing | ingredients | high |
| 9 | Prep schedule | prep_schedule | normal |
| 10 | Staffing confirmed | staffing | normal |
| 11 | Balance payment reminder | balance_reminder | normal |
| 12 | Final client confirmation | final_confirmation | high |
| 13 | Post-event follow-up | post_event | low |

High-priority items get `due_at` = event date - 2 days.

---

## Dashboard Integration

### Prep Attention (`lib/admin-prep-attention.ts`)

Query logic:
1. Fetch bookings with events in next 7 days
2. For each booking:
   - If `prepItems` rows exist → derive completion from task `status`
   - If no prep items → fall back to legacy boolean gates
3. Filter to bookings with incomplete tasks

### Action Queue (`lib/admin-action-needed.ts`)

New Phase 8 cards:
- **Overdue Prep Tasks**: bookings with prep items past `due_at` and not completed
- **Failed Emails**: count from `email_send_log` where status = failed (7 days)
- **DS Applications**: pending Digital Studio applications
- **DS Awaiting Client**: projects in `client_review` status

---

## Audit Logging

All prep transitions logged to `activity_log`:
- `prep_tasks_created` — when default tasks are generated
- `prep_task_status_changed` — when a task changes status

Each entry captures: `actor_name`, `entity_type`, `entity_id`, `previous_value`, `new_value`.

---

## Status Transitions

```
pending → in_progress → completed
pending → blocked → in_progress → completed
pending → cancelled
in_progress → blocked → in_progress → completed
```

---

## Scheduled Reminders (Vercel Cron)

| Cron | Schedule | Purpose |
|------|----------|---------|
| `/api/cron/prep-reminders` | Daily 8 AM UTC | Push notification to chefs with events tomorrow |
| `/api/cron/balance-reminders` | Daily 9 AM UTC | Email clients with unpaid balance |
| `/api/cron/inquiry-reminders` | Daily 10 AM UTC | Email stale inquiries |
| `/api/cron/sla` | Daily 6 AM UTC | SLA breach detection |

---

## Deprecated Systems

| System | Status | Replacement |
|--------|--------|-------------|
| Inline boolean gates | Deprecated (fallback) | BookingPrepItem rows |
| ChefPrepChecklist | Deprecated (unused) | BookingPrepItem rows |
| BookingTimeline | Active but separate | Milestone tracking |

See `docs/LEGACY_FIELD_DEPRECATION.md` for migration plan.

---

## Test Checklist

- [ ] Confirm booking → 13 prep tasks created (idempotent)
- [ ] Confirm again → 0 new tasks created
- [ ] Dashboard Prep Attention shows incomplete tasks
- [ ] Complete a task → dashboard count updates
- [ ] Set due_at in the past → Overdue appears in Action Queue
- [ ] Complete all tasks → booking shows 100% prep complete
- [ ] Pre-Phase-8 booking (no prep items) → legacy boolean fallback works
