import Link from 'next/link'
import { requireManagerOrFounderPageAccess } from '@/lib/admin-rbac'
import { getAllBookings } from './actions'
import SignOutButton from '@/components/admin/SignOutButton'
import BookingsQueueTable from '@/components/admin/BookingsQueueTable'
import { AdminBookingsHeader } from '@/components/admin/bookings/AdminBookingsHeader'
import { AdminBookingsFilters } from '@/components/admin/bookings/AdminBookingsFilters'
import { EmptyState } from '@/components/ui/EmptyState'
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
  await requireManagerOrFounderPageAccess()
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
          <AdminBookingsHeader
            title="Bookings"
            subtext={filterActive ? 'Filtered queue — see active filters below.' : 'Track inquiries, quotes, deposits, and confirmed events.'}
            actions={
              <>
                <Link
                  href="/admin/submissions"
                  className="px-4 py-2 bg-gold text-navy rounded hover:bg-opacity-90 transition text-sm font-semibold"
                >
                  Legacy Submissions
                </Link>
                <SignOutButton />
              </>
            }
          />
          {filterActive && (
            <div className="mt-4 text-white/90 text-xs space-y-2 max-w-3xl">
              <ul className="list-disc list-inside space-y-1">
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
      </header>

      <AdminBookingsFilters />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {bookings.length === 0 ? (
            <EmptyState
              title="No bookings match this view"
              description={
                filterActive
                  ? 'Try another filter or clear filters.'
                  : 'Bookings will appear here once customers submit inquiries.'
              }
              action={
                filterActive ? (
                  <Link href="/admin/bookings" className="text-sm font-semibold text-navy underline">
                    Show all bookings
                  </Link>
                ) : undefined
              }
            />
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
                {bookings.filter((b) => {
                  const s = (b.status || '').toLowerCase()
                  return s === 'pending' || s === 'new_inquiry' || b.status === 'New'
                }).length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Booked / Confirmed</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {bookings.filter((b) => {
                  const s = (b.status || '').toLowerCase()
                  return s === 'booked' || s === 'confirmed' || b.status === 'Confirmed' || s === 'in_prep'
                }).length}
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
