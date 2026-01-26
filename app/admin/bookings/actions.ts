'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { BookingInquiry, BookingStatus, QuoteLineItem } from '@/types/booking'
import { quoteLineItemSchema, updateQuoteSummarySchema } from '@/lib/validation'
import { canManageBookings, canAssignFarmers } from '@/lib/authz'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { notifyClient } from '@/lib/notify'

/**
 * Fetch all booking inquiries for admin dashboard
 * Uses Prisma to read from booking_inquiries table
 * Phase 2B: Requires authentication
 * TODO: Phase 3 - Add role-based access control here
 */
export async function getAllBookings(): Promise<{ success: boolean; bookings?: BookingInquiry[]; error?: string }> {
  // Require authentication
  await requireAuth()
  
  // Phase 4: Check if user can manage bookings
  const userRole = await getCurrentUserRole()
  if (!canManageBookings(userRole)) {
    return { success: false, error: 'Access denied: Insufficient permissions' }
  }
  
  try {
    const bookings = await db.bookingInquiry.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Convert Prisma model to BookingInquiry type format
    const formattedBookings: BookingInquiry[] = bookings.map((booking) => ({
      id: booking.id,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt?.toISOString() || booking.createdAt.toISOString(),
      name: booking.name,
      email: booking.email || undefined,
      phone: booking.phone || undefined,
      event_date: booking.eventDate.toISOString().split('T')[0],
      event_time: booking.eventTime || undefined,
      location: booking.location,
      guests: booking.guests || undefined,
      budget_range: booking.budgetRange || undefined,
      dietary: booking.dietary || undefined,
      notes: booking.notes || undefined,
      status: booking.status as BookingStatus,
      follow_up_date: booking.followUpDate?.toISOString().split('T')[0] || undefined,
      admin_notes: booking.adminNotes || undefined,
      // Include all other fields that might be needed
      quote_currency: booking.quoteCurrency || undefined,
      quote_subtotal_cents: booking.quoteSubtotalCents || undefined,
      quote_tax_cents: booking.quoteTaxCents || undefined,
      quote_total_cents: booking.quoteTotalCents || undefined,
      quote_deposit_cents: booking.quoteDepositCents || undefined,
      quote_sent_at: booking.quoteSentAt?.toISOString() || undefined,
      stripe_payment_link_url: booking.stripePaymentLinkUrl || undefined,
      stripe_invoice_id: booking.stripeInvoiceId || undefined,
      stripe_payment_status: booking.stripePaymentStatus as any,
      quote_pdf_url: booking.quotePdfUrl || undefined,
      stripe_session_id: booking.stripeSessionId || undefined,
      stripe_payment_intent_id: booking.stripePaymentIntentId || undefined,
      deposit_amount_cents: booking.depositAmountCents || undefined,
      paid_at: booking.paidAt?.toISOString() || undefined,
      quote_status: booking.quoteStatus as any,
      quote_notes: booking.quoteNotes || undefined,
      deposit_percent: booking.depositPercent || undefined,
      subtotal_cents: booking.subtotalCents || undefined,
      tax_cents: booking.taxCents || undefined,
      service_fee_cents: booking.serviceFeeCents || undefined,
      total_cents: booking.totalCents || undefined,
      balance_session_id: booking.balanceSessionId || undefined,
      balance_payment_intent_id: booking.balancePaymentIntentId || undefined,
      balance_paid_at: booking.balancePaidAt?.toISOString() || undefined,
      balance_amount_cents: booking.balanceAmountCents || undefined,
      fully_paid_at: booking.fullyPaidAt?.toISOString() || undefined,
      quote_updated_at: booking.quoteUpdatedAt?.toISOString() || undefined,
      quote_service_fee_cents: booking.quoteServiceFeeCents || undefined,
      deposit_percentage: booking.depositPercentage || undefined,
      // Safely parse quote_line_items from JSON field
      quote_line_items: (() => {
        try {
          if (booking.quoteLineItems) {
            if (typeof booking.quoteLineItems === 'string') {
              return JSON.parse(booking.quoteLineItems)
            }
            return booking.quoteLineItems
          }
          return []
        } catch {
          return []
        }
      })(),
      customer_portal_token: booking.customerPortalToken || undefined,
      customer_portal_token_created_at: booking.customerPortalTokenCreatedAt?.toISOString() || undefined,
      customer_portal_token_revoked_at: booking.customerPortalTokenRevokedAt?.toISOString() || undefined,
      assigned_chef_id: booking.assignedChefId || undefined,
      chef_payout_amount_cents: booking.chefPayoutAmountCents || undefined,
      chef_payout_status: booking.chefPayoutStatus as any,
      chef_payout_blockers: booking.chefPayoutBlockers || undefined,
      chef_payout_paid_at: booking.chefPayoutPaidAt?.toISOString() || undefined,
      stripe_transfer_id: booking.stripeTransferId || undefined,
      job_completed_at: booking.jobCompletedAt?.toISOString() || undefined,
      job_completed_by: booking.jobCompletedBy as any,
      payout_hold: booking.payoutHold || undefined,
      payout_hold_reason: booking.payoutHoldReason || undefined,
      payout_released_at: booking.payoutReleasedAt?.toISOString() || undefined,
    }))

    return { success: true, bookings: formattedBookings }
  } catch (error: any) {
    console.error('Error in getAllBookings:', error)
    return { success: false, error: error.message || 'Failed to fetch bookings' }
  }
}

