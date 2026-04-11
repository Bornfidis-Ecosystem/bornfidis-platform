import { NextRequest, NextResponse } from 'next/server'
import { bookingSchema, mergeBookingNotesFields } from '@/lib/validation'
import { db } from '@/lib/db'
import { sendBookingConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email'
import { logActivity } from '@/lib/activity-log'
import { sendSubmissionConfirmationSMS } from '@/lib/sms-utils'
import { ensureClientProfile } from '@/lib/client-profiles'

/**
 * POST /api/submit-booking
 * Booking submission API route (for offline sync compatibility)
 * Uses Prisma to write to booking_inquiries table
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate data
    const validated = bookingSchema.parse(body)
    const mergedNotes = mergeBookingNotesFields(validated)

    // Check honeypot
    if (body.website_url && body.website_url.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Spam detected' },
        { status: 400 }
      )
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
        notes: mergedNotes,
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
      sendBookingConfirmationEmail(validated.email, validated.name, {
        eventDate: validated.eventDate,
        eventLocation: validated.location,
        guestCount: validated.guests || undefined,
        dietaryRestrictions: validated.dietaryRestrictions || undefined,
      }).catch((emailError) => {
        console.error('Error sending confirmation email (non-blocking):', emailError)
      })
    }

    // Send admin notification email to tech@bornfidis.com (non-blocking)
    sendAdminNotificationEmail('tech@bornfidis.com', {
      name: validated.name,
      email: validated.email || undefined,
      phone: validated.phone || undefined,
      eventDate: validated.eventDate,
      eventTime: validated.eventTime || undefined,
      eventLocation: validated.location,
      guestCount: validated.guests || undefined,
      budgetRange: validated.budgetRange || undefined,
      dietaryRestrictions: validated.dietaryRestrictions || undefined,
      notes: mergedNotes ?? undefined,
    }).catch((emailError) => {
      console.error('Error sending admin notification email (non-blocking):', emailError)
    })

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
      })
    }

    return NextResponse.json({
      success: true,
      bookingId: booking?.id,
      message: 'Booking inquiry received',
    })
  } catch (error: any) {
    console.error('Booking submission error:', error)
    
    if (error.errors) {
      // Zod validation errors
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
