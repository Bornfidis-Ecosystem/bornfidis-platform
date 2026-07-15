# Digital Studio Project Flow — Bornfidis Platform

**Date:** 2026-07-14 (Phase 8)

---

## Architecture

### Models

| Model | Table | Purpose |
|-------|-------|---------|
| `DigitalStudioApplication` | `digital_studio_applications` | Lead intake / CRM pipeline |
| `DigitalStudioProject` | `digital_studio_projects` | Active delivery project |
| `DigitalStudioProjectTask` | `digital_studio_project_tasks` | Milestone tasks per project |

### Application → Project Lifecycle

```
Application submitted (public form)
  → new → reviewing → consultation → proposal → accepted
  → [Admin: Convert to Project]
  → Project created (status: active, phase: discovery)
  → 18 default milestone tasks created (idempotent)
  → Application status set to in_progress
```

### Project Statuses

| Status | Description |
|--------|-------------|
| `lead` | Pre-qualification |
| `consultation` | Discovery call scheduled/completed |
| `proposal_sent` | Proposal delivered to client |
| `awaiting_acceptance` | Client reviewing proposal |
| `awaiting_deposit` | Accepted, waiting for payment |
| `active` | Deposit paid, work in progress |
| `client_review` | Client reviewing deliverable |
| `launch_ready` | Approved, ready to go live |
| `launched` | Site is live |
| `support` | Post-launch support period |
| `completed` | All work done |
| `paused` | On hold |
| `cancelled` | Cancelled |

### Project Phases

discovery → proposal → design → build → review → launch → support

### Default Milestones (18 tasks)

1. Consultation completed
2. Scope approved
3. Proposal accepted
4. Deposit received
5. Content requested
6. Content received
7. Brand assets received
8. Sitemap approved
9. Design/build started
10. Review link sent
11. Revision round 1
12. Revision round 2
13. Launch approved
14. Domain connected
15. Analytics connected
16. Handover completed
17. Support period started
18. Support period completed

---

## Admin Flow

### Application Management (`/admin/digital-studio`)
- View all applications with status badges
- Click into application detail
- Change status via dropdown
- Convert accepted application to project (set total, deposit, target launch)

### Project Management (`/admin/digital-studio/[id]`)
- Change project status and phase
- View and complete milestone tasks
- Progress bar shows completion %
- Links back to original application

---

## Audit Logging

All transitions logged to `activity_log`:
- `project_created` — when converted from application
- `status_changed` — project status transitions
- `phase_changed` — project phase transitions
- `task_completed` — individual milestone completions

Each log entry captures: `actor_name`, `entity_type`, `entity_id`, `previous_value`, `new_value`.

---

## Data Sources for Dashboard

| Card | Source | Query |
|------|--------|-------|
| DS Applications (pending) | `digital_studio_applications` | `status IN ('new', 'reviewing')` |
| Active DS Projects | `digital_studio_projects` | `status NOT IN ('completed', 'cancelled', 'paused')` |
| DS Awaiting Client Input | `digital_studio_projects` | `status = 'client_review'` |

---

## Test Checklist

- [ ] Submit DS application via public form
- [ ] Application appears in `/admin/digital-studio`
- [ ] Change application status to accepted
- [ ] Convert to project → verify project number generated, 18 tasks created
- [ ] Change project status and phase → verify audit log entries
- [ ] Complete milestone tasks → verify progress updates
- [ ] Verify idempotent task creation (converting again returns existing project)
