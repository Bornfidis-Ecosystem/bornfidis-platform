import Link from 'next/link'
import { getAllBookings } from './actions'
import { BookingStatus } from '@/types/booking'
import SignOutButton from '@/components/admin/SignOutButton'
import BookingsQueueTable from '@/components/admin/BookingsQueueTable'
import {
  applyBookingsQueryFilter,
  bulkReminderTypeForQuery,
  describeBookingsQuery,
  parseBookingsQuery,
  type ParsedBookingsQuery,
} from '@/lib/bookings/query-filters'

/**
 * Admin Bookings Dashboard
 * Query params: status, prep, upcoming, deposit, balance, testimonial (see parseBookingsQuery).
 */
type BookingsSearchParams = Promise<Record<string, string | string[] | undefined>>

function hasActiveQuery(q: ParsedBookingsQuery): boolean {
  return Boolean(
    q.status ||
      q.prep ||
      q.upcomingDays != null ||
      q.deposit ||
      q.balance ||
      q.testimonial
  )
}

export default async function AdminBookingsPage({ searchParams }: { searchParams: BookingsSearchParams }) {
  const raw = await searchParams
  const query = parseBookingsQuery(raw)

  let result: Awaited<ReturnType<typeof getAllBookings>>
  try {
    result = await getAllBookings()
  } catch (e: any) {
    result = { success: false, error: e?.message ?? 'Server error loading bookings' }
  }

  if (!result.success) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-semibold">Error loading bookings</p>
            <p className="text-sm mt-1">{result.error}</p>
          </div>
        </div>
      </div>
    )
  }

  const allBookings = result.bookings || []
  const filtered = hasActiveQuery(query) ? applyBookingsQueryFilter(allBookings, query) : allBookings
  const bookings = filtered
  const bulkReminderType = bulkReminderTypeForQuery(query)
  const queueRows = bookings.map((b) => ({
    id: b.id,
    name: b.name,
    email: b.email ?? null,
    event_date: b.event_date,
    status: b.status,
    createdAt: b.createdAt,
  }))

  const activeDescriptions = describeBookingsQuery(query)
  const filterActive = hasActiveQuery(query)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-navy text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold">Bookings Dashboard</h1>
              <p className="text-gold text-sm mt-1">
                {filterActive ? 'Filtered queue' : 'Manage all booking inquiries'}
              </p>
              {filterActive && (
                <div className="mt-3 space-y-2">
                  <ul className="text-white/90 text-xs space-y-1 list-disc list-inside">
                    {activeDescriptions.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Link
                      href="/admin/bookings"
                      className="inline-flex items-center rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20 transition"
                    >
                      Clear all filters
                    </Link>
                    <Link href="/admin" className="text-xs text-white/80 underline hover:text-gold">
                      ← Founder dashboard
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/admin/submissions"
                className="px-4 py-2 bg-gold text-navy rounded hover:bg-opacity-90 transition text-sm font-semibold"
              >
                Legacy Submissions
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Quick filter chips */}
      <div className="border-b border-stone-200 bg-white">
        <div className="container mx-auto px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-2">Quick queues</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/admin/bookings?status=confirmed', label: 'Confirmed' },
              { href: '/admin/bookings?status=completed', label: 'Completed' },
              { href: '/admin/bookings?prep=incomplete&upcoming=7', label: 'Prep incomplete · 7d' },
              { href: '/admin/bookings?upcoming=7', label: 'Upcoming · 7d' },
              { href: '/admin/bookings?deposit=pending', label: 'Deposit pending' },
              { href: '/admin/bookings?balance=pending', label: 'Balance pending' },
              { href: '/admin/bookings?testimonial=needed', label: 'Testimonial follow-up' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center rounded-full border border-navy/15 bg-stone-50 px-3 py-1 text-xs font-medium text-navy hover:bg-navy hover:text-white transition"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No bookings match this view</p>
              <p className="text-sm mt-2">
                {filterActive ? 'Try another filter or clear filters.' : 'Bookings will appear here once customers submit inquiries.'}
              </p>
              {filterActive && (
                <Link href="/admin/bookings" className="inline-block mt-4 text-sm font-semibold text-navy underline">
                  Show all bookings
                </Link>
              )}
            </div>
          ) : (
            <BookingsQueueTable rows={queueRows} bulkReminderType={bulkReminderType} />
          )}
        </div>

        {/* Summary Stats */}
        {bookings.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">{filterActive ? 'In this view' : 'Total Bookings'}</div>
              <div className="text-2xl font-bold text-navy mt-1">{bookings.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Pending</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {bookings.filter((b) => b.status === 'pending' || b.status === 'New').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Booked / Confirmed</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {bookings.filter((b) => b.status === 'booked' || b.status === 'Confirmed').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Declined / Closed</div>
              <div className="text-2xl font-bold text-gray-600 mt-1">
                {bookings.filter((b) => b.status === 'declined' || b.status === 'Closed').length}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
