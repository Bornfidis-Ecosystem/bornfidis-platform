import { NextResponse } from 'next/server'
import { submitBooking } from '@/app/actions'
import { bookingSchema } from '@/lib/validation'

function toOptionalString(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    // Honeypot: bots that submit this field should be silently dropped.
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
    const location = toOptionalString(formData.get('location')) ?? ''

    const guestCount = toOptionalString(formData.get('guestCount'))
    const budget = toOptionalString(formData.get('budget'))
    const details = toOptionalString(formData.get('details'))
    const serviceType = toOptionalString(formData.get('serviceType'))
    const eventType = toOptionalString(formData.get('eventType'))

    const notesParts = [
      serviceType ? `Service Type: ${serviceType}` : null,
      eventType ? `Event Type: ${eventType}` : null,
      guestCount ? `Guest Count: ${guestCount}` : null,
      budget ? `Budget Range: ${budget}` : null,
      details ? `Details: ${details}` : null,
    ].filter(Boolean)

    const payload: Record<string, string> = {
      name,
      email,
      phone,
      eventDate,
      location,
    }

    if (guestCount) payload.guests = guestCount
    if (budget) payload.budgetRange = budget
    if (notesParts.length) payload.notes = notesParts.join('\n\n')

    const validated = bookingSchema.safeParse(payload)

    if (!validated.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Validation failed',
          fieldErrors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    // Pass the original payload (not validated.data) because bookingSchema
    // includes transforms and submitBooking re-validates.
    const result = await submitBooking(payload)

    if (!result?.success) {
      return NextResponse.json(
        {
          ok: false,
          error: result?.error || 'Failed to submit booking',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: 'Booking inquiry submitted successfully',
    })
  } catch (error) {
    console.error('contact-booking API error:', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Unexpected server error',
      },
      { status: 500 }
    )
  }
}

