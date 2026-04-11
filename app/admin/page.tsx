import Link from 'next/link'
import { FounderDashboardActivityForm } from '@/components/admin/FounderDashboardActivityForm'
import { FounderDashboardActivityFeed } from '@/components/admin/FounderDashboardActivityFeed'
import { FounderDashboardWeeklyRitual } from '@/components/admin/FounderDashboardWeeklyRitual'
import ActionNeededSection from '@/components/admin/ActionNeededSection'
import PrepAttentionSection from '@/components/admin/PrepAttentionSection'
import { formatUSD } from '@/lib/money'
import { getAdminDashboardMetrics } from '@/lib/admin-dashboard-metrics'
import { getAdminActionNeeded } from '@/lib/admin-action-needed'
import { getPrepAttentionNeeded } from '@/lib/admin-prep-attention'
import { getFounderDashboardMetrics } from '@/lib/founder-dashboard-metrics'
import { getFounderDashboardTrends } from '@/lib/founder-dashboard-trends'
import { getAdminDivisionsData } from '@/lib/admin-divisions-data'
import { getAdminActivityFeedItems } from '@/lib/admin-activity-data'
import { getAdminPaymentHealth } from '@/lib/admin-payment-health'
import PaymentHealthSection from '@/components/admin/PaymentHealthSection'

export const dynamic = 'force-dynamic'

const DIVISION_COLORS: Record<string, string> = {
  Sportswear: '#CE472E',
  Academy: '#534AB7',
  Provisions: '#002747',
  ProJu: '#3B6D11',
}

const DIVISION_BORDER_LEFT_CLASSES: Record<string, string> = {
  Sportswear: 'border-l-[#CE472E]',
  Academy: 'border-l-[#534AB7]',
  Provisions: 'border-l-[#002747]',
  ProJu: 'border-l-[#3B6D11]',
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
  type: string
  title: string
  description: string
  division: string
  createdAt: string
  metadata?: Record<string, unknown>
}

interface RevenuePeriod {
  totalCents: number
  academyCents: number
  provisionsCents: number
  sportswearCents: number
}

interface FunnelStage {
  id: string
  label: string
  count: number
  conversionFromPrevious?: number
}

interface EmailGrowthWeek {
  weekStart: string
  weekLabel: string
  count: number
  cumulative?: number
}

interface Trends {
  revenueTrend: { last30Days: RevenuePeriod; last90Days: RevenuePeriod }
  provisionsFunnel: FunnelStage[]
  emailGrowth: EmailGrowthWeek[]
}

