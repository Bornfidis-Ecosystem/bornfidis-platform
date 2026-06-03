import type { BookingInquiry } from '@/types/booking'
import { CulinaryCard } from '@/components/culinary-os'

type SummaryBooking = Pick<
  BookingInquiry,
  'event_date' | 'event_time' | 'location' | 'guests' | 'budget_range' | 'event_type' | 'dining_style' | 'upsell_interests'
>

const labelClass = 'font-culinary-sans text-label-caps text-culinary-text-muted'
const valueClass = 'mt-0.5 font-culinary-sans text-body-lg font-medium text-culinary-ink'

export function AdminBookingSummaryCard({ booking }: { booking: SummaryBooking }) {
  return (
    <CulinaryCard>
      <h2 className="mb-stack-md flex items-center gap-2 font-culinary-display text-title-md text-culinary-navy">
        <span aria-hidden>📋</span>
        Event summary
      </h2>
      <div className="grid gap-gutter sm:grid-cols-2">
        <div>
          <p className={labelClass}>Event date</p>
          <p className={valueClass}>
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
          <p className={labelClass}>Location</p>
          <p className={`${valueClass} font-normal`}>{booking.location || '—'}</p>
        </div>
        <div>
          <p className={labelClass}>Guests</p>
          <p className={valueClass}>{booking.guests ?? '—'}</p>
        </div>
        <div>
          <p className={labelClass}>Budget tier</p>
          <p className={`${valueClass} font-normal`}>
            {booking.budget_range ? String(booking.budget_range).replace(/_/g, ' ') : '—'}
          </p>
        </div>
        {booking.event_type ? (
          <div>
            <p className={labelClass}>Occasion</p>
            <p className={`${valueClass} font-normal`}>{booking.event_type}</p>
          </div>
        ) : null}
        {booking.dining_style ? (
          <div>
            <p className={labelClass}>Dining style</p>
            <p className={`${valueClass} font-normal`}>{String(booking.dining_style).replace(/_/g, ' ')}</p>
          </div>
        ) : null}
        {booking.upsell_interests && booking.upsell_interests.length > 0 ? (
          <div className="sm:col-span-2">
            <p className={labelClass}>Upsell interests</p>
            <p className={`${valueClass} font-normal`}>{booking.upsell_interests.join(', ')}</p>
          </div>
        ) : null}
      </div>
    </CulinaryCard>
  )
}