/**
 * Fetch a single booking by ID
 * Uses Prisma to read from booking_inquiries table
 * Phase 2B: Requires authentication
 * TODO: Phase 3 - Add role-based access control here
 */
export async function getBookingById(id: string): Promise<{ success: boolean; booking?: BookingInquiry; error?: string }> {
  // Require authentication
  await requireAuth()
  try {
    const booking = await db.bookingInquiry.findUnique({
      where: { id },
    })

    if (!booking) {
      return { success: false, error: 'Booking not found' }
    }

    // Convert Prisma model to BookingInquiry type format
    const formattedBooking: BookingInquiry = {
      id: booking.id,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt?.toISOString() || booking.createdAt.toISOString(),
      name: booking.name,
      email: booking.email || undefined,
      phone: booking.phone || undefined,
      event_date: booking.eventDate.toISOString().split('T')[0],
      event_time: booking.eventTime || undefined,
      location: booking.location,
      guests: booking.guests || undefined,
      budget_range: booking.budgetRange || undefined,
      dietary: booking.dietary || undefined,
      notes: booking.notes || undefined,
      status: booking.status as BookingStatus,
      follow_up_date: booking.followUpDate?.toISOString().split('T')[0] || undefined,
      admin_notes: booking.adminNotes || undefined,
      // Include all other fields
      quote_currency: booking.quoteCurrency || undefined,
      quote_subtotal_cents: booking.quoteSubtotalCents || undefined,
      quote_tax_cents: booking.quoteTaxCents || undefined,
      quote_total_cents: booking.quoteTotalCents || undefined,
      quote_deposit_cents: booking.quoteDepositCents || undefined,
      quote_sent_at: booking.quoteSentAt?.toISOString() || undefined,
      stripe_payment_link_url: booking.stripePaymentLinkUrl || undefined,
      stripe_invoice_id: booking.stripeInvoiceId || undefined,
      stripe_payment_status: booking.stripePaymentStatus as any,
      quote_pdf_url: booking.quotePdfUrl || undefined,
      stripe_session_id: booking.stripeSessionId || undefined,
      stripe_payment_intent_id: booking.stripePaymentIntentId || undefined,
      deposit_amount_cents: booking.depositAmountCents || undefined,
      paid_at: booking.paidAt?.toISOString() || undefined,
      quote_status: booking.quoteStatus as any,
      quote_notes: booking.quoteNotes || undefined,
      deposit_percent: booking.depositPercent || undefined,
      subtotal_cents: booking.subtotalCents || undefined,
      tax_cents: booking.taxCents || undefined,
      service_fee_cents: booking.serviceFeeCents || undefined,
      total_cents: booking.totalCents || undefined,
      balance_session_id: booking.balanceSessionId || undefined,
      balance_payment_intent_id: booking.balancePaymentIntentId || undefined,
      balance_paid_at: booking.balancePaidAt?.toISOString() || undefined,
      balance_amount_cents: booking.balanceAmountCents || undefined,
      fully_paid_at: booking.fullyPaidAt?.toISOString() || undefined,
      quote_updated_at: booking.quoteUpdatedAt?.toISOString() || undefined,
      quote_service_fee_cents: booking.quoteServiceFeeCents || undefined,
      deposit_percentage: booking.depositPercentage || undefined,
      // Safely parse quote_line_items from JSON field
      quote_line_items: (() => {
        try {
          if (booking.quoteLineItems) {
            if (typeof booking.quoteLineItems === 'string') {
              return JSON.parse(booking.quoteLineItems)
            }
            return booking.quoteLineItems
          }
          return []
        } catch {
          return []
        }
      })(),
      customer_portal_token: booking.customerPortalToken || undefined,
      customer_portal_token_created_at: booking.customerPortalTokenCreatedAt?.toISOString() || undefined,
      customer_portal_token_revoked_at: booking.customerPortalTokenRevokedAt?.toISOString() || undefined,
      assigned_chef_id: booking.assignedChefId || undefined,
      chef_payout_amount_cents: booking.chefPayoutAmountCents || undefined,
      chef_payout_status: booking.chefPayoutStatus as any,
      chef_payout_blockers: booking.chefPayoutBlockers || undefined,
      chef_payout_paid_at: booking.chefPayoutPaidAt?.toISOString() || undefined,
      stripe_transfer_id: booking.stripeTransferId || undefined,
      job_completed_at: booking.jobCompletedAt?.toISOString() || undefined,
      job_completed_by: booking.jobCompletedBy as any,
      payout_hold: booking.payoutHold || undefined,
      payout_hold_reason: booking.payoutHoldReason || undefined,
      payout_released_at: booking.payoutReleasedAt?.toISOString() || undefined,
    }

    return { success: true, booking: formattedBooking }
  } catch (error: any) {
    console.error('Error in getBookingById:', error)
    return { success: false, error: error.message || 'Failed to fetch booking' }
  }
}

/**
 * Update booking status and admin notes
 * Server-side only - uses Prisma
 * Phase 2B: Requires authentication
 * Phase 1.5: Sends status emails when status changes to BOOKED or DECLINED
 */
