import { db } from '@/lib/db'
import { ensureClientProfile } from '@/lib/client-profiles'
import { logActivity } from '@/lib/activity-log'
import type { NormalizedBookingInquiryPayload } from '@/lib/booking-inquiry-payload'
import { Prisma } from '@prisma/client'

type CreateResult = { booking: { id: string; name: string; email: string | null; phone: string | null } }

/**
 * Inserts a booking_inquiries row and seeds timeline activity. Caller sends emails / SMS.
 */
export async function createBookingInquiryRecord(
  p: NormalizedBookingInquiryPayload
): Promise<CreateResult> {
  const clientProfile = await ensureClientProfile({
    name: p.name,
    email: p.email,
    phone: p.phone,
  })

  const data: Prisma.BookingInquiryCreateInput = {
    name: p.name,
    email: p.email,
    phone: p.phone,
    eventDate: new Date(p.eventDate),
    eventTime: p.eventTime,
    location: p.location,
    guests: p.guests,
    budgetRange: p.budgetRange,
    eventType: p.eventType,
    diningStyle: p.diningStyle,
    dietaryRestrictions: p.dietaryRestrictions,
    notes: p.mergedNotes,
    status: 'new_inquiry',
    referralSource: p.referralSource,
    clientProfile: { connect: { id: clientProfile.id } },
  }

  if (p.upsellInterests.length) {
    data.upsellInterests = p.upsellInterests
  }

  const booking = await db.bookingInquiry.create({ data })

  db.bookingActivity
    .create({
      data: {
        bookingId: booking.id,
        type: 'booking_created',
        title: 'Booking created',
        description: 'Inquiry received and recorded in the system.',
        actorName: 'System',
      },
    })
    .catch((e) => console.error('Failed to create booking_created activity (non-blocking):', e))

  logActivity({
    type: 'BOOKING_LEAD',
    title: 'New booking inquiry',
    description: `${p.name} — ${p.location}`,
    division: 'PROVISIONS',
    metadata: { bookingId: booking.id },
  }).catch(() => {})

  return { booking: { id: booking.id, name: booking.name, email: booking.email, phone: booking.phone } }
}
