import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { db } from '@/lib/db'
import { getAdminActivityFeedItems } from '@/lib/admin-activity-data'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const DIVISION_MAP: Record<string, string> = {
  Sportswear: 'SPORTSWEAR',
  Academy: 'ACADEMY',
  Provisions: 'PROVISIONS',
  ProJu: 'PROJU',
}
const DIVISIONS = ['Sportswear', 'Academy', 'Provisions', 'ProJu'] as const
const createActivitySchema = z.object({
  eventType: z.string().min(1),
  title: z.string().optional(),
  description: z.string().min(1),
  division: z.enum(DIVISIONS),
})

/**
 * GET /api/admin/activity
 * Returns last 20 activity events: { id, type, title, description, division, createdAt, metadata }.
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const items = await getAdminActivityFeedItems()
    return NextResponse.json(items)
  } catch (err) {
    console.error('[admin/activity] GET', err)
    return NextResponse.json({ error: 'Failed to load activity' }, { status: 500 })
  }
}

/**
 * POST /api/admin/activity
 * Creates an ActivityLog record (admin manual log or from form).
 * Body: { eventType, title?, description, division }.
 */
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createActivitySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().formErrors[0] ?? 'Invalid input' },
      { status: 400 }
    )
  }

  const divisionStored = DIVISION_MAP[parsed.data.division] ?? parsed.data.division

  try {
    const item = await db.activityLog.create({
      data: {
        eventType: parsed.data.eventType,
        title: parsed.data.title ?? parsed.data.description,
        description: parsed.data.description,
        division: divisionStored,
      },
    })
    return NextResponse.json({
      id: item.id,
      type: item.eventType,
      title: item.title ?? item.description,
      description: item.description,
      division: item.division,
      createdAt: item.createdAt.toISOString(),
    })
  } catch (err) {
    console.error('[admin/activity] POST', err)
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 })
  }
}
