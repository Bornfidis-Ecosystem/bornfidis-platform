export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { db } from '@/lib/db'
import { canSubmitReview } from '@/lib/reviews'

/**
 * Phase 2U: Submit a client review (verified via portal token).
 * POST /api/portal/[token]/review
 * Body: { rating: number (1-5), comment?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token
    if (!token) {
      return NextResponse.json({ success: false, error: 'Token required' }, { status: 400 })
    }

    const { data: booking, error } = await supabaseAdmin
      .from('booking_inquiries')
      .select('id')
      .eq('customer_portal_token', token)
      .is('customer_portal_token_revoked_at', null)
      .single()

    if (error || !booking) {
      return NextResponse.json({ success: false, error: 'Invalid or expired link' }, { status: 404 })
    }

    const check = await canSubmitReview(booking.id)
    if (!check.allowed || !check.chefId) {
      return NextResponse.json(
        { success: false, error: check.reason || 'Cannot submit review' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const rating = typeof body.rating === 'number' ? body.rating : parseInt(String(body.rating), 10)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be 1–5' },
        { status: 400 }
      )
    }
    const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 2000) : null

    await db.review.create({
      data: {
        bookingId: booking.id,
        chefId: check.chefId,
        rating,
        comment: comment || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    console.error('Submit review error:', e)
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Failed to submit review' },
      { status: 500 }
    )
  }
}
