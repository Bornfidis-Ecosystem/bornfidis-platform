import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { db } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const DIVISIONS = ['Sportswear', 'Academy', 'Provisions', 'ProJu'] as const
const createActivitySchema = z.object({
  eventType: z.string().min(1),
  description: z.string().min(1),
  division: z.enum(DIVISIONS),
})

/**
 * GET /api/admin/activity
 * Returns last 20 ActivityLog records: { id, eventType, description, division, createdAt }.
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const items = await db.activityLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: { id: true, eventType: true, description: true, division: true, createdAt: true },
    })
    return NextResponse.json(
      items.map(({ id, eventType, description, division, createdAt }) => ({
        id,
        eventType,
        description,
        division,
        createdAt: createdAt.toISOString(),
      }))
    )
  } catch (err) {
    console.error('[admin/activity] GET', err)
    return NextResponse.json({ error: 'Failed to load activity' }, { status: 500 })
  }
}

/**
 * POST /api/admin/activity
 * Creates an ActivityLog record from { eventType, description, division }.
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

  try {
    const item = await db.activityLog.create({
      data: {
        eventType: parsed.data.eventType,
        description: parsed.data.description,
        division: parsed.data.division,
      },
    })
    return NextResponse.json({
      id: item.id,
      eventType: item.eventType,
      description: item.description,
      division: item.division,
      createdAt: item.createdAt.toISOString(),
    })
  } catch (err) {
    console.error('[admin/activity] POST', err)
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 })
  }
}
