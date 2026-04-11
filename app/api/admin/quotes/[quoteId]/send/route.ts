export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { sendApprovedQuoteById } from '@/lib/send-approved-quote'

/**
 * POST /api/admin/quotes/[quoteId]/send
 * Sends a draft relational quote email (review mode) and marks quote sent.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { quoteId: string } },
) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const quoteId = params.quoteId
  if (!quoteId) {
    return NextResponse.json({ success: false, error: 'quoteId required' }, { status: 400 })
  }

  const result = await sendApprovedQuoteById(quoteId)
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error || 'Send failed' },
      { status: result.error?.includes('already') ? 409 : 400 },
    )
  }

  return NextResponse.json({ success: true })
}
