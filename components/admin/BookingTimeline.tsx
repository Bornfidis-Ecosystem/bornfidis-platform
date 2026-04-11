'use client'

import type { BookingActivity } from '@/types/booking-activity'
import { BOOKING_ACTIVITY_META } from '@/lib/bookings/activityMeta'

function formatBookingActivityDateTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export default function BookingTimeline({ activities }: { activities: BookingActivity[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-navy">Booking Timeline</h3>
        <p className="text-sm text-gray-600">Activity history for this booking</p>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
          No activity yet.
        </div>
      ) : (
        <ol className="space-y-4">
          {activities.map((a) => {
            const meta = BOOKING_ACTIVITY_META[a.type]
            const displayLabel =
              a.type === 'checklist_updated' ? a.title : (meta?.label ?? a.title)
            const dotClass = meta?.dotClass ?? 'bg-gold'

            return (
              <li key={a.id} className="relative pl-6">
                <span className={`absolute left-0 top-2 h-2.5 w-2.5 rounded-full ${dotClass}`} aria-hidden />
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-gray-900">{displayLabel}</p>
                    <p className="text-xs text-gray-500">{formatBookingActivityDateTime(a.createdAt)}</p>
                  </div>
                  {a.description ? <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{a.description}</p> : null}
                  {a.actorName ? <p className="mt-2 text-xs text-gray-500">By {a.actorName}</p> : null}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

