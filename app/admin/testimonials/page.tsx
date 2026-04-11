import Link from 'next/link'
import { db } from '@/lib/db'
import { requireAdminUser } from '@/lib/requireAdmin'
import CopyTextButton from '@/components/admin/CopyTextButton'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

const RECENT_DAYS = 90

function CtaButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-lg bg-[#0F3D2E] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
    >
      {label}
    </Link>
  )
}

function excerpt(text: string, max = 160) {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}

type FilterMode = 'approved' | 'all' | 'recent'
type SortMode = 'received' | 'event'

type SearchParams = Promise<{
  filter?: string
  q?: string
  sort?: string
}>

function parseFilter(v: string | undefined): FilterMode {
  if (v === 'all' || v === 'recent') return v
  return 'approved'
}

function parseSort(v: string | undefined): SortMode {
  if (v === 'event') return 'event'
  return 'received'
}

function buildTestimonialsHref(opts: { q?: string; filter: FilterMode; sort: SortMode }) {
  const sp = new URLSearchParams()
  const q = opts.q?.trim()
  if (q) sp.set('q', q)
  if (opts.filter !== 'approved') sp.set('filter', opts.filter)
  if (opts.sort !== 'received') sp.set('sort', opts.sort)
  const qs = sp.toString()
  return qs ? `/admin/testimonials?${qs}` : '/admin/testimonials'
}

function TestimonialsEmptyState({
  searchTerm,
  filterMode,
  hasAnyTestimonials,
}: {
  searchTerm: string
  filterMode: FilterMode
  hasAnyTestimonials: boolean
}) {
  if (searchTerm) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h3 className="text-lg font-semibold text-navy">No testimonials found</h3>
        <p className="mt-2 text-sm text-gray-600">Try a different name, keyword, or clear your search.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <CtaButton href="/admin/testimonials" label="View approved testimonials" />
          <CtaButton href="/admin/testimonials?filter=all" label="View all testimonials" />
        </div>
      </div>
    )
  }
  if (!hasAnyTestimonials) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h3 className="text-lg font-semibold text-navy">No testimonials yet</h3>
        <p className="mt-2 text-sm text-gray-600">Testimonials are captured from completed bookings.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <CtaButton href="/admin/bookings?status=completed" label="View completed bookings" />
          <CtaButton href="/admin" label="Go to dashboard" />
        </div>
      </div>
    )
  }
  if (filterMode === 'approved') {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h3 className="text-lg font-semibold text-navy">No approved testimonials yet</h3>
        <p className="mt-2 text-sm text-gray-600">You have testimonials saved, but none are approved for use.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <CtaButton href="/admin/testimonials?filter=all" label="Review all testimonials" />
          <CtaButton href="/admin/bookings?status=completed" label="Request testimonials" />
        </div>
      </div>
    )
  }
  if (filterMode === 'recent') {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h3 className="text-lg font-semibold text-navy">No recent testimonials</h3>
        <p className="mt-2 text-sm text-gray-600">No testimonials have been received in the last {RECENT_DAYS} days.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <CtaButton href="/admin/testimonials?filter=all" label="View all testimonials" />
          <CtaButton href="/admin/bookings?status=completed" label="Follow up with clients" />
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
      <h3 className="text-lg font-semibold text-navy">No testimonials match this view</h3>
      <p className="mt-2 text-sm text-gray-600">Try another filter or search.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <CtaButton href="/admin/testimonials" label="View approved testimonials" />
        <CtaButton href="/admin/testimonials?filter=all" label="View all testimonials" />
      </div>
    </div>
  )
}

