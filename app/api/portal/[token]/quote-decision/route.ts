export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type Body = { action?: string }

/**
 * Phase 5: Client accept / decline quote (no payment).
 * POST /api/portal/[token]/quote-decision
 * Body: { action: 'accept' | 'decline' }
 *
 * Deposit payment remains the path that confirms booking financially;
 * accept locks the quote; decline marks quote + booking declined.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } },
) {
  try {
    const token = params.token
    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 })
    }

    let body: Body = {}
    try {
      body = (await request.json()) as Body
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }

    const action = (body.action ?? '').toLowerCase()
    if (action !== 'accept' && action !== 'decline') {
      return NextResponse.json(
        { success: false, error: 'action must be accept or decline' },
        { status: 400 },
      )
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_inquiries')
      .select(
        'id, paid_at, quote_status, quote_total_cents, customer_portal_token_revoked_at, status',
      )
      .eq('customer_portal_token', token)
      .is('customer_portal_token_revoked_at', null)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ success: false, error: 'Invalid or expired link' }, { status: 404 })
    }

    if (booking.paid_at) {
      return NextResponse.json(
        {
          success: false,
          error: 'Deposit already paid — quote is locked as accepted.',
        },
        { status: 400 },
      )
    }

    const current = (booking.quote_status ?? '').toLowerCase()
    if (current === 'accepted' && action === 'accept') {
      return NextResponse.json({ success: true, quote_status: 'accepted' })
    }
    if (current === 'declined' && action === 'decline') {
      return NextResponse.json({ success: true, quote_status: 'declined' })
    }

    if (!(booking.quote_total_cents > 0)) {
      return NextResponse.json(
        { success: false, error: 'No quote is available to accept yet.' },
        { status: 400 },
      )
    }

    if (action === 'accept') {
      const { error: updateError } = await supabaseAdmin
        .from('booking_inquiries')
        .update({
          quote_status: 'accepted',
          quote_updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id)

      if (updateError) {
        console.error('quote accept update:', updateError)
        return NextResponse.json({ success: false, error: 'Failed to accept quote' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        quote_status: 'accepted',
        message: 'Quote accepted. Pay your deposit to secure the date.',
      })
    }

    const { error: declineError } = await supabaseAdmin
      .from('booking_inquiries')
      .update({
        quote_status: 'declined',
        status: 'declined',
        quote_updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id)

    if (declineError) {
      console.error('quote decline update:', declineError)
      return NextResponse.json({ success: false, error: 'Failed to decline quote' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      quote_status: 'declined',
      message: 'Quote declined. Thank you for letting us know.',
    })
  } catch (error: unknown) {
    console.error('quote-decision error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update quote decision',
      },
      { status: 500 },
    )
  }
}
