import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { getQuoteLineItems } from '@/app/admin/bookings/actions'
import BookingInvoiceClient from './BookingInvoiceClient'
import { BookingInquiry, QuoteLineItem } from '@/types/booking'

/**
 * Phase 3C: Client Portal - Public booking invoice page
 * Accessible at /booking/[id] without authentication
 * Shows invoice and allows balance payment
 */
export default async function BookingInvoicePage({ params }: { params: { id: string } }) {
  // Fetch booking (public access - no auth required)
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('booking_inquiries')
    .select('*')
    .eq('id', params.id)
    .single()

  if (bookingError || !booking) {
    notFound()
  }

  // Fetch quote line items from JSON field (quote_line_items table doesn't exist yet)
  // Read from booking_inquiries.quote_line_items JSON field instead
  const lineItems: QuoteLineItem[] = (() => {
    try {
      if (booking.quote_line_items) {
        if (Array.isArray(booking.quote_line_items)) {
          return booking.quote_line_items as QuoteLineItem[]
        }
        if (typeof booking.quote_line_items === 'string') {
          return JSON.parse(booking.quote_line_items) as QuoteLineItem[]
        }
      }
      return []
    } catch {
      return []
    }
  })()

  return (
    <div className="min-h-screen bg-gray-50">
      <BookingInvoiceClient 
        booking={booking as BookingInquiry} 
        lineItems={(lineItems || []) as QuoteLineItem[]}
      />
    </div>
  )
}