export async function updateBooking(
  id: string,
  updates: {
    status?: BookingStatus
    admin_notes?: string
  }
): Promise<{ success: boolean; booking?: BookingInquiry; error?: string }> {
  // Require authentication
  await requireAuth()
  
  // Phase 4: Check if user can manage bookings
  const userRole = await getCurrentUserRole()
  if (!canManageBookings(userRole)) {
    return { success: false, error: 'Access denied: Insufficient permissions' }
  }

  try {
    // Get current booking to check if status is changing
    const currentBooking = await db.bookingInquiry.findUnique({
      where: { id },
    })

    if (!currentBooking) {
      return { success: false, error: 'Booking not found' }
    }

    const updateData: any = {}

    if (updates.status !== undefined) {
      updateData.status = updates.status
      updateData.statusUpdatedAt = new Date()
    }

    if (updates.admin_notes !== undefined) {
      updateData.adminNotes = updates.admin_notes
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: 'No updates provided' }
    }

    // Update booking using Prisma
    const updatedBooking = await db.bookingInquiry.update({
      where: { id },
      data: updateData,
    })

    // Phase 1.5 & 2.5: Send status emails and SMS if status changed to BOOKED or DECLINED
    if (updates.status && updates.status !== currentBooking.status) {
      const { sendBookingApprovedEmail, sendBookingDeclinedEmail } = await import('@/lib/email')
      const { sendSMS } = await import('@/lib/twilio')
      const { bookingApprovedSMS, bookingDeclinedSMS } = await import('@/lib/sms-templates')
      
      if (updates.status === 'Confirmed') {
        // Send email (if email provided)
        if (currentBooking.email) {
          sendBookingApprovedEmail(
            currentBooking.email,
            currentBooking.name,
            currentBooking.eventDate.toISOString().split('T')[0]
          ).catch((emailError) => {
            console.error('Error sending booking approved email (non-blocking):', emailError)
          })
        }

        // Phase 2.5: Send SMS (if phone provided)
        if (currentBooking.phone) {
          const eventDateFormatted = new Date(currentBooking.eventDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
          sendSMS({
            to: currentBooking.phone,
            body: bookingApprovedSMS(currentBooking.name, eventDateFormatted),
          }).catch((smsError) => {
            console.error('Error sending booking approved SMS (non-blocking):', smsError)
          })
        }

        // Phase 2A: Auto-generate timeline when booking is approved
        // Only create timeline if model exists (migration has been run)
        if ('bookingTimeline' in db) {
          try {
            // Check if timeline already exists to prevent duplicates
            const existingTimeline = await db.bookingTimeline.findFirst({
              where: { bookingId: id },
            })

            if (!existingTimeline) {
              await db.bookingTimeline.createMany({
                data: [
                  { bookingId: id, title: 'Booking Confirmed', order: 1 },
                  { bookingId: id, title: 'Client Follow-Up Call', order: 2 },
                  { bookingId: id, title: 'Menu / Service Plan', order: 3 },
                  { bookingId: id, title: 'Supplier Check', order: 4 },
                  { bookingId: id, title: 'Event Prep', order: 5 },
                  { bookingId: id, title: 'Event Day', order: 6 },
                  { bookingId: id, title: 'Post-Event Follow-Up', order: 7 },
                ],
              })
              console.log('✅ Auto-generated booking timeline for booking:', id)
            }
          } catch (timelineError: any) {
            // If timeline creation fails (e.g., table doesn't exist), just log and continue
            console.warn('Could not create timeline (migration may not be run yet):', timelineError.message)
          }
        }

        // Phase 3.5: Auto-generate prep checklist when booking is approved
        // Only create prep items if model exists (migration has been run)
        if ('bookingPrepItem' in db) {
          try {
            // Check if prep checklist already exists to prevent duplicates
            const existingPrep = await db.bookingPrepItem.findFirst({
              where: { bookingId: id },
            })

            if (!existingPrep) {
              await db.bookingPrepItem.createMany({
                data: [
                  { bookingId: id, title: 'Confirm guest count', order: 1 },
                  { bookingId: id, title: 'Confirm event location', order: 2 },
                  { bookingId: id, title: 'Finalize menu / service scope', order: 3 },
                  { bookingId: id, title: 'Assign lead chef', order: 4 },
                  { bookingId: id, title: 'Assign support staff', order: 5 },
                  { bookingId: id, title: 'Confirm suppliers / farmers', order: 6 },
                  { bookingId: id, title: 'Equipment & transport check', order: 7 },
                  { bookingId: id, title: 'Final client confirmation', order: 8 },
                  { bookingId: id, title: 'Day-before readiness check', order: 9 },
                  { bookingId: id, title: 'Event-day execution', order: 10 },
                ],
              })
              console.log('✅ Auto-generated prep checklist for booking:', id)
            }
          } catch (prepError: any) {
            // If prep creation fails (e.g., table doesn't exist), just log and continue
            console.warn('Could not create prep checklist (migration may not be run yet):', prepError.message)
          }
        }
      } else if (updates.status === 'declined') {
        // Send email (if email provided)
        if (currentBooking.email) {
          sendBookingDeclinedEmail(
            currentBooking.email,
            currentBooking.name
          ).catch((emailError) => {
            console.error('Error sending booking declined email (non-blocking):', emailError)
          })
        }

        // Phase 2.5 & 3: Send message via preferred channel (WhatsApp or SMS)
        if (currentBooking.phone) {
          // Check if customer prefers WhatsApp
          const prefersWhatsApp = currentBooking.whatsapp === currentBooking.phone || 
                                   currentBooking.preferredContact === 'whatsapp'
          
          const { bookingDeclinedWA } = await import('@/lib/whatsapp-templates')
          const message = prefersWhatsApp
            ? bookingDeclinedWA(currentBooking.name)
            : bookingDeclinedSMS(currentBooking.name)
          
          notifyClient({
            phone: currentBooking.phone,
            prefersWhatsApp,
            message,
          }).catch((messageError) => {
            console.error('Error sending booking declined message (non-blocking):', messageError)
          })
        }
      }
    }

    // Convert Prisma model to BookingInquiry type format
    const formattedBooking: BookingInquiry = {
      id: updatedBooking.id,
      createdAt: updatedBooking.createdAt.toISOString(),
      updatedAt: updatedBooking.updatedAt?.toISOString() || updatedBooking.createdAt.toISOString(),
      name: updatedBooking.name,
      email: updatedBooking.email || undefined,
      phone: updatedBooking.phone || undefined,
      event_date: updatedBooking.eventDate.toISOString().split('T')[0],
      event_time: updatedBooking.eventTime || undefined,
      location: updatedBooking.location,
      guests: updatedBooking.guests || undefined,
      budget_range: updatedBooking.budgetRange || undefined,
      dietary: updatedBooking.dietary || undefined,
      notes: updatedBooking.notes || undefined,
      status: updatedBooking.status as BookingStatus,
      follow_up_date: updatedBooking.followUpDate?.toISOString().split('T')[0] || undefined,
      admin_notes: updatedBooking.adminNotes || undefined,
      // Include all other fields (abbreviated for brevity)
      quote_currency: updatedBooking.quoteCurrency || undefined,
      quote_subtotal_cents: updatedBooking.quoteSubtotalCents || undefined,
      quote_tax_cents: updatedBooking.quoteTaxCents || undefined,
      quote_total_cents: updatedBooking.quoteTotalCents || undefined,
      quote_deposit_cents: updatedBooking.quoteDepositCents || undefined,
      quote_sent_at: updatedBooking.quoteSentAt?.toISOString() || undefined,
      stripe_payment_link_url: updatedBooking.stripePaymentLinkUrl || undefined,
      stripe_invoice_id: updatedBooking.stripeInvoiceId || undefined,
      stripe_payment_status: updatedBooking.stripePaymentStatus as any,
      quote_pdf_url: updatedBooking.quotePdfUrl || undefined,
      stripe_session_id: updatedBooking.stripeSessionId || undefined,
      stripe_payment_intent_id: updatedBooking.stripePaymentIntentId || undefined,
      deposit_amount_cents: updatedBooking.depositAmountCents || undefined,
      paid_at: updatedBooking.paidAt?.toISOString() || undefined,
      quote_status: updatedBooking.quoteStatus as any,
      quote_notes: updatedBooking.quoteNotes || undefined,
      deposit_percent: updatedBooking.depositPercent || undefined,
      subtotal_cents: updatedBooking.subtotalCents || undefined,
      tax_cents: updatedBooking.taxCents || undefined,
      service_fee_cents: updatedBooking.serviceFeeCents || undefined,
      total_cents: updatedBooking.totalCents || undefined,
      balance_session_id: updatedBooking.balanceSessionId || undefined,
      balance_payment_intent_id: updatedBooking.balancePaymentIntentId || undefined,
      balance_paid_at: updatedBooking.balancePaidAt?.toISOString() || undefined,
      balance_amount_cents: updatedBooking.balanceAmountCents || undefined,
      fully_paid_at: updatedBooking.fullyPaidAt?.toISOString() || undefined,
      quote_updated_at: updatedBooking.quoteUpdatedAt?.toISOString() || undefined,
      quote_service_fee_cents: updatedBooking.quoteServiceFeeCents || undefined,
      deposit_percentage: updatedBooking.depositPercentage || undefined,
      quote_line_items: (() => {
        try {
          if (updatedBooking.quoteLineItems) {
            if (typeof updatedBooking.quoteLineItems === 'string') {
              return JSON.parse(updatedBooking.quoteLineItems)
            }
            return updatedBooking.quoteLineItems
          }
          return []
        } catch {
          return []
        }
      })(),
      customer_portal_token: updatedBooking.customerPortalToken || undefined,
      customer_portal_token_created_at: updatedBooking.customerPortalTokenCreatedAt?.toISOString() || undefined,
      customer_portal_token_revoked_at: updatedBooking.customerPortalTokenRevokedAt?.toISOString() || undefined,
      assigned_chef_id: updatedBooking.assignedChefId || undefined,
      chef_payout_amount_cents: updatedBooking.chefPayoutAmountCents || undefined,
      chef_payout_status: updatedBooking.chefPayoutStatus as any,
      chef_payout_blockers: updatedBooking.chefPayoutBlockers || undefined,
      chef_payout_paid_at: updatedBooking.chefPayoutPaidAt?.toISOString() || undefined,
      stripe_transfer_id: updatedBooking.stripeTransferId || undefined,
      job_completed_at: updatedBooking.jobCompletedAt?.toISOString() || undefined,
      job_completed_by: updatedBooking.jobCompletedBy as any,
      payout_hold: updatedBooking.payoutHold || undefined,
      payout_hold_reason: updatedBooking.payoutHoldReason || undefined,
      payout_released_at: updatedBooking.payoutReleasedAt?.toISOString() || undefined,
    }

    return { success: true, booking: formattedBooking }
  } catch (error: any) {
    console.error('Error in updateBooking:', error)
    return { success: false, error: error.message || 'Failed to update booking' }
  }
}

