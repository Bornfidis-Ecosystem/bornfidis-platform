'use server'

import { bookingSchema, mergeBookingNotesFields } from '@/lib/validation'
import { db } from '@/lib/db'
import { sendBookingConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email'
import { logActivity } from '@/lib/activity-log'
import { sendSubmissionConfirmationSMS } from '@/lib/sms-utils'
import { ensureClientProfile } from '@/lib/client-profiles'

export async function submitBooking(formData: FormData | Record<string, string>) {
  try {
    // Convert FormData to object if needed
    const data = formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData

    // Validate data
    const validated = bookingSchema.parse(data)
    const mergedNotes = mergeBookingNotesFields(validated)

    // Check honeypot
    const websiteUrl = data.website_url?.toString() || ''
    if (websiteUrl.length > 0) {
      return { success: false, error: 'Spam detected' }
    }

    // Insert into database using Prisma
    const clientProfile = await ensureClientProfile({
      name: validated.name,
      email: validated.email || null,
      phone: validated.phone || null,
    })

    const booking = await db.bookingInquiry.create({
      data: {
        name: validated.name,
        email: validated.email || null,
        phone: validated.phone,
        eventDate: new Date(validated.eventDate),
        eventTime: validated.eventTime || null,
        location: validated.location,
        guests: validated.guests || null,
        budgetRange: validated.budgetRange || null,
        dietaryRestrictions: validated.dietaryRestrictions || null,
        notes: validated.notes || null,
        status: 'New',
        clientProfileId: clientProfile.id,
      },
    })

    // Seed booking timeline with a clear origin event.
    db.bookingActivity.create({
      data: {
        bookingId: booking.id,
        type: 'booking_created',
        title: 'Booking created',
        description: 'Inquiry received and recorded in the system.',
        actorName: 'System',
      },
    }).catch((activityError) => {
      console.error('Failed to create booking_created activity (non-blocking):', activityError)
    })

    logActivity({
      type: 'BOOKING_LEAD',
      title: 'New booking inquiry',
      description: `${validated.name} — ${validated.location}`,
      division: 'PROVISIONS',
      metadata: { bookingId: booking.id },
    }).catch(() => {})

    // Send confirmation email to customer (if email provided)
    if (validated.email) {
      const emailResult = await sendBookingConfirmationEmail(
        validated.email,
        validated.name,
        {
          eventDate: validated.eventDate,
          eventLocation: validated.location,
          guestCount: validated.guests,
          dietaryRestrictions: validated.dietaryRestrictions,
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
      email: validated.email,
      phone: validated.phone,
      eventDate: validated.eventDate,
      eventTime: validated.eventTime,
      eventLocation: validated.location,
      guestCount: validated.guests,
      budgetRange: validated.budgetRange,
      dietaryRestrictions: validated.dietaryRestrictions,
      notes: mergedNotes ?? undefined,
    })
    if (!adminEmailResult.success) {
      console.error('Failed to send admin notification email:', adminEmailResult.error)
      // Don't fail the booking if email fails, but log it
    }

    // Send SMS confirmation (non-blocking)
    // Email notification will be sent automatically after successful SMS
    if (validated.phone) {
      sendSubmissionConfirmationSMS(validated.phone, validated.name, 'booking', {
        email: validated.email,
        eventDate: validated.eventDate,
        eventTime: validated.eventTime,
        location: validated.location,
        guests: validated.guests,
        budgetRange: validated.budgetRange,
        dietaryRestrictions: validated.dietaryRestrictions,
        notes: mergedNotes ?? undefined,
      }).catch((smsError) => {
        console.error('Error sending SMS (non-blocking):', smsError)
        // Don't fail the booking if SMS fails
      })
    }

    return { success: true, bookingId: booking?.id }
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
