import { NextRequest, NextResponse } from 'next/server'
import { bookingInquiryPayloadSchema } from '@/lib/booking-inquiry-payload'
import { createBookingInquiryRecord } from '@/lib/booking-inquiry-create'
import { sendBookingConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email'
import { bookingNotificationRecipient } from '@/lib/platform-email'
import { sendSubmissionConfirmationSMS } from '@/lib/sms-utils'
import { checkFormRateLimit, clientIpFromRequest } from '@/lib/form-rate-limit'

/**
 * POST /api/submit-booking
 * Private dining inquiry — zod + Prisma, Resend, optional SMS
 */
export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFromRequest(request)
    const rate = checkFormRateLimit(`book:${ip}`, { limit: 8, windowMs: 60_000 })
    if (!rate.ok) {
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Please wait a minute and try again.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } },
      )
    }

    const body = await request.json()

    if (body.website_url && body.website_url.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Spam detected' },
        { status: 400 }
      )
    }

    const validated = bookingInquiryPayloadSchema.parse(body)
    const { booking } = await createBookingInquiryRecord(validated)

    if (validated.email) {
      sendBookingConfirmationEmail(validated.email, validated.name, {
        eventDate: validated.eventDate,
        eventLocation: validated.location,
        guestCount: validated.guests,
        dietaryRestrictions: validated.dietaryRestrictions || undefined,
      }).catch((emailError) => {
        console.error('Error sending confirmation email (non-blocking):', emailError)
      })
    }

    sendAdminNotificationEmail(
      bookingNotificationRecipient(),
      {
        name: validated.name,
        email: validated.email || undefined,
        phone: validated.phone || undefined,
        eventDate: validated.eventDate,
        eventTime: validated.eventTime || undefined,
        eventLocation: validated.location,
        guestCount: validated.guests,
        budgetRange: validated.budgetRange || undefined,
        dietaryRestrictions: validated.dietaryRestrictions || undefined,
        notes: validated.mergedNotes || undefined,
      }
    ).catch((emailError) => {
      console.error('Error sending admin notification email (non-blocking):', emailError)
    })

    if (validated.phone) {
      sendSubmissionConfirmationSMS(validated.phone, validated.name, 'booking', {
        email: validated.email || undefined,
        eventDate: validated.eventDate,
        eventTime: validated.eventTime || undefined,
        location: validated.location,
        guests: validated.guests,
        budgetRange: validated.budgetRange || undefined,
        dietaryRestrictions: validated.dietaryRestrictions || undefined,
        notes: validated.mergedNotes || undefined,
      }).catch((smsError) => {
        console.error('Error sending SMS (non-blocking):', smsError)
      })
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: 'Booking inquiry received',
    })
  } catch (error: any) {
    console.error('Booking submission error:', error)

    if (error.errors) {
      const firstError = error.errors[0]
      return NextResponse.json(
        { success: false, error: firstError.message || 'Validation failed' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