export default async function AdminTestimonialsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminUser()
  const params = await searchParams
  const filterMode = parseFilter(params.filter)
  const sortMode = parseSort(params.sort)
  const searchRaw = typeof params.q === 'string' ? params.q : ''
  const searchTerm = searchRaw.trim()

  const recentCutoff = new Date()
  recentCutoff.setDate(recentCutoff.getDate() - RECENT_DAYS)

  const searchClause: Prisma.BookingInquiryWhereInput | undefined =
    searchTerm.length > 0
      ? {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { testimonialText: { contains: searchTerm, mode: 'insensitive' } },
          ],
        }
      : undefined

  const where: Prisma.BookingInquiryWhereInput = {
    testimonialText: { not: null },
    ...(filterMode === 'approved' ? { testimonialApproved: true } : {}),
    ...(filterMode === 'recent'
      ? {
          testimonialReceivedAt: { gte: recentCutoff },
        }
      : {}),
    ...(searchClause ? searchClause : {}),
  }

  const orderBy: Prisma.BookingInquiryOrderByWithRelationInput[] =
    sortMode === 'event'
      ? [{ eventDate: 'desc' }, { testimonialReceivedAt: 'desc' }]
      : [{ testimonialReceivedAt: 'desc' }, { updatedAt: 'desc' }]

  const [rows, hasAnyRows] = await Promise.all([
    db.bookingInquiry.findMany({
      where,
      select: {
        id: true,
        name: true,
        eventDate: true,
        status: true,
        testimonialText: true,
        testimonialApproved: true,
        testimonialReceivedAt: true,
      },
      orderBy,
    }),
    db.$queryRaw<Array<{ exists: boolean }>>(
      Prisma.sql`
        SELECT EXISTS (
          SELECT 1 FROM booking_inquiries
          WHERE testimonial_text IS NOT NULL AND trim(testimonial_text) <> ''
        ) AS "exists"
      `,
    ),
  ])

  const hasAnyTestimonials = Boolean(hasAnyRows[0]?.exists)
  const items = rows.filter((r) => (r.testimonialText || '').trim().length > 0)

  const filterLabel =
    filterMode === 'all'
      ? 'All saved testimonials'
      : filterMode === 'recent'
        ? `Received in the last ${RECENT_DAYS} days`
        : 'Approved for use only'

  const sortLabel = sortMode === 'event' ? 'Event date (newest first)' : 'Recently received'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white">
        <div className="container mx-auto px-4 py-6">
          <Link href="/admin" className="text-gold text-sm hover:underline">
            ← Admin
          </Link>
          <h1 className="text-2xl font-bold mt-2">Testimonials library</h1>
          <p className="text-gold text-sm mt-1">
            {filterLabel} · {sortLabel}
            {searchTerm ? ` · matching “${searchTerm}”` : ''} · {items.length} item{items.length === 1 ? '' : 's'}
          </p>
          <p className="mt-3">
            <Link
              href="/admin/bookings?testimonial=needed"
              className="text-xs font-semibold text-white/90 underline decoration-white/40 hover:text-gold hover:decoration-gold"
            >
              View bookings needing testimonial follow-up →
            </Link>
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-4">
        <form method="GET" className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-end">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="q" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Search
              </label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={searchRaw}
                placeholder="Client name or testimonial text…"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-navy focus:ring-1 focus:ring-navy"
                autoComplete="off"
              />
            </div>
            <div className="w-full sm:w-44">
              <label htmlFor="filter" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Show
              </label>
              <select
                id="filter"
                name="filter"
                defaultValue={filterMode}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-navy focus:ring-1 focus:ring-navy"
              >
                <option value="approved">Approved only</option>
                <option value="all">All testimonials</option>
                <option value="recent">Recent ({RECENT_DAYS} days)</option>
              </select>
            </div>
            <div className="w-full sm:w-48">
              <label htmlFor="sort" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Sort by
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={sortMode}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-navy focus:ring-1 focus:ring-navy"
              >
                <option value="received">Date received</option>
                <option value="event">Event date</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded-md bg-navy text-white text-sm font-semibold hover:bg-navy/90"
            >
              Apply
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Search matches client name or testimonial body (case-insensitive). Quick filters preserve your search and sort.
          </p>
        </form>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-gray-600">Quick filter:</span>
          <Link
            href={buildTestimonialsHref({ q: searchRaw, filter: 'approved', sort: sortMode })}
            className={`font-semibold ${filterMode === 'approved' ? 'text-navy underline' : 'text-gray-500 hover:text-navy'}`}
          >
            Approved only
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href={buildTestimonialsHref({ q: searchRaw, filter: 'all', sort: sortMode })}
            className={`font-semibold ${filterMode === 'all' ? 'text-navy underline' : 'text-gray-500 hover:text-navy'}`}
          >
            All
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href={buildTestimonialsHref({ q: searchRaw, filter: 'recent', sort: sortMode })}
            className={`font-semibold ${filterMode === 'recent' ? 'text-navy underline' : 'text-gray-500 hover:text-navy'}`}
          >
            Recent
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {items.length === 0 ? (
            <TestimonialsEmptyState
              searchTerm={searchTerm}
              filterMode={filterMode}
              hasAnyTestimonials={hasAnyTestimonials}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Excerpt</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {items.map((row) => {
                    const text = row.testimonialText!.trim()
                    return (
                      <tr key={row.id} className="hover:bg-gray-50/80">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{row.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                          {row.eventDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 max-w-md">
                          <span className="line-clamp-3" title={text}>
                            {excerpt(text)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                              row.testimonialApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {row.testimonialApproved ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <CopyTextButton text={text} />
                            <Link
                              href={`/admin/bookings/${row.id}`}
                              className="text-xs font-semibold text-navy underline hover:text-gold"
                            >
                              Booking
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
