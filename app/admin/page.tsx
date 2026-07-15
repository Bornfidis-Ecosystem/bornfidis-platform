import Link from 'next/link'
import { CulinaryCard, CulinaryPageHeader } from '@/components/culinary-os'
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
import { isFounderAdminRole, resolveAdminPlatformRole } from '@/lib/admin-rbac'
import { canViewPlatformFinancials } from '@/lib/ops-coordinator-access'
import { chartColors } from '@/lib/design-tokens'

export const dynamic = 'force-dynamic'

const DIVISION_COLORS: Record<string, string> = {
  Sportswear: chartColors.sportswear,
  Academy: chartColors.academy,
  Provisions: chartColors.provisions,
  ProJu: chartColors.proju,
}

const DIVISION_BORDER_LEFT_CLASSES: Record<string, string> = {
  Sportswear: 'border-l-[#CE472E]',
  Academy: 'border-l-[#33526C]',
  Provisions: 'border-l-[#002747]',
  ProJu: 'border-l-[#FFBC00]',
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
  let platformRole: Awaited<ReturnType<typeof resolveAdminPlatformRole>> = null
  try {
    platformRole = await resolveAdminPlatformRole()
  } catch (e) {
    console.error('[admin/page] resolveAdminPlatformRole', e)
  }
  const showFounderOnly = isFounderAdminRole(platformRole)
  const showFinancials = canViewPlatformFinancials(platformRole)

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
    if (showFounderOnly) {
      const m = await getFounderDashboardMetrics()
      metrics = {
        revenueThisMonthDollars: m.revenueThisMonthDollars,
        leadsThisWeek: m.leadsThisWeek,
        emailSubscribers: m.emailSubscribers,
        emailSubscribersLast30Days: m.emailSubscribersLast30Days,
        conversionActionsThisMonth: m.conversionActionsThisMonth,
        activePipelineValueDollars: m.activePipelineValueDollars,
      }
    }
  } catch (e) {
    console.error('[admin/page] founder metrics', e)
  }

  try {
    if (showFounderOnly) {
      paymentHealth = await getAdminPaymentHealth()
    }
  } catch (e) {
    console.error('[admin/page] payment health', e)
  }

  const trendPromise = showFounderOnly ? getFounderDashboardTrends() : Promise.resolve(null as Trends | null)
  const activityFeedPromise = showFounderOnly ? getAdminActivityFeedItems() : Promise.resolve([] as ActivityItem[])

  const settled = await Promise.allSettled([
    getAdminDivisionsData(),
    activityFeedPromise,
    trendPromise,
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

  const sectionHeading =
    'mb-5 border-b border-culinary-outline pb-2 font-culinary-sans text-label-caps uppercase tracking-[0.1em] text-culinary-text-muted'

  return (
    <div className="min-h-screen space-y-stack-xl bg-culinary-bone">
      <CulinaryPageHeader
        title={
          showFounderOnly ? 'Command View' : showFinancials ? 'Operations' : 'Event Operations'
        }
        description={
          showFounderOnly
            ? 'A unified operational perspective for Bornfidis executive culinary management.'
            : showFinancials
              ? 'Pipeline, bookings, and calendar for day-to-day culinary operations.'
              : 'Upcoming events, prep readiness, and hospitality logistics — no financial data.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="font-culinary-sans text-body-md text-culinary-text-muted tabular-nums"
              suppressHydrationWarning
            >
              {today}
            </span>
            <span className="rounded-none border border-culinary-outline bg-culinary-surface-low px-2 py-1 font-culinary-sans text-[10px] font-bold uppercase tracking-[0.12em] text-culinary-navy">
              Phase 1
            </span>
            {showFinancials ? (
              <Link
                href="/admin/bookings"
                className="hidden sm:inline-flex items-center justify-center rounded-none bg-culinary-navy px-5 py-2.5 font-culinary-sans text-label-caps uppercase tracking-[0.1em] text-culinary-on-navy transition-colors hover:bg-culinary-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-culinary-gold"
              >
                Bookings
              </Link>
            ) : null}
          </div>
        }
      />
        {!showFounderOnly && (
          <div className="rounded-none border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
            <p className="font-medium">{showFinancials ? 'Operations view' : 'Operations Coordinator view'}</p>
            <p className="mt-1 text-amber-900/90">
              {showFinancials
                ? 'Company-wide revenue, payment health, and founder activity tools are hidden. Use Bookings, Calendar, and Pipeline for day-to-day work.'
                : 'Hospitality execution only: bookings, calendar, prep, timelines, and client notes. Revenue, deposits, Stripe, payouts, and cost dashboards are not available on this role.'}
            </p>
          </div>
        )}

        {/* Zone 1 — KPI row (founder_admin only) */}
        {showFounderOnly && (
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
                <CulinaryCard key={label} className="min-w-0 border-t-2 border-t-culinary-navy">
                  <p className="font-culinary-sans text-[11px] font-bold uppercase tracking-[0.12em] text-culinary-text-muted">
                    {label}
                  </p>
                  <p
                    className="mt-2 truncate font-culinary-display text-2xl font-semibold tabular-nums text-culinary-navy"
                    title={value ?? undefined}
                  >
                    {value ?? '—'}
                  </p>
                  <p className="mt-1 font-culinary-sans text-xs leading-snug text-culinary-text-muted">{sub}</p>
                </CulinaryCard>
              ))}
            </div>
          </section>
        )}

        {/* Zone 1.25 — Provisions dashboard metrics */}
        <section className="min-w-0">
          <h2 className={sectionHeading}>Provisions Dashboard Metrics</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              { label: 'New Leads', value: dashboardMetrics?.pipeline.newLeads },
              { label: 'Quoted', value: dashboardMetrics?.pipeline.quoted },
              { label: 'Awaiting Deposit', value: dashboardMetrics?.pipeline.awaitingDeposit },
              { label: 'Confirmed', value: dashboardMetrics?.pipeline.confirmed },
              { label: 'Completed', value: dashboardMetrics?.pipeline.completed },
            ].map((item) => (
              <CulinaryCard key={item.label}>
                <p className="font-culinary-sans text-[11px] font-bold uppercase tracking-[0.12em] text-culinary-text-muted">
                  {item.label}
                </p>
                <p className="mt-2 font-culinary-display text-2xl font-semibold tabular-nums text-culinary-navy">
                  {item.value ?? '—'}
                </p>
              </CulinaryCard>
            ))}
          </div>

          {showFounderOnly && (
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { label: 'Total Quoted Revenue', value: dashboardMetrics ? formatUSD(dashboardMetrics.revenue.totalQuotedRevenueCents) : '—' },
                { label: 'Confirmed Revenue', value: dashboardMetrics ? formatUSD(dashboardMetrics.revenue.confirmedRevenueCents) : '—' },
                { label: 'Deposits Collected', value: dashboardMetrics ? formatUSD(dashboardMetrics.revenue.depositsCollectedCents) : '—' },
              ].map((item) => (
                <CulinaryCard key={item.label}>
                  <p className="font-culinary-sans text-[11px] font-bold uppercase tracking-[0.12em] text-culinary-text-muted">
                    {item.label}
                  </p>
                  <p className="mt-2 font-culinary-display text-xl font-semibold tabular-nums text-culinary-navy">{item.value}</p>
                </CulinaryCard>
              ))}
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { label: 'Bookings Created This Week', value: dashboardMetrics?.weekly.bookingsCreated },
              { label: 'Quotes Created This Week', value: dashboardMetrics?.weekly.quotesCreated },
              ...(showFinancials
                ? [{ label: 'Deposits Received This Week', value: dashboardMetrics?.weekly.depositsReceived }]
                : []),
            ].map((item) => (
              <CulinaryCard key={item.label}>
                <p className="font-culinary-sans text-[11px] font-bold uppercase tracking-[0.12em] text-culinary-text-muted">
                  {item.label}
                </p>
                <p className="mt-2 font-culinary-display text-2xl font-semibold tabular-nums text-culinary-navy">{item.value ?? '—'}</p>
              </CulinaryCard>
            ))}
          </div>

          <CulinaryCard className="mt-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-culinary-sans text-sm font-semibold text-culinary-navy">Upcoming bookings (next 7 days)</h3>
              <Link
                href="/admin/bookings?upcoming=7"
                className="shrink-0 font-culinary-sans text-xs font-semibold text-culinary-navy underline decoration-culinary-gold-line underline-offset-2 hover:text-culinary-text-muted"
              >
                View all in bookings →
              </Link>
            </div>
            {!dashboardMetrics || dashboardMetrics.upcoming.length === 0 ? (
              <p className="font-culinary-sans text-sm text-culinary-text-muted">No upcoming bookings in the next 7 days.</p>
            ) : (
              <div className="space-y-2">
                {dashboardMetrics.upcoming.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/admin/bookings/${booking.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-none border border-culinary-outline px-3 py-2 transition refined hover:border-culinary-gold-line hover:bg-culinary-surface-low"
                  >
                    <div>
                      <p className="font-culinary-sans text-sm font-semibold text-culinary-ink">{booking.name}</p>
                      <p className="font-culinary-sans text-xs text-culinary-text-muted">
                        {booking.eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ·{' '}
                        {booking.eventType || 'Event'}
                      </p>
                    </div>
                    <span className="rounded-none border border-culinary-outline bg-culinary-surface-high px-2.5 py-1 font-culinary-sans text-xs font-medium text-culinary-ink">
                      {booking.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CulinaryCard>
        </section>

        {/* Payment throughput + pending (founder_admin only) */}
        {showFounderOnly && <PaymentHealthSection data={paymentHealth} />}

        {/* Zone 1.35 — Action Needed */}
        <ActionNeededSection actionNeeded={actionNeeded} />

        {/* Zone 1.36 — Prep execution readiness (checklist gates, next 7 days) */}
        <PrepAttentionSection rows={prepAttention} />

        {/* Zone 1.5 — Live quote path (financial roles only) */}
        {showFinancials ? (
        <section className="min-w-0">
          <h2 className={sectionHeading}>Quotes & deposits</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <CulinaryCard
              as={Link}
              href="/admin/bookings"
              className="group block transition refined hover:border-culinary-gold-line hover:bg-culinary-surface-low lg:col-span-1"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-culinary-display text-lg font-semibold text-culinary-navy">Booking quotes</h3>
                  <p className="mt-2 font-culinary-sans text-sm leading-6 text-culinary-text-muted">
                    Save line items and deposits on a booking, then send portal or Stripe deposit links (live money path).
                  </p>
                </div>
              </div>

              <div className="mt-4 inline-flex items-center font-culinary-sans text-sm font-semibold text-culinary-navy group-hover:text-culinary-gold">
                Open bookings →
              </div>
            </CulinaryCard>
          </div>
        </section>
        ) : null}

        {/* Zone 2 — Revenue Trend (founder_admin only) */}
        {showFounderOnly && (
          <section className="min-w-0">
            <h2 className={sectionHeading}>Revenue trend</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {trends && (
                <>
                  <CulinaryCard className="border-t-2 border-t-culinary-navy">
                    <p className="font-culinary-sans text-[11px] font-bold uppercase tracking-[0.12em] text-culinary-text-muted">
                      Last 30 days
                    </p>
                    <p className="mt-2 font-culinary-display text-xl font-semibold tabular-nums text-culinary-navy">
                      {formatDollars((trends.revenueTrend.last30Days.totalCents ?? 0) / 100)}
                    </p>
                    <div className="mt-3 space-y-1.5 font-culinary-sans text-sm text-culinary-text-muted">
                      <p>Academy: {formatCurrency(trends.revenueTrend.last30Days.academyCents ?? 0)}</p>
                      <p>Provisions: {formatCurrency(trends.revenueTrend.last30Days.provisionsCents ?? 0)}</p>
                      <p>Sportswear: {formatCurrency(trends.revenueTrend.last30Days.sportswearCents ?? 0)}</p>
                    </div>
                  </CulinaryCard>
                  <CulinaryCard className="border-t-2 border-t-culinary-navy">
                    <p className="font-culinary-sans text-[11px] font-bold uppercase tracking-[0.12em] text-culinary-text-muted">
                      Last 90 days
                    </p>
                    <p className="mt-2 font-culinary-display text-xl font-semibold tabular-nums text-culinary-navy">
                      {formatDollars((trends.revenueTrend.last90Days.totalCents ?? 0) / 100)}
                    </p>
                    <div className="mt-3 space-y-1.5 font-culinary-sans text-sm text-culinary-text-muted">
                      <p>Academy: {formatCurrency(trends.revenueTrend.last90Days.academyCents ?? 0)}</p>
                      <p>Provisions: {formatCurrency(trends.revenueTrend.last90Days.provisionsCents ?? 0)}</p>
                      <p>Sportswear: {formatCurrency(trends.revenueTrend.last90Days.sportswearCents ?? 0)}</p>
                    </div>
                  </CulinaryCard>
                </>
              )}
              {!trends && (
                <CulinaryCard className="font-culinary-sans text-sm text-culinary-text-muted md:col-span-2">
                  Revenue trend unavailable
                </CulinaryCard>
              )}
            </div>
          </section>
        )}

        {/* Zone 3 — Divisions (financial roles only — includes revenue) */}
        {showFinancials ? (
        <section className="min-w-0">
          <h2 className={sectionHeading}>Divisions</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                  <CulinaryCard key={key} className={`min-w-0 border-l-4 ${borderLeftClass}`}>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="truncate font-culinary-sans font-semibold text-culinary-ink">{title}</span>
                      <span className="shrink-0 rounded-none border border-culinary-outline bg-culinary-surface-high px-2 py-0.5 font-culinary-sans text-[10px] font-medium uppercase tracking-wider text-culinary-text-muted">
                        Live
                      </span>
                    </div>
                    <div className="space-y-1.5 break-words font-culinary-sans text-sm text-culinary-text-muted">
                      {lines.map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </CulinaryCard>
                ))}
              </>
            )}
          </div>
        </section>
        ) : null}

        {/* Zone 4 — Provisions funnel summary */}
        <section className="min-w-0">
          <h2 className={`${sectionHeading} flex flex-wrap items-center justify-between gap-2`}>
            <span>Provisions funnel</span>
            <Link
              href="/admin/provisions-pipeline"
              className="font-culinary-sans text-xs font-medium text-culinary-navy underline decoration-culinary-gold-line underline-offset-2 hover:text-culinary-text-muted"
            >
              View pipeline →
            </Link>
          </h2>
          <CulinaryCard>
            {trends && trends.provisionsFunnel.length > 0 ? (
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                {trends.provisionsFunnel.map((stage, i) => (
                  <div key={stage.id} className="flex items-baseline gap-2">
                    <span className="font-culinary-sans text-sm font-medium text-culinary-ink">{stage.label}</span>
                    <span className="font-culinary-display text-lg font-semibold tabular-nums text-culinary-navy">
                      {stage.count}
                    </span>
                    {stage.conversionFromPrevious != null && (
                      <span className="font-culinary-sans text-xs text-culinary-text-muted">
                        ({stage.conversionFromPrevious}% from previous)
                      </span>
                    )}
                    {i < trends.provisionsFunnel.length - 1 && (
                      <span className="hidden text-culinary-outline-variant sm:inline" aria-hidden>
                        ·
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-culinary-sans text-sm text-culinary-text-muted">No funnel data</p>
            )}
          </CulinaryCard>
        </section>

        {/* Zone 5 — Email growth (founder_admin only) */}
        {showFounderOnly && (
          <section className="min-w-0">
            <h2 className={sectionHeading}>Email subscriber growth</h2>
            <CulinaryCard>
              {trends && trends.emailGrowth.length > 0 ? (
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {trends.emailGrowth.map((w) => (
                    <div key={w.weekStart} className="flex items-baseline gap-2">
                      <span className="font-culinary-sans text-xs tabular-nums text-culinary-text-muted">{w.weekLabel}</span>
                      <span className="font-semibold tabular-nums text-culinary-navy">+{w.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-culinary-sans text-sm text-culinary-text-muted">No growth data</p>
              )}
            </CulinaryCard>
          </section>
        )}

        {/* Zone 6 — Live Activity Feed (founder_admin only) */}
        {showFounderOnly && (
          <section className="min-w-0 pb-24 md:pb-20">
            <h2 className={sectionHeading}>Activity</h2>
            <CulinaryCard className="min-w-0">
              <FounderDashboardActivityFeed initialActivity={activity} />
              <FounderDashboardActivityForm />
            </CulinaryCard>
          </section>
        )}

        {/* Zone 7 — Weekly ritual (founder_admin only) */}
        {showFounderOnly && (
          <section className="min-w-0">
            <h2 className={sectionHeading}>Weekly ritual</h2>
            <FounderDashboardWeeklyRitual />
          </section>
        )}
    </div>
  )
}
