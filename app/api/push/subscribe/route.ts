import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentUserRole } from '@/lib/get-user-role'

/**
 * Phase 2AK — Register a Web Push subscription for the current user.
 * POST /api/push/subscribe
 * Body: { subscription: PushSubscriptionJSON } (endpoint, keys.p256dh, keys.auth)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Resolve to Prisma User (sync role if needed)
    await getCurrentUserRole()
    const prismaUser = await db.user.findFirst({
      where: {
        OR: [{ openId: user.id }, { email: user.email }],
      },
    })
    if (!prismaUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 403 })
    }

    const body = await request.json()
    const { subscription } = body
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription: endpoint and keys.p256dh, keys.auth required' },
        { status: 400 }
      )
    }

    const userAgent = request.headers.get('user-agent') ?? undefined

    await db.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      create: {
        userId: prismaUser.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent,
      },
      update: {
        userId: prismaUser.id,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent,
      },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Push subscribe error:', e)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
