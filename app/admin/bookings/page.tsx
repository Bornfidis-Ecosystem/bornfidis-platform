import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireHospitalityOpsPageAccess, resolveAdminPlatformRole } from '@/lib/admin-rbac'
import { canViewPlatformFinancials } from '@/lib/ops-coordinator-access'
import { getAllBookings } from './actions'
import SignOutButton from '@/components/admin/SignOutButton'
import BookingsQueueTable from '@/components/admin/BookingsQueueTable'
import { AdminBookingsFilters } from '@/components/admin/bookings/AdminBookingsFilters'
import { EmptyState } from '@/components/ui/EmptyState'
import { CulinaryCard, CulinaryPageHeader } from '@/components/culinary-os'
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
  await requireHospitalityOpsPageAccess()
  const showFinancials = canViewPlatformFinancials(await resolveAdminPlatformRole())
  const raw = await searchParams
  const query = parseBookingsQuery(raw)
  if (!showFinancials && (query.deposit || query.balance)) {
    redirect('/admin/bookings')
  }

  let result: Awaited<ReturnType<typeof getAllBookings>>
  try {
    result = await getAllBookings()
  } catch (e: any) {
    result = { success: false, error: e?.message ?? 'Server error loading bookings' }
  }

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-stack-lg">
        <CulinaryCard className="border-red-200 bg-red-50/80">
          <p className="font-culinary-sans text-title-md text-red-900">Error loading bookings</p>
          <p className="mt-stack-sm font-culinary-sans text-body-md text-red-800/90">{result.error}</p>
        </CulinaryCard>
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
    createdAt:
      typeof b.createdAt === 'string' ? b.createdAt : new Date(b.createdAt).toISOString(),
  }))

  const activeDescriptions = describeBookingsQuery(query)
  const filterActive = hasActiveQuery(query)

  const headerDescription = filterActive
    ? 'Filtered queue — active filters are listed below.'
    : showFinancials
      ? 'Track inquiries, quotes, deposits, and confirmed events.'
      : 'Track inquiries, prep, timelines, and confirmed events.'

  return (
    <div className="space-y-stack-lg">
      <div className="container mx-auto px-4 pt-stack-md">
        <CulinaryPageHeader
          title="Bookings"
          description={headerDescription}
          actions={
            <>
              <Link
                href="/admin/submissions"
                className="inline-flex items-center justify-center rounded-none border border-culinary-gold-line bg-transparent px-4 py-2 font-culinary-sans text-label-caps text-culinary-navy transition refined hover:bg-culinary-surface-low"
              >
                Legacy Submissions
              </Link>
              <SignOutButton />
            </>
          }
        />

        {filterActive && (
          <CulinaryCard className="mt-stack-md">
            <ul className="list-inside list-disc space-y-stack-sm font-culinary-sans text-body-md text-culinary-text-muted">
              {activeDescriptions.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="mt-stack-md flex flex-wrap items-center gap-stack-sm">
              <Link
                href="/admin/bookings"
                className="inline-flex items-center rounded-none border border-culinary-outline bg-culinary-surface-low px-3 py-1.5 font-culinary-sans text-label-caps text-culinary-navy transition refined hover:border-culinary-navy hover:bg-culinary-bone"
              >
                Clear all filters
              </Link>
              <Link
                href="/admin"
                className="font-culinary-sans text-label-caps text-culinary-navy underline decoration-culinary-gold-line underline-offset-4 hover:text-culinary-text-muted"
              >
                ← Founder dashboard
              </Link>
            </div>
          </CulinaryCard>
        )}
      </div>

      <AdminBookingsFilters showFinancialQueues={showFinancials} />

      <main className="container mx-auto px-4 pb-stack-lg">
        <CulinaryCard padded={false} className="overflow-hidden shadow-none">
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
                  <Link
                    href="/admin/bookings"
                    className="font-culinary-sans text-label-caps text-culinary-navy underline decoration-culinary-gold-line underline-offset-4"
                  >
                    Show all bookings
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <BookingsQueueTable rows={queueRows} bulkReminderType={bulkReminderType} />
          )}
        </CulinaryCard>

        {bookings.length > 0 && (
          <div className="mt-stack-md grid grid-cols-1 gap-gutter md:grid-cols-4">
            <CulinaryCard>
              <p className="font-culinary-sans text-label-caps text-culinary-text-muted">
                {filterActive ? 'In this view' : 'Total bookings'}
              </p>
              <p className="mt-stack-sm font-culinary-display text-headline-lg-mobile text-culinary-navy tabular-nums">
                {bookings.length}
              </p>
            </CulinaryCard>
            <CulinaryCard>
              <p className="font-culinary-sans text-label-caps text-culinary-text-muted">Pending</p>
              <p className="mt-stack-sm font-culinary-display text-headline-lg-mobile text-culinary-navy tabular-nums">
                {
                  bookings.filter((b) => {
                    const s = (b.status || '').toLowerCase()
                    return s === 'pending' || s === 'new_inquiry' || b.status === 'New'
                  }).length
                }
              </p>
            </CulinaryCard>
            <CulinaryCard>
              <p className="font-culinary-sans text-label-caps text-culinary-text-muted">Booked / confirmed</p>
              <p className="mt-stack-sm font-culinary-display text-headline-lg-mobile text-culinary-forest tabular-nums">
                {
                  bookings.filter((b) => {
                    const s = (b.status || '').toLowerCase()
                    return s === 'booked' || s === 'confirmed' || b.status === 'Confirmed' || s === 'in_prep'
                  }).length
                }
              </p>
            </CulinaryCard>
            <CulinaryCard>
              <p className="font-culinary-sans text-label-caps text-culinary-text-muted">Declined / closed</p>
              <p className="mt-stack-sm font-culinary-display text-headline-lg-mobile text-culinary-text-muted tabular-nums">
                {bookings.filter((b) => b.status === 'declined' || b.status === 'Closed').length}
              </p>
            </CulinaryCard>
          </div>
        )}
      </main>
    </div>
  )
}
