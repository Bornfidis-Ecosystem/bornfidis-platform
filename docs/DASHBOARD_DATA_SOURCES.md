# Dashboard Data Sources — Bornfidis Platform

**Date:** 2026-07-14 (Phase 8)

---

## Action Queue Cards

| Card | Source | Table | Filters | Date Range | Empty State | Click-Through |
|------|--------|-------|---------|------------|-------------|---------------|
| Deposit Follow-Up | `getAdminActionNeeded()` | `booking_inquiries` | Status quoted/booked, no `paid_at` | Event 0–14 days out | "No actions right now" | `/admin/bookings?deposit=pending` |
| Upcoming Prep | `getAdminActionNeeded()` | `booking_inquiries` | Status confirmed | Event 0–3 days out | "No actions right now" | `/admin/bookings?status=confirmed&upcoming=3` |
| Final Balance Reminder | `getAdminActionNeeded()` | `booking_inquiries` | Status confirmed, no `balance_paid_at` | Event 0–2 days out | "No actions right now" | `/admin/bookings?balance=pending` |
| Post-Event Follow-Up | `getAdminActionNeeded()` | `booking_inquiries` | Status completed | Event 1–3 days ago | "No actions right now" | `/admin/bookings?testimonial=needed` |
| Overdue Prep Tasks | `getAdminActionNeeded()` | `booking_prep_items` | Status not completed/cancelled, `due_at` < now | Event in future | Only shown when > 0 | `/admin/bookings?prep=overdue` |
| Failed Emails | `getFailedEmailCount()` | `email_send_log` | Status = failed | Last 7 days | Only shown when > 0 | `/admin/email-log` |
| DS Applications | `getAdminActionNeeded()` | `digital_studio_applications` | Status new/reviewing | All time | Only shown when > 0 | `/admin/digital-studio` |
| DS Awaiting Client | `getAdminActionNeeded()` | `digital_studio_projects` | Status = client_review | All time | Only shown when > 0 | `/admin/digital-studio` |

## Prep Attention Section

| Card | Source | Table | Filters | Date Range | Empty State |
|------|--------|-------|---------|------------|-------------|
| Prep Attention | `getPrepAttentionNeeded()` | `booking_inquiries` + `booking_prep_items` | Incomplete prep tasks OR legacy boolean gates | Event 0–7 days out | "No bookings need prep attention" |

**Source of truth:** When `booking_prep_items` rows exist for a booking, completion is derived from task `status`. When no prep items exist (pre-Phase-8 bookings), legacy inline boolean gates are used as fallback.

## Dashboard Metrics

| Metric | Source | Table |
|--------|--------|-------|
| Total Leads This Week | `getAdminDashboardMetrics()` | `booking_inquiries` |
| Confirmed Bookings This Week | same | `booking_inquiries` |
| Quotes Created This Week | same | `booking_inquiries` |
| Deposits Received This Week | same | `booking_inquiries` |
| Upcoming Bookings (7 days) | same | `booking_inquiries` |

## Email Log

| View | Source | Table |
|------|--------|-------|
| Email Log Admin Page | `getEmailSendLogs()` | `email_send_log` |
| Failed Email Count | `getFailedEmailCount()` | `email_send_log` |
