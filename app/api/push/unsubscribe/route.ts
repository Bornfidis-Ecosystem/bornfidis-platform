import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * Phase 2AK — Remove a Web Push subscription (e.g. on logout or user disabling notifications).
 * POST /api/push/unsubscribe
 * Body: { endpoint: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const endpoint = body?.endpoint
    if (!endpoint || typeof endpoint !== 'string') {
      return NextResponse.json({ error: 'endpoint required' }, { status: 400 })
    }

    const deleted = await db.pushSubscription.deleteMany({
      where: {
        endpoint,
        user: {
          OR: [{ openId: user.id }, { email: user.email }],
        },
      },
    })

    return NextResponse.json({ success: true, removed: deleted.count })
  } catch (e) {
    console.error('Push unsubscribe error:', e)
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
  }
}
