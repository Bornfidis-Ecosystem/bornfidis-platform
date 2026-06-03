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
  if (activities.length === 0) {
    return (
      <div className="rounded-none border border-dashed border-culinary-outline bg-culinary-surface-low p-gutter font-culinary-sans text-body-md text-culinary-text-muted">
        No activity yet.
      </div>
    )
  }

  return (
    <ol className="space-y-stack-md">
      {activities.map((a) => {
        const meta = BOOKING_ACTIVITY_META[a.type]
        const displayLabel = a.type === 'checklist_updated' ? a.title : (meta?.label ?? a.title)
        const dotClass = meta?.dotClass ?? 'bg-culinary-gold'

        return (
          <li key={a.id} className="relative pl-6">
            <span className={`absolute left-0 top-2 h-2.5 w-2.5 rounded-none ${dotClass}`} aria-hidden />
            <div className="rounded-none border border-culinary-outline bg-culinary-surface-low p-gutter">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-culinary-sans text-body-md font-semibold text-culinary-ink">{displayLabel}</p>
                <p className="font-culinary-sans text-label-caps text-culinary-text-muted">
                  {formatBookingActivityDateTime(a.createdAt)}
                </p>
              </div>
              {a.description ? (
                <p className="mt-stack-sm whitespace-pre-wrap font-culinary-sans text-body-md text-culinary-text-muted">
                  {a.description}
                </p>
              ) : null}
              {a.actorName ? (
                <p className="mt-stack-sm font-culinary-sans text-body-md text-culinary-text-muted">By {a.actorName}</p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
