// ============================================
// BORNFIDIS BOOKING SERVICE
// Complete booking workflow functions (Supabase)
// ============================================
// Expects Supabase tables: bookings, quotes, booking_items, payments.
// For Prisma-based booking_inquiries flow, see app/admin/bookings/actions.ts

import { supabaseAdmin } from '@/lib/supabase'

// ============================================
// Types
// ============================================

export interface CreateBookingData {
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  serviceType?: string
  eventDate: string
  eventTime?: string | null
  location: string
  villaName?: string | null
  guestCount?: number | null
  specialRequests?: string | null
  dietaryRestrictions?: string[] | null
  source?: string
}

export interface CreateQuoteData {
  serviceType: string
  subtotal: number
  tax?: number
  discount?: number
  total: number
  depositPercentage?: number
  notes?: string | null
}

export interface QuoteLineItemInput {
  type?: string
  name: string
  description?: string | null
  quantity?: number
  price: number
  category?: string
}

export interface RecordPaymentData {
  amount: number
  type: 'deposit' | 'final'
  method: string
  date?: string
  referenceNumber?: string | null
  notes?: string | null
  processedBy?: string
}

export interface GetBookingsFilters {
  status?: string
  serviceType?: string
  startDate?: string
  endDate?: string
}

// ============================================
// 1. CREATE NEW BOOKING (Inquiry Stage)
// ============================================
export async function createBooking(bookingData: CreateBookingData) {
  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        customer_name: bookingData.customerName,
        customer_phone: bookingData.customerPhone,
        customer_email: bookingData.customerEmail || null,
        service_type: bookingData.serviceType || 'villa_chef',
        event_date: bookingData.eventDate,
        event_time: bookingData.eventTime || null,
        location: bookingData.location,
        villa_name: bookingData.villaName || null,
        guest_count: bookingData.guestCount || null,
        special_requests: bookingData.specialRequests || null,
        dietary_restrictions: bookingData.dietaryRestrictions || [],
        booking_status: 'inquiry',
        source: bookingData.source || 'website',
      })
      .select()
      .single()

    if (error) throw error

    console.log('✅ Booking created:', data.id)
    return { success: true, data }
  } catch (error: any) {
    console.error('❌ Error creating booking:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// 2. CREATE QUOTE
// ============================================
export async function createQuote(bookingId: string, quoteData: CreateQuoteData) {
  try {
    const depositAmount =
      (quoteData.total * (quoteData.depositPercentage || 50)) / 100

    const { data, error } = await supabaseAdmin
      .from('quotes')
      .insert({
        booking_id: bookingId,
        service_type: quoteData.serviceType,
        subtotal_usd: quoteData.subtotal,
        tax_usd: quoteData.tax ?? 0,
        discount_usd: quoteData.discount ?? 0,
        total_usd: quoteData.total,
        quote_status: 'draft',
        deposit_percentage: quoteData.depositPercentage ?? 50,
        deposit_amount_usd: depositAmount,
        payment_terms:
          '50% deposit required to confirm booking. Balance due after service.',
        notes: quoteData.notes ?? null,
      })
      .select()
      .single()

    if (error) throw error

    console.log('✅ Quote created:', data.id)
    return { success: true, data }
  } catch (error: any) {
    console.error('❌ Error creating quote:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// 3. ADD QUOTE LINE ITEMS
// ============================================
export async function addQuoteItems(
  bookingId: string,
  quoteId: string,
  items: QuoteLineItemInput[]
) {
  try {
    const lineItems = items.map((item) => ({
      booking_id: bookingId,
      quote_id: quoteId,
      item_type: item.type ?? 'menu',
      item_name: item.name,
      description: item.description ?? null,
      quantity: item.quantity ?? 1,
      unit_price_usd: item.price,
      total_price_usd: (item.quantity ?? 1) * item.price,
      category: item.category ?? 'food',
    }))

    const { data, error } = await supabaseAdmin
      .from('booking_items')
      .insert(lineItems)
      .select()

    if (error) throw error

    console.log(`✅ Added ${data.length} line items`)
    return { success: true, data }
  } catch (error: any) {
    console.error('❌ Error adding line items:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// 4. SEND QUOTE TO CUSTOMER
// ============================================
export async function sendQuote(quoteId: string, bookingId: string) {
  try {
    const { error: quoteError } = await supabaseAdmin
      .from('quotes')
      .update({
        quote_status: 'sent',
        sent_date: new Date().toISOString().split('T')[0],
        expires_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      })
      .eq('id', quoteId)

    if (quoteError) throw quoteError

    const { data: quote } = await supabaseAdmin
      .from('quotes')
      .select('total_usd')
      .eq('id', quoteId)
      .single()

    const { error: bookingError } = await supabaseAdmin
      .from('bookings')
      .update({
        booking_status: 'quoted',
        quote_sent_date: new Date().toISOString().split('T')[0],
        quoted_amount_usd: quote?.total_usd ?? null,
      })
      .eq('id', bookingId)

    if (bookingError) throw bookingError

    console.log('✅ Quote sent, status updated to "quoted"')
    return { success: true }
  } catch (error: any) {
    console.error('❌ Error sending quote:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// 5. ACCEPT QUOTE
// ============================================
export async function acceptQuote(quoteId: string, bookingId: string) {
  try {
    const { error: quoteError } = await supabaseAdmin
      .from('quotes')
      .update({
        quote_status: 'accepted',
        accepted_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', quoteId)

    if (quoteError) throw quoteError

    const { error: bookingError } = await supabaseAdmin
      .from('bookings')
      .update({
        booking_status: 'confirmed',
        quote_accepted_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', bookingId)

    if (bookingError) throw bookingError

    console.log('✅ Quote accepted, booking confirmed')
    return { success: true }
  } catch (error: any) {
    console.error('❌ Error accepting quote:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// 6. RECORD PAYMENT
// ============================================
/**
 * Record a deposit or final payment and update booking status.
 *
 * @example
 * // Record deposit received
 * async function handleDepositReceived(bookingId, amount, method, reference) {
 *   const result = await recordPayment(bookingId, {
 *     amount: amount,
 *     type: 'deposit',
 *     method: method, // 'bank_transfer', 'cash', etc.
 *     referenceNumber: reference,
 *     notes: `Deposit received via ${method}`,
 *   });
 *   if (result.success) {
 *     alert('Deposit recorded successfully!');
 *     // Send WhatsApp confirmation to customer
 *   }
 * }
 */
export async function recordPayment(
  bookingId: string,
  paymentData: RecordPaymentData
) {
  try {
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        booking_id: bookingId,
        amount_usd: paymentData.amount,
        payment_type: paymentData.type,
        payment_method: paymentData.method,
        payment_status: 'completed',
        payment_date:
          paymentData.date ?? new Date().toISOString().split('T')[0],
        reference_number: paymentData.referenceNumber ?? null,
        notes: paymentData.notes ?? null,
        processed_by: paymentData.processedBy ?? 'Brian Maylor',
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    let bookingUpdate: Record<string, unknown> = {}

    if (paymentData.type === 'deposit') {
      bookingUpdate = {
        booking_status: 'deposit_received',
        deposit_paid: true,
        deposit_paid_date:
          paymentData.date ?? new Date().toISOString().split('T')[0],
        deposit_amount_usd: paymentData.amount,
      }
    } else if (paymentData.type === 'final') {
      bookingUpdate = {
        booking_status: 'paid',
        final_paid: true,
        final_paid_date:
          paymentData.date ?? new Date().toISOString().split('T')[0],
        final_amount_usd: paymentData.amount,
      }
    }

    const { error: bookingError } = await supabaseAdmin
      .from('bookings')
      .update(bookingUpdate)
      .eq('id', bookingId)

    if (bookingError) throw bookingError

    console.log(`✅ ${paymentData.type} payment recorded: $${paymentData.amount}`)
    return { success: true, data: payment }
  } catch (error: any) {
    console.error('❌ Error recording payment:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// 7. UPDATE BOOKING STATUS
// ============================================
export async function updateBookingStatus(
  bookingId: string,
  status: string,
  additionalData: Record<string, unknown> = {}
) {
  try {
    const { error } = await supabaseAdmin
      .from('bookings')
      .update({
        booking_status: status,
        ...additionalData,
      })
      .eq('id', bookingId)

    if (error) throw error

    console.log(`✅ Booking status updated to: ${status}`)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Error updating booking status:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// 8. GET BOOKING WITH FULL DETAILS
// ============================================
export async function getBookingDetails(bookingId: string) {
  try {
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (bookingError) throw bookingError

    const { data: quote } = await supabaseAdmin
      .from('quotes')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const { data: items } = await supabaseAdmin
      .from('booking_items')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at')

    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('payment_date')

    return {
      success: true,
      data: {
        booking,
        quote: quote ?? null,
        items: items ?? [],
        payments: payments ?? [],
      },
    }
  } catch (error: any) {
    console.error('❌ Error fetching booking details:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// 9. GET ALL BOOKINGS (with filters)
// ============================================
/**
 * Fetch bookings with optional filters (status, serviceType, date range).
 *
 * @example
 * // Get upcoming confirmed bookings for dashboard
 * async function loadUpcomingBookings() {
 *   const result = await getBookings({
 *     status: 'confirmed',
 *     startDate: new Date().toISOString().split('T')[0],
 *   });
 *   if (result.success) {
 *     displayBookings(result.data);
 *   }
 * }
 */
export async function getBookings(filters: GetBookingsFilters = {}) {
  try {
    let query = supabaseAdmin
      .from('bookings')
      .select('*, quotes(quote_status, total_usd)')

    if (filters.status) {
      query = query.eq('booking_status', filters.status)
    }
    if (filters.serviceType) {
      query = query.eq('service_type', filters.serviceType)
    }
    if (filters.startDate) {
      query = query.gte('event_date', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('event_date', filters.endDate)
    }

    query = query.order('event_date', { ascending: true })

    const { data, error } = await query

    if (error) throw error

    return { success: true, data: data ?? [] }
  } catch (error: any) {
    console.error('❌ Error fetching bookings:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// 10. COMPLETE BOOKING WORKFLOW (All-in-One)
// ============================================
/**
 * Create booking + quote + line items in one call (e.g. from booking form submit).
 *
 * @example
 * // In your booking form submission
 * async function handleBookingSubmit(formData) {
 *   const result = await completeBookingWorkflow(
 *     {
 *       customerName: formData.name,
 *       customerPhone: formData.phone,
 *       customerEmail: formData.email,
 *       serviceType: 'villa_chef',
 *       eventDate: formData.date,
 *       eventTime: formData.time,
 *       location: formData.location,
 *       villaName: formData.villaName,
 *       guestCount: formData.guests,
 *       specialRequests: formData.requests,
 *       dietaryRestrictions: formData.dietary,
 *       source: 'website',
 *     },
 *     [
 *       { name: 'Caribbean Favorites Menu', price: 130, quantity: 1, type: 'menu' },
 *       { name: 'Vegetarian Option', price: 20, quantity: 1, type: 'addon' },
 *     ]
 *   );
 *   if (result.success) {
 *     alert(`Booking created! ID: ${result.bookingId}`);
 *     // Send WhatsApp confirmation, redirect, etc.
 *   } else {
 *     alert(`Error: ${result.error}`);
 *   }
 * }
 */
export async function completeBookingWorkflow(
  bookingData: CreateBookingData,
  quoteItems: QuoteLineItemInput[]
) {
  try {
    const bookingResult = await createBooking(bookingData)
    if (!bookingResult.success) throw new Error('Failed to create booking')

    const bookingId = bookingResult.data.id

    const subtotal = quoteItems.reduce(
      (sum, item) => sum + item.price * (item.quantity ?? 1),
      0
    )
    const total = subtotal

    const quoteResult = await createQuote(bookingId, {
      serviceType: bookingData.serviceType ?? 'villa_chef',
      subtotal,
      total,
      depositPercentage: 50,
    })
    if (!quoteResult.success) throw new Error('Failed to create quote')

    const quoteId = quoteResult.data.id

    const itemsResult = await addQuoteItems(bookingId, quoteId, quoteItems)
    if (!itemsResult.success) throw new Error('Failed to add line items')

    console.log('✅ Complete workflow executed successfully')
    return {
      success: true,
      bookingId,
      quoteId,
      data: {
        booking: bookingResult.data,
        quote: quoteResult.data,
        items: itemsResult.data,
      },
    }
  } catch (error: any) {
    console.error('❌ Workflow error:', error)
    return { success: false, error: error.message }
  }
}
