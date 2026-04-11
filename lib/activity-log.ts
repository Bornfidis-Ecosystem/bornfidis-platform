import { db } from '@/lib/db'

/** Division values for activity log (matches dashboard). */
export type ActivityDivision = 'ACADEMY' | 'PROVISIONS' | 'SPORTSWEAR' | 'PROJU' | 'SYSTEM'

/** Event types for the live activity feed. */
export type ActivityEventType =
  | 'EMAIL_SUBSCRIBER'
  | 'BOOKING_LEAD'
  | 'ACADEMY_PURCHASE'
  | 'SPORTSWEAR_ORDER'
  | 'FARMER_SIGNUP'
  | 'ADMIN_LOG'

export interface LogActivityParams {
  type: ActivityEventType
  title: string
  description: string
  division: ActivityDivision
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
        metadata: params.metadata ?? undefined,
      },
    })
  } catch (err) {
    console.error('[activity-log] Failed to log event:', params.type, err)
  }
}
