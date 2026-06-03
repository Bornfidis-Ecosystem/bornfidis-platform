import Link from 'next/link'
import type { PrepAttentionBooking } from '@/lib/admin-prep-attention'
import { CulinaryCard } from '@/components/culinary-os'

function formatEventDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

const sectionHeading =
  'mb-5 border-b border-culinary-outline pb-2 font-culinary-sans text-label-caps uppercase tracking-[0.1em] text-culinary-text-muted'

/**
 * Founder dashboard — execution readiness for events in the next 7 days.
 */
export default function PrepAttentionSection({ rows }: { rows: PrepAttentionBooking[] | null }) {
  return (
    <section className="min-w-0">
      <h2 className={sectionHeading}>Prep attention needed</h2>
      <p className="mb-3 max-w-3xl font-culinary-sans text-sm leading-relaxed text-culinary-text-muted">
        Upcoming events in the next 7 days with incomplete prep gates (menu, guest count, arrival, location,
        ingredients, equipment). Progress includes deposit, balance, dietary, and testimonial request from live
        booking data.
      </p>
      <div className="mb-4">
        <Link
          href="/admin/bookings?prep=incomplete&upcoming=7"
          className="inline-flex items-center rounded-none border border-culinary-outline bg-culinary-bone px-3 py-2 font-culinary-sans text-xs font-semibold text-culinary-navy transition refined hover:border-culinary-gold-line hover:bg-culinary-surface-low"
        >
          View all incomplete prep bookings →
        </Link>
      </div>

      {rows === null ? (
        <div className="rounded-none border border-amber-200/80 bg-amber-50/50 px-4 py-3 font-culinary-sans text-sm text-amber-900">
          Couldn&apos;t load prep attention. Refresh or check the server log.
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-none border border-dashed border-culinary-outline bg-culinary-surface-low px-4 py-6 text-center font-culinary-sans text-sm text-culinary-text-muted">
          No bookings need prep attention in the next 7 days.
        </div>
      ) : (
        <CulinaryCard padded={false} className="overflow-hidden">
          <ul className="divide-y divide-culinary-outline">
            {rows.map((row) => {
              const preview = row.missingPrepLabels.slice(0, 2)
              const extra = row.missingPrepCount - preview.length
              const missingText =
                preview.length === 0
                  ? '—'
                  : extra > 0
                    ? `${preview.join(' · ')} · +${extra} more`
                    : preview.join(' · ')

              return (
                <li key={row.id}>
                  <div className="flex flex-col gap-3 px-gutter py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-culinary-sans text-sm font-semibold text-culinary-ink">{row.name}</p>
                      <p className="mt-0.5 font-culinary-sans text-xs text-culinary-text-muted">
                        {formatEventDate(row.eventDate)} · <span className="text-culinary-ink">{row.status}</span>
                      </p>
                      <p className="mt-1.5 font-culinary-sans text-xs text-culinary-text-muted">
                        <span className="font-medium tabular-nums text-culinary-navy">
                          {row.doneCount} / {row.totalCount} complete
                        </span>
                        <span className="mx-2 text-culinary-outline-variant">·</span>
                        <span>Missing: {missingText}</span>
                      </p>
                    </div>
                    <Link
                      href={`/admin/bookings/${row.id}`}
                      className="inline-flex shrink-0 items-center justify-center rounded-none border border-culinary-outline bg-culinary-surface-low px-3 py-2 font-culinary-sans text-xs font-semibold text-culinary-navy transition refined hover:border-culinary-gold-line hover:bg-culinary-bone"
                    >
                      Open booking
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        </CulinaryCard>
      )}
    </section>
  )
}
