'use server'

import { bookingInquiryPayloadSchema } from '@/lib/booking-inquiry-payload'
import { createBookingInquiryRecord } from '@/lib/booking-inquiry-create'
import { sendBookingConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email'
import { sendSubmissionConfirmationSMS } from '@/lib/sms-utils'

function bookingRawToObject(formData: FormData | Record<string, unknown>) {
  if (formData instanceof FormData) {
    const o: Record<string, unknown> = Object.fromEntries(formData.entries())
    const ups = formData.getAll('upsellInterests').map(String)
    if (ups.length) o.upsellInterests = ups
    return o
  }
  return { ...formData }
}

export async function submitBooking(formData: FormData | Record<string, unknown>) {
  try {
    const data = bookingRawToObject(
      formData as FormData | Record<string, unknown>
    )

    if (String(data.website_url ?? '').length > 0) {
      return { success: false, error: 'Spam detected' }
    }

    const validated = bookingInquiryPayloadSchema.parse(data)
    const { booking } = await createBookingInquiryRecord(validated)

    // Send confirmation email to customer (if email provided)
    if (validated.email) {
      const emailResult = await sendBookingConfirmationEmail(
        validated.email,
        validated.name,
        {
          eventDate: validated.eventDate,
          eventLocation: validated.location,
          guestCount: validated.guests,
          dietaryRestrictions: validated.dietaryRestrictions ?? undefined,
        }
      )
      if (!emailResult.success) {
        console.error('Failed to send confirmation email:', emailResult.error)
        // Don't fail the booking if email fails, but log it
      }
    }

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'brian@bornfidis.com'
    const adminEmailResult = await sendAdminNotificationEmail(adminEmail, {
      name: validated.name,
      email: validated.email || undefined,
      phone: validated.phone,
      eventDate: validated.eventDate,
      eventTime: validated.eventTime || undefined,
      eventLocation: validated.location,
      guestCount: validated.guests,
      budgetRange: validated.budgetRange || undefined,
      dietaryRestrictions: validated.dietaryRestrictions || undefined,
      notes: validated.mergedNotes ?? undefined,
    })
    if (!adminEmailResult.success) {
      console.error('Failed to send admin notification email:', adminEmailResult.error)
      // Don't fail the booking if email fails, but log it
    }

    if (validated.phone) {
      sendSubmissionConfirmationSMS(validated.phone, validated.name, 'booking', {
        email: validated.email || undefined,
        eventDate: validated.eventDate,
        eventTime: validated.eventTime || undefined,
        location: validated.location,
        guests: validated.guests,
        budgetRange: validated.budgetRange || undefined,
        dietaryRestrictions: validated.dietaryRestrictions || undefined,
        notes: validated.mergedNotes ?? undefined,
      }).catch((smsError) => {
        console.error('Error sending SMS (non-blocking):', smsError)
      })
    }

    return { success: true, bookingId: booking.id }
  } catch (error: any) {
    console.error('Booking submission error:', error)
    
    if (error.errors) {
      // Zod validation errors
      const firstError = error.errors[0]
      return { success: false, error: firstError.message || 'Validation failed' }
    }

    return { success: false, error: error.message || 'An error occurred. Please try again.' }
  }
}