export default async function AdminPage() {
  let metrics: Metrics | null = null
  let divisions: Divisions | null = null
  let activity: ActivityItem[] = []
  let trends: Trends | null = null
  let dashboardMetrics = null as Awaited<ReturnType<typeof getAdminDashboardMetrics>> | null
  let actionNeeded = null as Awaited<ReturnType<typeof getAdminActionNeeded>> | null
  let prepAttention = null as Awaited<ReturnType<typeof getPrepAttentionNeeded>> | null
  let paymentHealth = null as Awaited<ReturnType<typeof getAdminPaymentHealth>> | null

  // Load in-process (no self-fetch to /api/admin/*): avoids duplicate work and DB spikes.
  // Run founder KPIs before other loaders so two heavy Prisma batches don't overlap (Supabase session pool).
  try {
    const m = await getFounderDashboardMetrics()
    metrics = {
      revenueThisMonthDollars: m.revenueThisMonthDollars,
      leadsThisWeek: m.leadsThisWeek,
      emailSubscribers: m.emailSubscribers,
      emailSubscribersLast30Days: m.emailSubscribersLast30Days,
      conversionActionsThisMonth: m.conversionActionsThisMonth,
      activePipelineValueDollars: m.activePipelineValueDollars,
    }
  } catch (e) {
    console.error('[admin/page] founder metrics', e)
  }

  const settled = await Promise.allSettled([
    getAdminDivisionsData(),
    getAdminActivityFeedItems(),
    getFounderDashboardTrends(),
    getAdminDashboardMetrics(),
    getAdminActionNeeded(),
    getPrepAttentionNeeded(),
  ])
  const [r1, r2, r3, r4, r5, r6] = settled
  if (r1.status === 'fulfilled') divisions = r1.value
  else console.error('[admin/page] divisions', r1.reason)
  if (r2.status === 'fulfilled') activity = r2.value
  else console.error('[admin/page] activity', r2.reason)
  if (r3.status === 'fulfilled') trends = r3.value
  else console.error('[admin/page] trends', r3.reason)
  if (r4.status === 'fulfilled') dashboardMetrics = r4.value
  else console.error('[admin/page] dashboard metrics', r4.reason)
  if (r5.status === 'fulfilled') actionNeeded = r5.value
  else console.error('[admin/page] action needed', r5.reason)
  if (r6.status === 'fulfilled') prepAttention = r6.value
  else console.error('[admin/page] prep attention', r6.reason)

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  const formatDollars = (dollars: number) =>
    `$${Number(dollars).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formatCurrency = (cents: number) => formatDollars(cents / 100)

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Topbar — editorial, timeless */}
      <div className="border-b border-stone-200 bg-white/95 backdrop-blur-sm px-4 py-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <Link
              href="/admin"
              className="text-[#1A3C34] font-semibold tracking-[0.2em] uppercase text-sm"
            >
              Bornfidis
            </Link>
            <span className="text-stone-300 font-light">/</span>
            <span className="text-stone-600 font-medium">Founder Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500 tabular-nums" suppressHydrationWarning>
              {today}
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#1A3C34] text-white tracking-wide">
              Phase 1
            </span>
            <Link
              href="/admin/quotes"
              className="hidden sm:inline-flex items-center justify-center rounded-xl bg-gold px-5 py-2.5 font-semibold text-navy hover:opacity-90 transition"
            >
              Open Quote Builder
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-10">
        {/* Zone 1 — KPI row: clear hierarchy, tabular numbers, forest accent */}
        <section className="min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              {
                label: 'Revenue This Month',
                value: metrics != null ? formatDollars(metrics.revenueThisMonthDollars) : null,
                sub: 'Paid revenue (Academy, Sportswear, Provisions)',
              },
              {
                label: 'Leads This Week',
                value: metrics != null ? String(metrics.leadsThisWeek) : null,
                sub: 'New inquiries, subscribers, farmers (7 days)',
              },
              {
                label: 'Email Subscribers',
                value: metrics != null ? String(metrics.emailSubscribers) : null,
                sub:
                  metrics != null && metrics.emailSubscribersLast30Days > 0
                    ? `+${metrics.emailSubscribersLast30Days} in last 30 days`
                    : 'Total list size',
              },
              {
                label: 'Conversion Actions',
                value: metrics != null ? String(metrics.conversionActionsThisMonth) : null,
                sub: 'Purchases, enrollments, paid orders (this month)',
              },
              {
                label: 'Active Pipeline Value',
                value: metrics != null ? formatDollars(metrics.activePipelineValueDollars) : null,
                sub: 'Open opportunities with quoted value',
              },
            ].map(({ label, value, sub }) => (
              <div
                key={label}
                className="bg-white border border-stone-200/80 rounded-xl p-5 min-w-0 border-t-2 border-t-[#1A3C34]"
              >
                <p className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">
                  {label}
                </p>
                <p
                  className="mt-2 font-serif text-2xl font-semibold text-[#1A3C34] tabular-nums truncate"
                  title={value ?? undefined}
                >
                  {value ?? '—'}
                </p>
                <p className="mt-1 text-xs text-stone-400 leading-snug">{sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Zone 1.25 — Provisions dashboard metrics */}
        <section className="min-w-0">
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-[0.2em] mb-5 pb-2 border-b border-stone-200">
            Provisions Dashboard Metrics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {[
              { label: 'New Leads', value: dashboardMetrics?.pipeline.newLeads },
              { label: 'Quoted', value: dashboardMetrics?.pipeline.quoted },
              { label: 'Awaiting Deposit', value: dashboardMetrics?.pipeline.awaitingDeposit },
              { label: 'Confirmed', value: dashboardMetrics?.pipeline.confirmed },
              { label: 'Completed', value: dashboardMetrics?.pipeline.completed },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-stone-200/80 bg-white p-4">
                <p className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">{item.label}</p>
                <p className="mt-2 font-serif text-2xl font-semibold text-navy tabular-nums">{item.value ?? '—'}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Quoted Revenue', value: dashboardMetrics ? formatUSD(dashboardMetrics.revenue.totalQuotedRevenueCents) : '—' },
              { label: 'Confirmed Revenue', value: dashboardMetrics ? formatUSD(dashboardMetrics.revenue.confirmedRevenueCents) : '—' },
              { label: 'Deposits Collected', value: dashboardMetrics ? formatUSD(dashboardMetrics.revenue.depositsCollectedCents) : '—' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-stone-200/80 bg-white p-4">
                <p className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">{item.label}</p>
                <p className="mt-2 font-serif text-xl font-semibold text-[#1A3C34] tabular-nums">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Bookings Created This Week', value: dashboardMetrics?.weekly.bookingsCreated },
              { label: 'Quotes Created This Week', value: dashboardMetrics?.weekly.quotesCreated },
              { label: 'Deposits Received This Week', value: dashboardMetrics?.weekly.depositsReceived },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-stone-200/80 bg-white p-4">
                <p className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">{item.label}</p>
                <p className="mt-2 font-serif text-2xl font-semibold text-navy tabular-nums">{item.value ?? '—'}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-stone-200/80 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-semibold text-navy">Upcoming bookings (next 7 days)</h3>
              <Link
                href="/admin/bookings?upcoming=7"
                className="text-xs font-semibold text-navy hover:underline shrink-0"
              >
                View all in bookings →
              </Link>
            </div>
            {!dashboardMetrics || dashboardMetrics.upcoming.length === 0 ? (
              <p className="text-sm text-stone-500">No upcoming bookings in the next 7 days.</p>
            ) : (
              <div className="space-y-2">
                {dashboardMetrics.upcoming.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/admin/bookings/${booking.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-200 px-3 py-2 hover:bg-stone-50 transition"
                  >
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{booking.name}</p>
                      <p className="text-xs text-stone-600">
                        {booking.eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {booking.eventType || 'Event'}
                      </p>
                    </div>
                    <span className="text-xs font-medium rounded-full bg-stone-100 text-stone-700 px-2.5 py-1">{booking.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Payment throughput + pending (Provisions / Stripe truth) */}
        <PaymentHealthSection data={paymentHealth} />

        {/* Zone 1.35 — Action Needed */}
        <ActionNeededSection actionNeeded={actionNeeded} />

        {/* Zone 1.36 — Prep execution readiness (checklist gates, next 7 days) */}
        <PrepAttentionSection rows={prepAttention} />

        {/* Zone 1.5 — Provisions Quote Builder quick launch */}
        <section className="min-w-0">
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-[0.2em] mb-5 pb-2 border-b border-stone-200">
            Provisions Quote Builder
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Link
              href="/admin/quotes"
              className="group rounded-2xl border border-navy/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md lg:col-span-1"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-navy">Provisions Quote Builder</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Generate client-ready quotes, deposit totals, and copy-ready WhatsApp and email replies.
                  </p>
                </div>

                <div className="rounded-xl bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">New</div>
              </div>

              <div className="mt-4 inline-flex items-center text-sm font-semibold text-navy group-hover:text-gold">
                Open Quote Builder →
              </div>
            </Link>
          </div>
        </section>

        {/* Zone 2 — Revenue Trend (30d / 90d) */}
        <section className="min-w-0">
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-[0.2em] mb-5 pb-2 border-b border-stone-200">
            Revenue trend
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {trends && (
              <>
                <div className="bg-white border border-stone-200/80 rounded-xl p-5 border-t-2 border-t-[#1A3C34]">
                  <p className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">Last 30 days</p>
                  <p className="mt-2 font-serif text-xl font-semibold text-[#1A3C34] tabular-nums">
                    {formatDollars((trends.revenueTrend.last30Days.totalCents ?? 0) / 100)}
                  </p>
                  <div className="mt-3 space-y-1.5 text-sm text-stone-600">
                    <p>Academy: {formatCurrency(trends.revenueTrend.last30Days.academyCents ?? 0)}</p>
                    <p>Provisions: {formatCurrency(trends.revenueTrend.last30Days.provisionsCents ?? 0)}</p>
                    <p>Sportswear: {formatCurrency(trends.revenueTrend.last30Days.sportswearCents ?? 0)}</p>
                  </div>
                </div>
                <div className="bg-white border border-stone-200/80 rounded-xl p-5 border-t-2 border-t-[#1A3C34]">
                  <p className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">Last 90 days</p>
                  <p className="mt-2 font-serif text-xl font-semibold text-[#1A3C34] tabular-nums">
                    {formatDollars((trends.revenueTrend.last90Days.totalCents ?? 0) / 100)}
                  </p>
                  <div className="mt-3 space-y-1.5 text-sm text-stone-600">
                    <p>Academy: {formatCurrency(trends.revenueTrend.last90Days.academyCents ?? 0)}</p>
                    <p>Provisions: {formatCurrency(trends.revenueTrend.last90Days.provisionsCents ?? 0)}</p>
                    <p>Sportswear: {formatCurrency(trends.revenueTrend.last90Days.sportswearCents ?? 0)}</p>
                  </div>
                </div>
              </>
            )}
            {!trends && (
              <div className="bg-white border border-stone-200/80 rounded-xl p-5 text-stone-400 text-sm">
                Revenue trend unavailable
              </div>
            )}
          </div>
        </section>

        {/* Zone 3 — Divisions: colored accent, subtle depth */}
        <section className="min-w-0">
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-[0.2em] mb-5 pb-2 border-b border-stone-200">
            Divisions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {divisions && (
              <>
                {[
                  {
                    key: 'Sportswear',
                    borderLeftClass: DIVISION_BORDER_LEFT_CLASSES.Sportswear,
                    title: 'Sportswear',
                    lines: [
                      `Orders this week: ${divisions.sportswear.ordersThisWeek}`,
                      `Revenue: ${formatCurrency(divisions.sportswear.revenueThisWeekCents)}`,
                      `Top: ${divisions.sportswear.topProduct ?? '—'}`,
                    ],
                  },
                  {
                    key: 'Academy',
                    borderLeftClass: DIVISION_BORDER_LEFT_CLASSES.Academy,
                    title: 'Academy',
                    lines: [
                      `Students: ${divisions.academy.totalStudents}`,
                      `Enrollments this month: ${divisions.academy.enrollmentsThisMonth}`,
                      `Courses live: ${divisions.academy.coursesLive}`,
                    ],
                  },
                  {
                    key: 'Provisions',
                    borderLeftClass: DIVISION_BORDER_LEFT_CLASSES.Provisions,
                    title: 'Provisions',
                    lines: [
                      `Active bookings: ${divisions.provisions.activeBookings}`,
                      `Pending leads: ${divisions.provisions.pendingLeads}`,
                      `Next event: ${divisions.provisions.nextEventDate ?? '—'}`,
                    ],
                  },
                  {
                    key: 'ProJu',
                    borderLeftClass: DIVISION_BORDER_LEFT_CLASSES.ProJu,
                    title: 'ProJu',
                    lines: [
                      `Farmers: ${divisions.proju.farmersTotal}`,
                      `Listings live: ${divisions.proju.listingsLive}`,
                      `Recent applications: ${divisions.proju.recentApplications}`,
                    ],
                  },
                ].map(({ key, borderLeftClass, title, lines }) => (
                  <div
                    key={key}
                    className={`bg-white border border-stone-200/80 rounded-xl p-5 min-w-0 border-l-4 ${borderLeftClass}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-semibold text-stone-900 truncate">{title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600 shrink-0 uppercase tracking-wider">
                        Live
                      </span>
                    </div>
                    <div className="text-sm text-stone-600 space-y-1.5 break-words">
                      {lines.map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>

        {/* Zone 4 — Provisions funnel summary */}
        <section className="min-w-0">
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-[0.2em] mb-5 pb-2 border-b border-stone-200 flex items-center justify-between gap-2 flex-wrap">
            <span>Provisions funnel</span>
            <Link href="/admin/provisions-pipeline" className="text-xs font-medium text-[#1A3C34] hover:underline">
              View pipeline →
            </Link>
          </h2>
          <div className="bg-white border border-stone-200/80 rounded-xl p-5">
            {trends && trends.provisionsFunnel.length > 0 ? (
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                {trends.provisionsFunnel.map((stage, i) => (
                  <div key={stage.id} className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-stone-700">{stage.label}</span>
                    <span className="font-serif text-lg font-semibold text-[#1A3C34] tabular-nums">{stage.count}</span>
                    {stage.conversionFromPrevious != null && (
                      <span className="text-xs text-stone-500">({stage.conversionFromPrevious}% from previous)</span>
                    )}
                    {i < trends.provisionsFunnel.length - 1 && (
                      <span className="text-stone-300 hidden sm:inline" aria-hidden>·</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-500">No funnel data</p>
            )}
          </div>
        </section>

        {/* Zone 5 — Email growth (last 8 weeks) */}
        <section className="min-w-0">
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-[0.2em] mb-5 pb-2 border-b border-stone-200">
            Email subscriber growth
          </h2>
          <div className="bg-white border border-stone-200/80 rounded-xl p-5">
            {trends && trends.emailGrowth.length > 0 ? (
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {trends.emailGrowth.map((w) => (
                  <div key={w.weekStart} className="flex items-baseline gap-2">
                    <span className="text-xs text-stone-500 tabular-nums">{w.weekLabel}</span>
                    <span className="font-semibold text-[#1A3C34] tabular-nums">+{w.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-500">No growth data</p>
            )}
          </div>
        </section>

        {/* Zone 6 — Live Activity Feed (polls every 30s) */}
        <section className="min-w-0 pb-24 md:pb-20">
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-[0.2em] mb-5 pb-2 border-b border-stone-200">
            Activity
          </h2>
          <div className="bg-white border border-stone-200/80 rounded-xl p-5 min-w-0">
            <FounderDashboardActivityFeed initialActivity={activity} />
            <FounderDashboardActivityForm />
          </div>
        </section>

        {/* Zone 7 — Weekly ritual */}
        <section className="min-w-0">
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-[0.2em] mb-5 pb-2 border-b border-stone-200">
            Weekly ritual
          </h2>
          <FounderDashboardWeeklyRitual />
        </section>
      </div>
    </div>
  )
}
