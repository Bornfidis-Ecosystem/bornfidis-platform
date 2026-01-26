'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { quoteDraftSchema } from '@/lib/validation'
import { QuoteItem, QuoteDraft, BookingQuote } from '@/types/quote'
import { dollarsToCents } from '@/lib/money'

/**
 * Phase 3A: Quote server actions
 * All actions require authentication and use service role for database access
 */

/**
 * Get quote data for a booking (including items)
 */
export async function getQuote(
  bookingId: string
): Promise<{ success: boolean; quote?: BookingQuote; error?: string }> {
  await requireAuth()

  try {
    // Fetch booking with quote fields
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_inquiries')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return { success: false, error: 'Booking not found' }
    }

    // Fetch quote items from JSON field (booking_quote_items table doesn't exist yet)
    // Read from booking_inquiries.quote_line_items JSON field instead
    const items: QuoteItem[] = (() => {
      try {
        if (booking.quote_line_items) {
          if (Array.isArray(booking.quote_line_items)) {
            return booking.quote_line_items as QuoteItem[]
          }
          if (typeof booking.quote_line_items === 'string') {
            return JSON.parse(booking.quote_line_items) as QuoteItem[]
          }
        }
        return []
      } catch {
        return []
      }
    })()

    const quote: BookingQuote = {
      booking_id: bookingId,
      currency: booking.quote_currency || 'USD',
      subtotal_cents: booking.quote_subtotal_cents || 0,
      tax_cents: booking.quote_tax_cents || 0,
      total_cents: booking.quote_total_cents || 0,
      deposit_cents: booking.quote_deposit_cents || 0,
      quote_sent_at: booking.quote_sent_at || undefined,
      stripe_payment_link_url: booking.stripe_payment_link_url || undefined,
      stripe_invoice_id: booking.stripe_invoice_id || undefined,
      stripe_payment_status: (booking.stripe_payment_status as any) || undefined,
      quote_pdf_url: booking.quote_pdf_url || undefined,
      items: (items || []) as QuoteItem[],
      notes: booking.admin_notes || undefined, // Using admin_notes for quote notes for now
    }

    return { success: true, quote }
  } catch (error: any) {
    console.error('Error in getQuote:', error)
    return { success: false, error: error.message || 'Failed to fetch quote' }
  }
}

/**
 * Save quote (items, totals, deposit)
 * Recomputes totals server-side for security
 */
export async function saveQuote(
  bookingId: string,
  draft: QuoteDraft
): Promise<{ success: boolean; quote?: BookingQuote; error?: string }> {
  await requireAuth()

  try {
    // Validate input
    const validated = quoteDraftSchema.parse(draft)

    // Recompute totals server-side (never trust client)
    let subtotalCents = 0
    validated.items.forEach((item) => {
      const lineTotal = item.quantity * item.unit_price_cents
      subtotalCents += lineTotal
      // Update line_total_cents in case client sent wrong value
      item.line_total_cents = lineTotal
    })

    // Calculate tax
    const taxCents = validated.tax_dollars
      ? dollarsToCents(validated.tax_dollars)
      : 0

    // Calculate total
    const totalCents = subtotalCents + taxCents

    // Calculate deposit (default 30% if not specified)
    const depositPercent = validated.deposit_percent ?? 30
    const depositCents = Math.round((totalCents * depositPercent) / 100)

    // Update booking with totals
    const { error: updateError } = await supabaseAdmin
      .from('booking_inquiries')
      .update({
        quote_subtotal_cents: subtotalCents,
        quote_tax_cents: taxCents,
        quote_total_cents: totalCents,
        quote_deposit_cents: depositCents,
        quote_currency: 'USD', // Default to USD for now
        admin_notes: validated.notes || null, // Store quote notes in admin_notes
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error updating booking quote totals:', updateError)
      return { success: false, error: updateError.message }
    }

    // Store quote items as JSON in booking_inquiries.quote_line_items
    // (booking_quote_items table doesn't exist yet)
    const itemsForStorage = validated.items.map((item, index) => ({
      title: item.title,
      description: item.description || null,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      line_total_cents: item.line_total_cents,
      sort_order: index,
    }))

    // Update booking with quote items as JSON
    const { error: itemsUpdateError } = await supabaseAdmin
      .from('booking_inquiries')
      .update({
        quote_line_items: JSON.stringify(itemsForStorage),
      })
      .eq('id', bookingId)

    if (itemsUpdateError) {
      console.error('Error saving quote items as JSON:', itemsUpdateError)
      return { success: false, error: itemsUpdateError.message }
    }

    // Return updated quote
    return await getQuote(bookingId)
  } catch (error: any) {
    console.error('Error in saveQuote:', error)
    if (error.name === 'ZodError') {
      return { success: false, error: 'Invalid quote data: ' + error.errors.map((e: any) => e.message).join(', ') }
    }
    return { success: false, error: error.message || 'Failed to save quote' }
  }
}

/**
 * Mark quote as sent (sets quote_sent_at and status='quoted')
 */
export async function markQuoteSent(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAuth()

  try {
    const { error } = await supabaseAdmin
      .from('booking_inquiries')
      .update({
        quote_sent_at: new Date().toISOString(),
        status: 'quoted',
      })
      .eq('id', bookingId)

    if (error) {
      console.error('Error marking quote as sent:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in markQuoteSent:', error)
    return { success: false, error: error.message || 'Failed to mark quote as sent' }
  }
}

/**
 * Create Stripe Checkout Session for deposit payment
 * Returns the checkout URL
 */
export async function createStripeDepositLink(
  bookingId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  await requireAuth()

  try {
    // Check if Stripe is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return {
        success: false,
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.',
      }
    }

    // Get booking to fetch deposit amount
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_inquiries')
      .select('quote_deposit_cents, name, email, quote_total_cents')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return { success: false, error: 'Booking not found' }
    }

    const depositCents = booking.quote_deposit_cents || 0
    if (depositCents <= 0) {
      return { success: false, error: 'Deposit amount must be greater than 0. Please save the quote first.' }
    }

    // Import Stripe dynamically (only if configured)
    const stripe = await import('stripe').then((m) => new m.default(stripeSecretKey))

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Deposit - ${booking.name || 'Booking'}`,
              description: `Deposit payment for booking #${bookingId.slice(0, 8)}`,
            },
            unit_amount: depositCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/bookings/${bookingId}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/bookings/${bookingId}?payment=cancelled`,
      customer_email: booking.email || undefined,
      metadata: {
        booking_id: bookingId,
        type: 'deposit',
      },
    })

    // Save session URL and ID to booking
    const { error: updateError } = await supabaseAdmin
      .from('booking_inquiries')
      .update({
        stripe_payment_link_url: session.url,
        stripe_invoice_id: session.id, // Store session ID
        stripe_payment_status: 'unpaid',
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error saving Stripe session to booking:', updateError)
      // Still return success with URL even if save fails
    }

    return { success: true, url: session.url || undefined }
  } catch (error: any) {
    console.error('Error creating Stripe deposit link:', error)
    return {
      success: false,
      error: error.message || 'Failed to create payment link. Please check your Stripe configuration.',
    }
  }
}
