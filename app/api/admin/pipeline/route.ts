import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { db } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const DIVISIONS = ['Sportswear', 'Academy', 'Provisions', 'ProJu'] as const
const STATUSES = ['lead', 'confirmed', 'completed'] as const

const createPipelineSchema = z.object({
  title: z.string().min(1),
  division: z.enum(DIVISIONS),
  expectedDate: z.string().optional(), // YYYY-MM-DD
  estimatedValue: z.number().int().min(0).optional(),
  status: z.enum(STATUSES).optional(),
})

/**
 * GET /api/admin/pipeline
 * Returns all pipeline items (for Zone 3 table).
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const items = await db.pipelineItem.findMany({
      orderBy: { expectedDate: 'asc' },
    })
    return NextResponse.json(items)
  } catch (err) {
    console.error('[admin/pipeline] GET', err)
    return NextResponse.json({ error: 'Failed to load pipeline' }, { status: 500 })
  }
}

/**
 * POST /api/admin/pipeline
 * Create a new pipeline item.
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

  const parsed = createPipelineSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().formErrors[0] ?? 'Invalid input' }, { status: 400 })
  }

  try {
    const item = await db.pipelineItem.create({
      data: {
        title: parsed.data.title,
        division: parsed.data.division,
        expectedDate: parsed.data.expectedDate ? new Date(parsed.data.expectedDate) : null,
        estimatedValue: parsed.data.estimatedValue ?? null,
        status: parsed.data.status ?? 'lead',
      },
    })
    return NextResponse.json(item)
  } catch (err) {
    console.error('[admin/pipeline] POST', err)
    return NextResponse.json({ error: 'Failed to create pipeline item' }, { status: 500 })
  }
}
