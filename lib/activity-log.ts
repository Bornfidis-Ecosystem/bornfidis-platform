import { db } from '@/lib/db'

/** Division values for activity log (matches dashboard). */
export type ActivityDivision = 'ACADEMY' | 'PROVISIONS' | 'SPORTSWEAR' | 'PROJU' | 'DIGITAL_STUDIO' | 'SYSTEM'

/** Event types for the live activity feed. */
export type ActivityEventType =
  | 'EMAIL_SUBSCRIBER'
  | 'BOOKING_LEAD'
  | 'ACADEMY_PURCHASE'
  | 'SPORTSWEAR_ORDER'
  | 'FARMER_SIGNUP'
  | 'DIGITAL_STUDIO_APPLICATION'
  | 'DIGITAL_STUDIO_PROJECT'
  | 'PREP_TASK'
  | 'EMAIL_SEND'
  | 'ADMIN_LOG'

export interface LogActivityParams {
  type: ActivityEventType
  title: string
  description: string
  division: ActivityDivision
  actorId?: string
  actorName?: string
  entityType?: string
  entityId?: string
  action?: string
  previousValue?: string
  newValue?: string
  metadata?: Record<string, unknown>
}

/**
 * Write an event to the activity log (used by API routes and server actions).
 * Non-blocking: logs errors but does not throw so callers are not broken.
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await db.activityLog.create({
      data: {
        eventType: params.type,
        title: params.title,
        description: params.description,
        division: params.division,
        actorId: params.actorId,
        actorName: params.actorName,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        previousValue: params.previousValue,
        newValue: params.newValue,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
      },
    })
  } catch (err) {
    console.error('[activity-log] Failed to log event:', params.type, err)
  }
}

/**
 * Phase 8 — Audit a workflow transition (entity-level change tracking).
 */
export async function logWorkflowTransition(params: {
  division: ActivityDivision
  entityType: string
  entityId: string
  action: string
  title: string
  description?: string
  actorName?: string
  previousValue?: string
  newValue?: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  return logActivity({
    type: 'ADMIN_LOG',
    title: params.title,
    description: params.description || params.title,
    division: params.division,
    actorName: params.actorName,
    entityType: params.entityType,
    entityId: params.entityId,
    action: params.action,
    previousValue: params.previousValue,
    newValue: params.newValue,
    metadata: params.metadata,
  })
}