/**
 * Phase 3B: Get quote line items for a booking
 * DISABLED: quote_line_items table doesn't exist yet
 * Using JSON field from booking_inquiries instead
 */
export async function getQuoteLineItems(
  bookingId: string
): Promise<{ success: boolean; items?: QuoteLineItem[]; error?: string }> {
  await requireAuth()

  try {
    // Read from JSON field in booking_inquiries instead of separate table
    const bookingResult = await getBookingById(bookingId)
    if (!bookingResult.success || !bookingResult.booking) {
      return { success: false, error: bookingResult.error || 'Booking not found' }
    }

    // Extract quote_line_items from booking JSON field
    const items = bookingResult.booking.quote_line_items || []
    return { success: true, items: Array.isArray(items) ? items : [] }
  } catch (error: any) {
    console.error('Error in getQuoteLineItems:', error)
    return { success: false, error: error.message || 'Failed to fetch quote line items' }
  }
}

/**
 * Phase 3B: Upsert quote line items (delete all + insert new)
 * DISABLED: quote_line_items table doesn't exist yet
 * Using updateBookingQuote instead which stores items as JSON
 */
export async function upsertQuoteLineItems(
  bookingId: string,
  items: QuoteLineItem[]
): Promise<{ success: boolean; error?: string }> {
  await requireAuth()

  try {
    // Validate all items
    for (const item of items) {
      quoteLineItemSchema.parse({ ...item, booking_id: bookingId })
    }

    // Use updateBookingQuote to store items as JSON in booking_inquiries
    // This is a temporary solution until quote_line_items table is created
    const bookingResult = await getBookingById(bookingId)
    if (!bookingResult.success || !bookingResult.booking) {
      return { success: false, error: 'Booking not found' }
    }

    // Calculate totals from items
    const subtotal = items.reduce((sum, item) => sum + (item.unit_price_cents * item.quantity), 0)
    const tax = 0 // Will be set by quote builder
    const serviceFee = 0 // Will be set by quote builder
    const total = subtotal + tax + serviceFee

    // Use updateBookingQuote which stores items as JSON
    const quoteResult = await updateBookingQuote(bookingId, {
      quote_line_items: items,
      quote_notes: null,
      quote_tax_cents: tax,
      quote_service_fee_cents: serviceFee,
      quote_subtotal_cents: subtotal,
      quote_total_cents: total,
      deposit_percentage: 30, // Default
    })

    if (!quoteResult.success) {
      return { success: false, error: quoteResult.error || 'Failed to save quote line items' }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in upsertQuoteLineItems:', error)
    if (error.name === 'ZodError') {
      return { success: false, error: 'Invalid quote line item data: ' + error.errors.map((e: any) => e.message).join(', ') }
    }
    return { success: false, error: error.message || 'Failed to save quote line items' }
  }
}

/**
 * Phase 3B: Update quote summary fields
 */
export async function updateQuoteSummary(
  bookingId: string,
  payload: {
    quote_notes?: string | null
    deposit_percent: number
    tax_cents: number
    service_fee_cents: number
    subtotal_cents: number
    total_cents: number
    balance_amount_cents: number
    quote_status: 'draft' | 'sent' | 'accepted' | 'declined'
  }
): Promise<{ success: boolean; booking?: BookingInquiry; error?: string }> {
  await requireAuth()

  try {
    // Validate input
    updateQuoteSummarySchema.parse(payload)

    // Phase 5C: Check if chef is assigned and recalculate payout
    const { data: bookingChef } = await supabaseAdmin
      .from('booking_chefs')
      .select('id, payout_percentage')
      .eq('booking_id', bookingId)
      .single()

    // Phase 6A: Check if farmers are assigned and recalculate payouts
    const { data: bookingFarmers } = await supabaseAdmin
      .from('booking_farmers')
      .select('id, payout_percent')
      .eq('booking_id', bookingId)

    const updateData: any = {
      quote_notes: payload.quote_notes || null,
      deposit_percent: payload.deposit_percent,
      tax_cents: payload.tax_cents,
      service_fee_cents: payload.service_fee_cents,
      subtotal_cents: payload.subtotal_cents,
      total_cents: payload.total_cents,
      balance_amount_cents: payload.balance_amount_cents,
      quote_status: payload.quote_status,
      quote_updated_at: new Date().toISOString(),
    }

    // Phase 5C: Auto-calculate chef payout if assigned
    if (bookingChef) {
      const chefPayoutCents = Math.round(payload.total_cents * (bookingChef.payout_percentage / 100))
      updateData.chef_payout_amount_cents = chefPayoutCents

      // Update booking_chefs table
      await supabaseAdmin
        .from('booking_chefs')
        .update({
          payout_amount_cents: chefPayoutCents,
        })
        .eq('id', bookingChef.id)
    }

    // Phase 6A: Auto-calculate farmer payouts if assigned
    if (bookingFarmers && bookingFarmers.length > 0) {
      for (const bf of bookingFarmers) {
        const farmerPayoutCents = Math.round(payload.total_cents * (bf.payout_percent / 100))
        await supabaseAdmin
          .from('booking_farmers')
          .update({
            payout_amount_cents: farmerPayoutCents,
          })
          .eq('id', bf.id)
      }
    }

    const { data, error } = await supabaseAdmin
      .from('booking_inquiries')
      .update(updateData)
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      console.error('Error updating quote summary:', error)
      return { success: false, error: error.message || 'Failed to update quote summary' }
    }

    return { success: true, booking: data as BookingInquiry }
  } catch (error: any) {
    console.error('Error in updateQuoteSummary:', error)
    if (error.name === 'ZodError') {
      return { success: false, error: 'Invalid quote summary data: ' + error.errors.map((e: any) => e.message).join(', ') }
    }
    return { success: false, error: error.message || 'Failed to update quote summary' }
  }
}

