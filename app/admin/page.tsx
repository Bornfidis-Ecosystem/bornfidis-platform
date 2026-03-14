import { headers } from 'next/headers'
import Link from 'next/link'
import { FounderDashboardActivityForm } from '@/components/admin/FounderDashboardActivityForm'
import { FounderDashboardWeeklyRitual } from '@/components/admin/FounderDashboardWeeklyRitual'

export const dynamic = 'force-dynamic'

const DIVISION_COLORS: Record<string, string> = {
  Sportswear: '#CE472E',
  Academy: '#534AB7',
  Provisions: '#002747',
  ProJu: '#3B6D11',
}

interface Metrics {
  revenueThisMonthDollars: number
  leadsThisWeek: number
  emailSubscribers: number
  emailSubscribersLast30Days: number
  conversionActionsThisMonth: number
  activePipelineValueDollars: number
}

interface Divisions {
  sportswear: { ordersThisWeek: number; revenueThisWeekCents: number; topProduct: string | null }
  academy: { totalStudents: number; enrollmentsThisMonth: number; coursesLive: number }
  provisions: { activeBookings: number; pendingLeads: number; nextEventDate: string | null }
  proju: { farmersTotal: number; listingsLive: number; recentApplications: number }
}

interface ActivityItem {
  id: string
  eventType: string
  description: string
  division: string
  createdAt: string
}

export default async function AdminPage() {
  const h = await headers()
  const host = h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  const base = `${proto}://${host}`
  const cookie = h.get('cookie') || ''
  let metrics: Metrics | null = null
  let divisions: Divisions | null = null
  let activity: ActivityItem[] = []

  try {
    const [mRes, dRes, aRes] = await Promise.all([
      fetch(`${base}/api/admin/metrics`, { cache: 'no-store', headers: { cookie } }),
      fetch(`${base}/api/admin/divisions`, { cache: 'no-store', headers: { cookie } }),
      fetch(`${base}/api/admin/activity`, { cache: 'no-store', headers: { cookie } }),
    ])
    if (mRes.ok) metrics = await mRes.json()
    if (dRes.ok) divisions = await dRes.json()
    if (aRes.ok) activity = await aRes.json()
  } catch (e) {
    console.error('[admin/page] fetch error', e)
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  const formatDollars = (dollars: number) =>
    `$${Number(dollars).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formatCurrency = (cents: number) => formatDollars(cents / 100)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="font-semibold text-gray-900">
            BORNFIDIS
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-700">Founder Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500" suppressHydrationWarning>{today}</span>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
            Phase 1
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
        {/* Zone 1 — KPI row (5 metrics that drive revenue) */}
        <section className="min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue This Month</p>
              <p className="text-xl font-bold text-[#1A3C34] mt-1 truncate" title={metrics != null ? formatDollars(metrics.revenueThisMonthDollars) : undefined}>
                {metrics != null ? formatDollars(metrics.revenueThisMonthDollars) : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Paid revenue (Academy, Sportswear, Provisions)</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Leads This Week</p>
              <p className="text-xl font-bold text-[#1A3C34] mt-1">
                {metrics != null ? metrics.leadsThisWeek : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">New inquiries, subscribers, farmers (7 days)</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Subscribers</p>
              <p className="text-xl font-bold text-[#1A3C34] mt-1">
                {metrics != null ? metrics.emailSubscribers : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {metrics != null && metrics.emailSubscribersLast30Days > 0
                  ? `+${metrics.emailSubscribersLast30Days} in last 30 days`
                  : 'Total list size'}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Conversion Actions</p>
              <p className="text-xl font-bold text-[#1A3C34] mt-1">
                {metrics != null ? metrics.conversionActionsThisMonth : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Purchases, enrollments, paid orders (this month)</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Pipeline Value</p>
              <p className="text-xl font-bold text-[#1A3C34] mt-1 truncate" title={metrics != null ? formatDollars(metrics.activePipelineValueDollars) : undefined}>
                {metrics != null ? formatDollars(metrics.activePipelineValueDollars) : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Open opportunities with quoted value</p>
            </div>
          </div>
        </section>

        {/* Zone 2 — Division grid */}
        <section className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Divisions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {divisions && (
              <>
                <div
                  className="bg-white border border-gray-200 rounded-lg p-4 border-l-4 min-w-0"
                  style={{ borderLeftColor: DIVISION_COLORS.Sportswear }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-semibold text-gray-900 truncate">Sportswear</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 shrink-0">Live</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 break-words">
                    <p>Orders this week: {divisions.sportswear.ordersThisWeek}</p>
                    <p>Revenue: {formatCurrency(divisions.sportswear.revenueThisWeekCents)}</p>
                    <p>Top: {divisions.sportswear.topProduct ?? '—'}</p>
                  </div>
                </div>
                <div
                  className="bg-white border border-gray-200 rounded-lg p-4 border-l-4 min-w-0"
                  style={{ borderLeftColor: DIVISION_COLORS.Academy }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-semibold text-gray-900 truncate">Academy</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 shrink-0">Live</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 break-words">
                    <p>Students: {divisions.academy.totalStudents}</p>
                    <p>Enrollments this month: {divisions.academy.enrollmentsThisMonth}</p>
                    <p>Courses live: {divisions.academy.coursesLive}</p>
                  </div>
                </div>
                <div
                  className="bg-white border border-gray-200 rounded-lg p-4 border-l-4 min-w-0"
                  style={{ borderLeftColor: DIVISION_COLORS.Provisions }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-semibold text-gray-900 truncate">Provisions</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 shrink-0">Live</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 break-words">
                    <p>Active bookings: {divisions.provisions.activeBookings}</p>
                    <p>Pending leads: {divisions.provisions.pendingLeads}</p>
                    <p>Next event: {divisions.provisions.nextEventDate ?? '—'}</p>
                  </div>
                </div>
                <div
                  className="bg-white border border-gray-200 rounded-lg p-4 border-l-4 min-w-0"
                  style={{ borderLeftColor: DIVISION_COLORS.ProJu }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-semibold text-gray-900 truncate">ProJu</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 shrink-0">Live</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 break-words">
                    <p>Farmers: {divisions.proju.farmersTotal}</p>
                    <p>Listings live: {divisions.proju.listingsLive}</p>
                    <p>Recent applications: {divisions.proju.recentApplications}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Zone 3 — Activity feed (extra padding so notification doesn't overlap form) */}
        <section className="min-w-0 pb-24 md:pb-20">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Activity
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4 min-w-0">
            <ul className="space-y-2">
              {activity.length === 0 ? (
                <li className="text-sm text-gray-500">No events yet.</li>
              ) : (
                activity.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 text-sm">
                    <span
                      className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: DIVISION_COLORS[item.division] ?? '#888' }}
                      aria-hidden
                    />
                    <span className="text-gray-500 shrink-0">
                      {new Date(item.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-gray-800">{item.description}</span>
                  </li>
                ))
              )}
            </ul>
            <FounderDashboardActivityForm />
          </div>
        </section>

        {/* Zone 4 — Weekly ritual */}
        <section className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Weekly ritual
          </h2>
          <FounderDashboardWeeklyRitual />
        </section>
      </div>
    </div>
  )
}
