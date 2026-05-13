import type { BookingInquiry } from '@/types/booking'

type SummaryBooking = Pick<
  BookingInquiry,
  'event_date' | 'event_time' | 'location' | 'guests' | 'budget_range' | 'event_type' | 'dining_style' | 'upsell_interests'
>

export function AdminBookingSummaryCard({ booking }: { booking: SummaryBooking }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span aria-hidden>📋</span>
        Event summary
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Event date</p>
          <p className="mt-0.5 text-base font-medium text-gray-900">
            {booking.event_date
              ? new Date(booking.event_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : '—'}
            {booking.event_time ? ` at ${booking.event_time}` : ''}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Location</p>
          <p className="mt-0.5 text-base text-gray-900">{booking.location || '—'}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Guests</p>
          <p className="mt-0.5 text-base font-medium text-gray-900">{booking.guests ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Budget tier</p>
          <p className="mt-0.5 text-base text-gray-900">
            {booking.budget_range ? String(booking.budget_range).replace(/_/g, ' ') : '—'}
          </p>
        </div>
        {booking.event_type ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Occasion</p>
            <p className="mt-0.5 text-base text-gray-900">{booking.event_type}</p>
          </div>
        ) : null}
        {booking.dining_style ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Dining style</p>
            <p className="mt-0.5 text-base text-gray-900">{String(booking.dining_style).replace(/_/g, ' ')}</p>
          </div>
        ) : null}
        {booking.upsell_interests && booking.upsell_interests.length > 0 ? (
          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Upsell interests</p>
            <p className="mt-0.5 text-base text-gray-900">{booking.upsell_interests.join(', ')}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