/**
 * Phase 3B: Get booking with quote line items
 */
export async function getBookingWithQuote(
  bookingId: string
): Promise<{ success: boolean; booking?: BookingInquiry; items?: QuoteLineItem[]; error?: string }> {
  await requireAuth()

  try {
    // Fetch booking
    const bookingResult = await getBookingById(bookingId)
    if (!bookingResult.success || !bookingResult.booking) {
      return { success: false, error: bookingResult.error || 'Booking not found' }
    }

    // Fetch line items (gracefully handle errors - don't fail the whole page)
    let items: QuoteLineItem[] = []
    try {
      const itemsResult = await getQuoteLineItems(bookingId)
      if (itemsResult.success && itemsResult.items) {
        items = itemsResult.items
      }
    } catch (error) {
      // Non-blocking: quote items are optional
      console.warn('Could not fetch quote line items (non-blocking):', error)
    }

    return {
      success: true,
      booking: bookingResult.booking,
      items,
    }
  } catch (error: any) {
    console.error('Error in getBookingWithQuote:', error)
    return { success: false, error: error.message || 'Failed to fetch booking with quote' }
  }
}

/**
 * Phase 3C: Update booking quote with line items and totals
 * Stores line items as JSONB and calculates deposit/balance amounts
 */
export async function updateBookingQuote(
  id: string,
  payload: {
    quote_line_items: QuoteLineItem[]
    quote_notes?: string | null
    quote_tax_cents: number
    quote_service_fee_cents: number
    quote_subtotal_cents: number
    quote_total_cents: number
    deposit_percentage: number
  }
): Promise<{ success: boolean; booking?: BookingInquiry; error?: string }> {
  await requireAuth()

  try {
    // Validate input
    if (!payload.quote_line_items || payload.quote_line_items.length === 0) {
      return { success: false, error: 'At least one line item is required' }
    }

    if (payload.quote_total_cents < 0) {
      return { success: false, error: 'Total cannot be negative' }
    }

    if (payload.deposit_percentage < 0 || payload.deposit_percentage > 100) {
      return { success: false, error: 'Deposit percentage must be between 0 and 100' }
    }

    // Calculate deposit and balance amounts
    const depositAmountCents = Math.round((payload.quote_total_cents * payload.deposit_percentage) / 100)
    const balanceAmountCents = Math.max(payload.quote_total_cents - depositAmountCents, 0)

    // Prepare line items for JSONB storage (remove booking_id from each item for storage)
    const lineItemsForStorage = payload.quote_line_items.map((item, index) => ({
      title: item.title,
      description: item.description || null,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      sort_order: index,
    }))

    // Phase 5C: Check if chef is assigned and recalculate payout
    const { data: bookingChef } = await supabaseAdmin
      .from('booking_chefs')
      .select('id, payout_percentage')
      .eq('booking_id', id)
      .single()

    // Phase 6A: Check if farmers are assigned and recalculate payouts
    const { data: bookingFarmers } = await supabaseAdmin
      .from('booking_farmers')
      .select('id, payout_percent')
      .eq('booking_id', id)

    // Update booking with quote data
    const updateData: any = {
      quote_line_items: JSON.stringify(lineItemsForStorage),
      quote_notes: payload.quote_notes || null,
      quote_tax_cents: payload.quote_tax_cents,
      quote_service_fee_cents: payload.quote_service_fee_cents,
      quote_subtotal_cents: payload.quote_subtotal_cents,
      quote_total_cents: payload.quote_total_cents,
      deposit_percentage: payload.deposit_percentage,
      deposit_amount_cents: depositAmountCents,
      balance_amount_cents: balanceAmountCents,
    }

    // Phase 5C: Auto-calculate chef payout if assigned
    if (bookingChef) {
      const chefPayoutCents = Math.round(payload.quote_total_cents * (bookingChef.payout_percentage / 100))
      updateData.chef_payout_amount_cents = chefPayoutCents

      // Update booking_chefs table
      await supabaseAdmin
        .from('booking_chefs')
        .update({
          payout_amount_cents: chefPayoutCents,
        })
        .eq('id', bookingChef.id)
    }

    // Phase 6A: Auto-calculate farmer payouts if assigned
    if (bookingFarmers && bookingFarmers.length > 0) {
      for (const bf of bookingFarmers) {
        const farmerPayoutCents = Math.round(payload.quote_total_cents * (bf.payout_percent / 100))
        await supabaseAdmin
          .from('booking_farmers')
          .update({
            payout_amount_cents: farmerPayoutCents,
          })
          .eq('id', bf.id)
      }
    }

    const { data, error } = await supabaseAdmin
      .from('booking_inquiries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating booking quote:', error)
      return { success: false, error: error.message || 'Failed to update booking quote' }
    }

    // Parse quote_line_items from JSONB for response
    const booking = data as any
    if (booking.quote_line_items && typeof booking.quote_line_items === 'string') {
      try {
        booking.quote_line_items = JSON.parse(booking.quote_line_items)
      } catch (e) {
        booking.quote_line_items = []
      }
    }

    return { success: true, booking: booking as BookingInquiry }
  } catch (error: any) {
    console.error('Error in updateBookingQuote:', error)
    return { success: false, error: error.message || 'Failed to update booking quote' }
  }
}

