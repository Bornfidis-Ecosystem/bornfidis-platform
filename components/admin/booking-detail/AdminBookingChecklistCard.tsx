'use client'

import type { BookingInquiry } from '@/types/booking'
import type { BookingActivity } from '@/types/booking-activity'
import ServiceChecklistSection from '@/app/admin/bookings/[id]/ServiceChecklistSection'

type Props = {
  booking: BookingInquiry
  onActivity?: (activity: BookingActivity) => void
}

/** Wireframe entry point — delegates to the service checklist UI. */
export function AdminBookingChecklistCard({ booking, onActivity }: Props) {
  return <ServiceChecklistSection booking={booking} onActivity={onActivity} />
}
