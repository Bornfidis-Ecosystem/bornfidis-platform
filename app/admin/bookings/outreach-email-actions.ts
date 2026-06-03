'use server'

import { db } from '@/lib/db'
import { requireAdminUser } from '@/lib/requireAdmin'
import { getQuoteDepositTestimonialSnippet } from '@/lib/homepage-testimonials'
import { sendDepositRequestEmail, sendQuoteOfferEmail } from '@/lib/email'
import { formatUSD } from '@/lib/money'
import { addBookingActivity } from './actions'
import { createStripeDepositLink } from './quote-actions'
import type { QuoteLineItem } from '@/types/booking'

function parseLineItems(raw: unknown): QuoteLineItem[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as QuoteLineItem[]
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw)
      return Array.isArray(p) ? p : []
    } catch {
      return []
    }
  }
  return []
}

function hasSavedQuoteRow(quoteTotalCents: number | null, lineItems: QuoteLineItem[]): boolean {
  return (quoteTotalCents ?? 0) > 0 && lineItems.length > 0
}

function formatEventDateLong(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function ensureStripeDepositUrl(bookingId: string, existing: string | null): Promise<string | null> {
  if (existing) return existing
  const res = await createStripeDepositLink(bookingId)
  if (!res.success || !res.url) return null
  return res.url
}

export async function sendBookingQuoteOfferEmail(bookingId: string): Promise<
  | {
      success: true
      activity: {
        id: string
        bookingId: string
        type: string
        title: string
        description?: string | null
        actorName?: string | null
        createdAt: string
      }
    }
  | { success: false; error: string }
> {
  await requireAdminUser()

  const booking = await db.bookingInquiry.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      name: true,
      email: true,
      eventDate: true,
      eventType: true,
      location: true,
      guests: true,
      quoteTotalCents: true,
      quoteDepositCents: true,
      depositAmountCents: true,
      depositPercentage: true,
      quoteLineItems: true,
      quoteNotes: true,
      stripePaymentLinkUrl: true,
    },
  })

  if (!booking) {
    return { success: false, error: 'Booking not found' }
  }
  if (!booking.email?.trim()) {
    return { success: false, error: 'Client email is missing. Add an email on the booking first.' }
  }

  const lineItems = parseLineItems(booking.quoteLineItems)
  if (!hasSavedQuoteRow(booking.quoteTotalCents, lineItems)) {
    return { success: false, error: 'Save a quote with line items and totals before sending a quote email.' }
  }

  const quoteEmailTestimonial = await getQuoteDepositTestimonialSnippet(bookingId)
  const totalCents = booking.quoteTotalCents ?? 0
  const depositCents = booking.depositAmountCents ?? booking.quoteDepositCents ?? 0
  const depositPct = booking.depositPercentage ?? 30

  const experienceLines =
    lineItems.length > 0
      ? lineItems
          .map((l) => {
            const q = l.quantity ?? 1
            const cents = q * (l.unit_price_cents ?? 0)
            return `• ${l.title || 'Item'} (${q}×) — ${formatUSD(cents)}`
          })
          .join('\n')
      : (booking.eventType || 'Custom Bornfidis chef experience')
  const experienceSummary = [experienceLines, booking.quoteNotes?.trim() ? `\nNotes: ${booking.quoteNotes.trim()}` : '']
    .filter(Boolean)
    .join('')

  const stripeUrl = await ensureStripeDepositUrl(bookingId, booking.stripePaymentLinkUrl)
  const paymentInstructions = stripeUrl
    ? `Pay your deposit securely (Stripe):\n${stripeUrl}\n\nQuestions? Reply to this email.`
    : 'We will send a secure payment link in a follow-up. Reply to this email to confirm.'

  const guestStr =
    booking.guests != null && booking.guests > 0 ? `${booking.guests} guest${booking.guests === 1 ? '' : 's'}` : '—'

  const sendResult = await sendQuoteOfferEmail({
    to: booking.email.trim(),
    clientName: booking.name.trim(),
    eventDate: formatEventDateLong(booking.eventDate),
    location: booking.location,
    guests: guestStr,
    experienceSummary,
    estimatedTotal: formatUSD(totalCents),
    depositPercent: depositPct,
    depositAmount: formatUSD(depositCents),
    paymentInstructions,
    quoteEmailTestimonial,
  })

  if (!sendResult.success) {
    return { success: false, error: sendResult.error || 'Failed to send email' }
  }

  const logResult = await addBookingActivity(bookingId, {
    type: 'quote_sent',
    title: 'Quote email sent',
    description: `To ${booking.email.trim()}`,
  })

  if (!logResult.success) {
    return { success: false, error: logResult.error || 'Email sent but activity log failed' }
  }

  return { success: true, activity: logResult.activity }
}