/**
 * Phase 2A: Get timeline milestones for a booking
 */
export async function getBookingTimeline(
  bookingId: string
): Promise<{ success: boolean; timeline?: Array<{ id: string; title: string; order: number; completed: boolean; completedAt: string | null; createdAt: string }>; error?: string }> {
  await requireAuth()

  try {
    // Check if BookingTimeline model exists in Prisma client
    // If migration hasn't been run yet, return empty timeline gracefully
    if (!('bookingTimeline' in db)) {
      console.warn('BookingTimeline model not found in Prisma client. Run: npx prisma generate')
      return { success: true, timeline: [] }
    }

    const timeline = await db.bookingTimeline.findMany({
      where: { bookingId },
      orderBy: { order: 'asc' },
    })

    return {
      success: true,
      timeline: timeline.map((item) => ({
        id: item.id,
        title: item.title,
        order: item.order,
        completed: item.completed,
        completedAt: item.completedAt?.toISOString() || null,
        createdAt: item.createdAt.toISOString(),
      })),
    }
  } catch (error: any) {
    // If error is about missing table/model, return empty timeline
    if (error.message?.includes('bookingTimeline') || error.message?.includes('booking_timeline')) {
      console.warn('BookingTimeline table not found. Run migration: npx prisma migrate dev')
      return { success: true, timeline: [] }
    }
    console.error('Error in getBookingTimeline:', error)
    return { success: false, error: error.message || 'Failed to fetch timeline' }
  }
}

