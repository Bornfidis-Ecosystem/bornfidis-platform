import { NextResponse } from 'next/server'
import { z } from 'zod'
import { submitBooking } from '@/app/actions'
import { bookingSchema } from '@/lib/validation'
import { checkFormRateLimit, clientIpFromRequest } from '@/lib/form-rate-limit'

function toOptionalString(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

const DINING_SERVICE_HINTS = [
  'private chef',
  "chef's passage",
  'chef’s passage',
  'villa guest',
  'custom menu',
  'jamaica private',
]

function isDiningService(serviceType?: string): boolean {
  if (!serviceType) return false
  const s = serviceType.toLowerCase()
  return DINING_SERVICE_HINTS.some((h) => s.includes(h))
}

/** Contact form: dining keeps strict location length; product/class allows shorter. */
const contactBookingSchema = bookingSchema.extend({
  location: z.string().min(3, 'Location is required'),
})

export async function POST(req: Request) {
  try {
    const ip = clientIpFromRequest(req)
    const rate = checkFormRateLimit(`contact:${ip}`, { limit: 8, windowMs: 60_000 })
    if (!rate.ok) {
      return NextResponse.json(
        { ok: false, error: 'Too many submissions. Please wait a minute and try again.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } },
      )
    }

    const formData = await req.formData()

    const honeypot = toOptionalString(formData.get('website_url'))
    if (honeypot) {
      return NextResponse.json({ ok: true, message: 'Submitted' })
    }

    const firstName = toOptionalString(formData.get('firstName')) ?? ''
    const lastName = toOptionalString(formData.get('lastName')) ?? ''
    const name = `${firstName} ${lastName}`.trim()

    const email = toOptionalString(formData.get('email')) ?? ''
    const phone = toOptionalString(formData.get('phone')) ?? ''
    const eventDate = toOptionalString(formData.get('eventDate')) ?? ''
    let location = toOptionalString(formData.get('location')) ?? ''

    const guestCount = toOptionalString(formData.get('guestCount'))
    const budget = toOptionalString(formData.get('budget'))
    const details = toOptionalString(formData.get('details'))
    const serviceType = toOptionalString(formData.get('serviceType'))
    const eventType = toOptionalString(formData.get('eventType'))
    const productSlug = toOptionalString(formData.get('productSlug'))

    const dining = isDiningService(serviceType)
    if (!dining && location.length < 3) {
      location = 'To be confirmed'
    }

    const notesParts = [
      serviceType ? `Service Type: ${serviceType}` : null,
      eventType ? `Event Type: ${eventType}` : null,
      guestCount ? `Guest Count: ${guestCount}` : null,
      productSlug ? `Product interest: ${productSlug}` : null,
      budget ? `Budget Range: ${budget}` : null,
      details ? `Details: ${details}` : null,
    ].filter(Boolean)

    const payload: Record<string, string> = {
      name,
      email,
      phone,
      eventDate,
      location,
      referralSource: 'contact',
      leadType: serviceType || 'general-inquiry',
      guests: guestCount || '1',
    }

    if (budget) payload.budgetRange = budget
    if (notesParts.length) payload.notes = notesParts.join('\n\n')
    if (productSlug) payload.productSlug = productSlug
    if (eventType) payload.occasion = eventType

    const validated = contactBookingSchema.safeParse(payload)
    if (!validated.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Validation failed',
          fieldErrors: validated.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const result = await submitBooking(payload)

    if (!result?.success) {
      return NextResponse.json(
        {
          ok: false,
          error: result?.error || 'Failed to submit booking',
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      ok: true,
      message: 'Booking inquiry submitted successfully',
      bookingId: result.bookingId,
    })
  } catch (error) {
    console.error('contact-booking API error:', error)
    return NextResponse.json({ ok: false, error: 'Unexpected server error' }, { status: 500 })
  }
}
