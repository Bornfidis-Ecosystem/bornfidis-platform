import Link from 'next/link'
import type { PrepAttentionBooking } from '@/lib/admin-prep-attention'

function formatEventDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Founder dashboard — execution readiness for events in the next 7 days.
 */
export default function PrepAttentionSection({ rows }: { rows: PrepAttentionBooking[] | null }) {
  return (
    <section className="min-w-0">
      <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-[0.2em] mb-5 pb-2 border-b border-stone-200">
        Prep attention needed
      </h2>
      <p className="text-sm text-stone-600 mb-3 max-w-3xl leading-relaxed">
        Upcoming events in the next 7 days with incomplete prep gates (menu, guest count, arrival, location,
        ingredients, equipment). Progress includes deposit, balance, dietary, and testimonial request from live
        booking data.
      </p>
      <div className="mb-4">
        <Link
          href="/admin/bookings?prep=incomplete&upcoming=7"
          className="inline-flex items-center rounded-lg border border-navy/20 bg-white px-3 py-2 text-xs font-semibold text-navy shadow-sm hover:bg-navy hover:text-white transition"
        >
          View all incomplete prep bookings →
        </Link>
      </div>

      {rows === null ? (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 px-4 py-3 text-sm text-amber-900">
          Couldn&apos;t load prep attention. Refresh or check the server log.
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-200 bg-white px-4 py-6 text-center text-sm text-stone-500">
          No bookings need prep attention in the next 7 days.
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200/80 bg-white overflow-hidden shadow-sm">
          <ul className="divide-y divide-stone-100">
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
                  <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-stone-900 truncate">{row.name}</p>
                      <p className="text-xs text-stone-600 mt-0.5">
                        {formatEventDate(row.eventDate)} · <span className="text-stone-700">{row.status}</span>
                      </p>
                      <p className="text-xs text-stone-500 mt-1.5">
                        <span className="font-medium text-navy tabular-nums">
                          {row.doneCount} / {row.totalCount} complete
                        </span>
                        <span className="mx-2 text-stone-300">·</span>
                        <span>Missing: {missingText}</span>
                      </p>
                    </div>
                    <Link
                      href={`/admin/bookings/${row.id}`}
                      className="shrink-0 inline-flex items-center justify-center rounded-lg border border-navy/20 bg-stone-50 px-3 py-2 text-xs font-semibold text-navy hover:bg-navy hover:text-white transition"
                    >
                      Open booking
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
