export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/requireAdmin'

/**
 * Admin API route to fetch WhatsApp messages
 * Uses Prisma Client to query database
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const authError = await requireAdmin(request)
    if (authError) return authError
    const messages = await db.whatsAppMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error('❌ Error fetching WhatsApp messages:', error)
    return NextResponse.json(
      { error: error.message || 'Unknown error', messages: [] },
      { status: 500 }
    )
  }
}