export async function sendBookingDepositRequestEmail(bookingId: string): Promise<
  | {
      success: true
      activity: {
        id: string
        bookingId: string
        type: string
        title: string
        description?: string | null
        actorName?: string | null
        createdAt: string
      }
    }
  | { success: false; error: string }
> {
  await requireAdminUser()

  const booking = await db.bookingInquiry.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      name: true,
      email: true,
      eventDate: true,
      eventType: true,
      location: true,
      guests: true,
      quoteTotalCents: true,
      quoteDepositCents: true,
      depositAmountCents: true,
      depositPercentage: true,
      quoteLineItems: true,
      stripePaymentLinkUrl: true,
    },
  })

  if (!booking) {
    return { success: false, error: 'Booking not found' }
  }
  if (!booking.email?.trim()) {
    return { success: false, error: 'Client email is missing. Add an email on the booking first.' }
  }

  const lineItems = parseLineItems(booking.quoteLineItems)
  if (!hasSavedQuoteRow(booking.quoteTotalCents, lineItems)) {
    return { success: false, error: 'Save a quote with line items and totals before sending a deposit request email.' }
  }

  const quoteEmailTestimonial = await getQuoteDepositTestimonialSnippet(bookingId)
  const totalCents = booking.quoteTotalCents ?? 0
  const depositCents = booking.depositAmountCents ?? booking.quoteDepositCents ?? 0
  const depositPct = booking.depositPercentage ?? 30

  const stripeUrl = await ensureStripeDepositUrl(bookingId, booking.stripePaymentLinkUrl)
  if (!stripeUrl) {
    return {
      success: false,
      error: 'Could not create or load a Stripe deposit link. Check Stripe configuration and saved deposit amount.',
    }
  }

  const paymentInstructions = `Pay your deposit securely (Stripe):\n${stripeUrl}\n\nQuestions? Reply to this email.`

  const packageName =
    lineItems.length > 0
      ? lineItems.map((l) => l.title || 'Item').join(', ')
      : booking.eventType || 'Bornfidis chef experience'

  const guestStr =
    booking.guests != null && booking.guests > 0 ? `${booking.guests} guest${booking.guests === 1 ? '' : 's'}` : '—'

  const sendResult = await sendDepositRequestEmail({
    to: booking.email.trim(),
    clientName: booking.name.trim(),
    eventType: booking.eventType || undefined,
    eventDate: formatEventDateLong(booking.eventDate),
    location: booking.location,
    guestCount: guestStr,
    packageName,
    total: formatUSD(totalCents),
    depositPercent: depositPct,
    depositAmount: formatUSD(depositCents),
    paymentInstructions,
    quoteEmailTestimonial,
  })

  if (!sendResult.success) {
    return { success: false, error: sendResult.error || 'Failed to send email' }
  }

  const logResult = await addBookingActivity(bookingId, {
    type: 'deposit_request_sent',
    title: 'Deposit request sent',
    description: `To ${booking.email.trim()}`,
  })

  if (!logResult.success) {
    return { success: false, error: logResult.error || 'Email sent but activity log failed' }
  }

  return { success: true, activity: logResult.activity }
}
