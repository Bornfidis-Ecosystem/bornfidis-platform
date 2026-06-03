import { db } from '@/lib/db'

export type AdminActivityFeedItem = {
  id: string
  type: string
  title: string
  description: string
  division: string
  createdAt: string
  metadata?: Record<string, unknown>
}

/**
 * Last 20 activity events (same shape as GET /api/admin/activity).
 */
export async function getAdminActivityFeedItems(): Promise<AdminActivityFeedItem[]> {
  const items = await db.activityLog.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      eventType: true,
      title: true,
      description: true,
      division: true,
      createdAt: true,
      metadata: true,
    },
  })
  return items.map(({ id, eventType, title, description, division, createdAt, metadata }) => ({
    id,
    type: eventType,
    title: title ?? description,
    description,
    division,
    createdAt: createdAt.toISOString(),
    metadata: metadata ?? undefined,
  }))
}
