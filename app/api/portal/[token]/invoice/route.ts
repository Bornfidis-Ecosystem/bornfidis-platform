export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePdfDocument } from '@/components/pdf/InvoicePdf'
import { QuoteLineItem } from '@/types/booking'

/**
 * Phase 4B: Download invoice PDF via portal
 * GET /api/portal/[token]/invoice
 * 
 * Validates token and returns invoice PDF for fully paid bookings
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    // Verify token and get booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_inquiries')
      .select(`
        id,
        name,
        email,
        phone,
        event_date,
        event_time,
        location,
        guests,
        quote_subtotal_cents,
        quote_tax_cents,
        quote_service_fee_cents,
        quote_total_cents,
        quote_notes,
        quote_line_items,
        deposit_amount_cents,
        balance_amount_cents,
        paid_at,
        balance_paid_at,
        fully_paid_at,
        customer_portal_token_revoked_at
      `)
      .eq('customer_portal_token', token)
      .is('customer_portal_token_revoked_at', null)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired link' },
        { status: 404 }
      )
    }

    // Check if fully paid
    if (!booking.fully_paid_at) {
      return NextResponse.json(
        { success: false, error: 'Invoice is only available after full payment' },
        { status: 403 }
      )
    }

    // Parse line items
    let lineItems: QuoteLineItem[] = []
    if (booking.quote_line_items) {
      if (Array.isArray(booking.quote_line_items)) {
        lineItems = booking.quote_line_items as QuoteLineItem[]
      } else if (typeof booking.quote_line_items === 'string') {
        try {
          lineItems = JSON.parse(booking.quote_line_items) as QuoteLineItem[]
        } catch {
          lineItems = []
        }
      }
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      InvoicePdfDocument({ 
        booking: booking as any, 
        lineItems 
      })
    )

    // Return PDF response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${booking.name.replace(/\s+/g, '-')}-${booking.id.slice(0, 8)}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('Error generating invoice PDF:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}