/**
 * Phase 2A: Toggle timeline milestone completion
 * Phase 2.5: Optionally sends SMS when milestone is marked complete
 */
export async function toggleTimelineMilestone(
  milestoneId: string,
  completed: boolean,
  sendSMSNotification: boolean = false
): Promise<{ success: boolean; error?: string }> {
  await requireAuth()

  try {
    // Check if BookingTimeline model exists in Prisma client
    if (!('bookingTimeline' in db)) {
      return { success: false, error: 'Timeline feature not available. Run: npx prisma generate' }
    }

    const milestone = await db.bookingTimeline.update({
      where: { id: milestoneId },
      data: {
        completed,
        completedAt: completed ? new Date() : null,
      },
      include: {
        booking: true,
      },
    })

    // Phase 2.5 & 3: Send notification if milestone is completed and notification is requested
    // This is admin-triggered only (sendSMSNotification flag)
    // Uses preferred channel (WhatsApp or SMS)
    if (completed && sendSMSNotification && milestone.booking.phone) {
      const { timelineStepCompletedSMS } = await import('@/lib/sms-templates')
      const { timelineUpdateWA } = await import('@/lib/whatsapp-templates')
      
      // Check if customer prefers WhatsApp
      const prefersWhatsApp = milestone.booking.whatsapp === milestone.booking.phone || 
                               milestone.booking.preferredContact === 'whatsapp'
      
      const message = prefersWhatsApp
        ? timelineUpdateWA(milestone.booking.name, milestone.title)
        : timelineStepCompletedSMS(milestone.booking.name, milestone.title)
      
      notifyClient({
        phone: milestone.booking.phone,
        prefersWhatsApp,
        message,
      }).catch((messageError) => {
        console.error('Error sending timeline milestone notification (non-blocking):', messageError)
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in toggleTimelineMilestone:', error)
    return { success: false, error: error.message || 'Failed to update milestone' }
  }
}

/**
 * Phase 3.5: Get prep checklist items for a booking
 */
export async function getBookingPrepItems(
  bookingId: string
): Promise<{ success: boolean; prepItems?: Array<{ id: string; title: string; order: number; completed: boolean; completedAt: string | null; notes: string | null; createdAt: string }>; error?: string }> {
  await requireAuth()

  try {
    // Check if BookingPrepItem model exists in Prisma client
    if (!('bookingPrepItem' in db)) {
      console.warn('BookingPrepItem model not found in Prisma client. Run: npx prisma generate')
      return { success: true, prepItems: [] }
    }

    const prepItems = await db.bookingPrepItem.findMany({
      where: { bookingId },
      orderBy: { order: 'asc' },
    })

    return {
      success: true,
      prepItems: prepItems.map((item) => ({
        id: item.id,
        title: item.title,
        order: item.order,
        completed: item.completed,
        completedAt: item.completedAt?.toISOString() || null,
        notes: item.notes || null,
        createdAt: item.createdAt.toISOString(),
      })),
    }
  } catch (error: any) {
    // If error is about missing table/model, return empty prep items
    if (error.message?.includes('bookingPrepItem') || error.message?.includes('booking_prep_items')) {
      console.warn('BookingPrepItem table not found. Run migration: npx prisma migrate dev')
      return { success: true, prepItems: [] }
    }
    console.error('Error in getBookingPrepItems:', error)
    return { success: false, error: error.message || 'Failed to fetch prep items' }
  }
}

/**
 * Phase 3.5: Update prep checklist item (toggle completion and/or update notes)
 */
export async function updatePrepItem(
  prepItemId: string,
  updates: {
    completed?: boolean
    notes?: string | null
  }
): Promise<{ success: boolean; error?: string }> {
  await requireAuth()

  try {
    // Check if BookingPrepItem model exists in Prisma client
    if (!('bookingPrepItem' in db)) {
      return { success: false, error: 'Prep feature not available. Run: npx prisma generate' }
    }

    const updateData: any = {}
    
    if (updates.completed !== undefined) {
      updateData.completed = updates.completed
      updateData.completedAt = updates.completed ? new Date() : null
    }

    if (updates.notes !== undefined) {
      updateData.notes = updates.notes
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: 'No updates provided' }
    }

    await db.bookingPrepItem.update({
      where: { id: prepItemId },
      data: updateData,
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error in updatePrepItem:', error)
    return { success: false, error: error.message || 'Failed to update prep item' }
  }
}

/**
 * Phase 4: Get assigned farmers for a booking
 */
export async function getBookingFarmers(
  bookingId: string
): Promise<{ success: boolean; farmers?: Array<{ id: string; farmerId: string; farmerName: string; farmerPhone: string; role: string | null; notes: string | null; createdAt: string }>; error?: string }> {
  await requireAuth()

  try {
    // Check if BookingFarmer model exists in Prisma client
    // Prisma uses camelCase: BookingFarmer -> bookingFarmer
    if (!('bookingFarmer' in db)) {
      console.warn('BookingFarmer model not found in Prisma client. Run: npx prisma generate')
      return { success: true, farmers: [] }
    }

    const assignments = await (db as any).bookingFarmer.findMany({
      where: { bookingId },
      include: {
        farmer: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return {
      success: true,
      farmers: assignments.map((assignment) => ({
        id: assignment.id,
        farmerId: assignment.farmerId,
        farmerName: assignment.farmer.name,
        farmerPhone: assignment.farmer.phone,
        role: assignment.role || null,
        notes: assignment.notes || null,
        createdAt: assignment.createdAt.toISOString(),
      })),
    }
  } catch (error: any) {
    // If error is about missing table/model, return empty farmers
    if (error.message?.includes('bookingFarmer') || error.message?.includes('booking_farmers')) {
      console.warn('BookingFarmer table not found. Run migration: npx prisma migrate dev')
      return { success: true, farmers: [] }
    }
    console.error('Error in getBookingFarmers:', error)
    return { success: false, error: error.message || 'Failed to fetch assigned farmers' }
  }
}

/**
 * Phase 4: Assign a farmer to a booking
 */
export async function assignFarmerToBooking(
  bookingId: string,
  farmerId: string,
  role?: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  await requireAuth()

  try {
    // Check if BookingFarmer model exists in Prisma client
    if (!('bookingFarmer' in db)) {
      return { success: false, error: 'Farmer assignment feature not available. Run: npx prisma generate' }
    }

    // Check if farmer exists
    const farmer = await db.farmer.findUnique({
      where: { id: farmerId },
    })

    if (!farmer) {
      return { success: false, error: 'Farmer not found' }
    }

    // Check if already assigned (unique constraint)
    const existing = await db.bookingFarmer.findUnique({
      where: {
        bookingId_farmerId: {
          bookingId,
          farmerId,
        },
      },
    })

    if (existing) {
      return { success: false, error: 'Farmer is already assigned to this booking' }
    }

    // Create assignment
    await db.bookingFarmer.create({
      data: {
        bookingId,
        farmerId,
        role: role || null,
        notes: notes || null,
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error in assignFarmerToBooking:', error)
    return { success: false, error: error.message || 'Failed to assign farmer' }
  }
}

/**
 * Phase 4: Remove farmer assignment from booking
 */
export async function removeFarmerFromBooking(
  assignmentId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAuth()

  try {
    // Check if BookingFarmer model exists in Prisma client
    // Prisma uses camelCase: BookingFarmer -> bookingFarmer
    if (!('bookingFarmer' in db)) {
      return { success: false, error: 'Farmer assignment feature not available. Run: npx prisma generate' }
    }

    await (db as any).bookingFarmer.delete({
      where: { id: assignmentId },
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error in removeFarmerFromBooking:', error)
    return { success: false, error: error.message || 'Failed to remove farmer assignment' }
  }
}

/**
 * Phase 4: Get all available farmers (for assignment dropdown)
 */
export async function getAllFarmers(): Promise<{ success: boolean; farmers?: Array<{ id: string; name: string; phone: string; parish: string | null }>; error?: string }> {
  await requireAuth()
  
  // Phase 4: Check if user can assign farmers (to view farmer list)
  const userRole = await getCurrentUserRole()
  if (!canAssignFarmers(userRole)) {
    return { success: false, error: 'Access denied: Only ADMIN and COORDINATOR can view farmers' }
  }

  try {
    const farmers = await db.farmer.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        parish: true,
      },
      orderBy: { name: 'asc' },
    })

    return {
      success: true,
      farmers: farmers.map((farmer) => ({
        id: farmer.id,
        name: farmer.name,
        phone: farmer.phone,
        parish: farmer.parish || null,
      })),
    }
  } catch (error: any) {
    console.error('Error in getAllFarmers:', error)
    return { success: false, error: error.message || 'Failed to fetch farmers' }
  }
}
