'use client'

import { useEffect, useState } from 'react'
import { CulinaryCard } from '@/components/culinary-os'
import { chartColors } from '@/lib/design-tokens'

const DIVISION_COLORS: Record<string, string> = {
  Sportswear: chartColors.sportswear,
  Academy: chartColors.academy,
  Provisions: chartColors.provisions,
  ProJu: chartColors.proju,
}

const DIVISION_BORDER_LEFT: Record<string, string> = {
  Sportswear: 'border-l-[#CE472E]',
  Academy: 'border-l-[#33526C]',
  Provisions: 'border-l-[#002747]',
  ProJu: 'border-l-[#FFBC00]',
}

const sectionHeading =
  'mb-4 border-b border-culinary-outline pb-2 font-culinary-sans text-label-caps uppercase tracking-[0.1em] text-culinary-text-muted'

interface Metrics {
  monthlyRevenueCents: number
  totalCustomers: number
  emailSubscribers: number
  storeConversionRate: number
  cashReserve: number
}

interface Divisions {
  sportswear: { ordersThisWeek: number; revenueThisWeekCents: number; topProductByUnits: string }
  academy: { studentsEnrolled: number; guideDownloadsThisMonth: number; coursesLiveCount: number; topProductByUnits: string }
  provisions: { upcomingBookingsCount: number; activeLeadsCount: number; nextEventDate: string | null }
  proju: { farmersContactedCount: number; listingsLive: number; buyerInquiriesThisMonth: number }
}

interface PipelineItem {
  id: string
  title: string
  division: string
  expectedDate: string | null
  estimatedValue: number | null
  status: string
  createdAt: string
}

interface ActivityItem {
  id: string
  eventType: string
  description: string
  division: string
  createdAt: string
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function FounderDashboardClient() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [divisions, setDivisions] = useState<Divisions | null>(null)
  const [pipeline, setPipeline] = useState<PipelineItem[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingKpi, setEditingKpi] = useState<'conversion' | 'reserve' | null>(null)
  const [conversionInput, setConversionInput] = useState('')
  const [reserveInput, setReserveInput] = useState('')
  const [pipelineForm, setPipelineForm] = useState({ title: '', division: 'Provisions' as string, expectedDate: '', estimatedValue: '', status: 'lead' })

  const load = async () => {
    setError(null)
    try {
      const [m, d, p, a] = await Promise.all([
        fetchJson<Metrics>('/api/admin/metrics'),
        fetchJson<Divisions>('/api/admin/divisions'),
        fetchJson<PipelineItem[]>('/api/admin/pipeline'),
        fetchJson<ActivityItem[]>('/api/admin/activity'),
      ])
      setMetrics(m)
      setDivisions(d)
      setPipeline(p)
      setActivity(a)
      setConversionInput(String(m.storeConversionRate))
      setReserveInput(String(m.cashReserve))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const saveSetting = async (key: 'storeConversionRate' | 'cashReserve', value: number) => {
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(key === 'storeConversionRate' ? { storeConversionRate: value } : { cashReserve: value }),
      })
      setEditingKpi(null)
      load()
    } catch (e) {
      console.error(e)
    }
  }

  const addPipeline = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pipelineForm.title.trim()) return
    try {
      const res = await fetch('/api/admin/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pipelineForm.title.trim(),
          division: pipelineForm.division,
          expectedDate: pipelineForm.expectedDate || undefined,
          estimatedValue: pipelineForm.estimatedValue ? Math.round(parseFloat(pipelineForm.estimatedValue)) : undefined,
          status: pipelineForm.status,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const item = await res.json()
      setPipeline((prev) => [...prev, item].sort((a, b) => (a.expectedDate || '').localeCompare(b.expectedDate || '')))
      setPipelineForm({ title: '', division: 'Provisions', expectedDate: '', estimatedValue: '', status: 'lead' })
    } catch (e) {
      console.error(e)
    }
  }

  const formatCurrency = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  const formatDate = (d: string | null) => (d ? new Date(d).toLocaleDateString() : '—')

  const inputClass =
    'rounded-none border border-culinary-outline bg-culinary-bone px-2 py-1.5 font-culinary-sans text-sm text-culinary-ink focus:border-culinary-navy focus:outline-none focus:ring-1 focus:ring-culinary-navy/30'

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-8">
        <p className="font-culinary-sans text-sm text-culinary-text-muted">Loading dashboard…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-8">
        <div className="rounded-none border border-red-200 bg-red-50 px-4 py-3 font-culinary-sans text-red-800">
          <p className="font-semibold">Error</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-culinary-bone p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-stack-lg">
        <header>
          <h1 className="font-culinary-display text-2xl font-bold text-culinary-forest">Founder Dashboard</h1>
          <p className="mt-1 font-culinary-sans text-sm text-culinary-text-muted">Ecosystem health at a glance</p>
        </header>

        {/* Zone 1 — Ecosystem Health KPIs */}
        <section>
          <h2 className={sectionHeading}>Ecosystem Health</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <CulinaryCard className="border-t-2 border-t-culinary-navy">
              <p className="font-culinary-sans text-[11px] font-bold uppercase tracking-[0.12em] text-culinary-text-muted">Monthly Revenue</p>
              <p className="mt-1 font-culinary-display text-xl font-bold tabular-nums text-culinary-navy">
                {metrics ? formatCurrency(metrics.monthlyRevenueCents) : '—'}
              </p>
            </CulinaryCard>
            <CulinaryCard>
              <p className="font-culinary-sans text-[11px] font-bold uppercase tracking-[0.12em] text-culinary-text-muted">Total Customers</p>
              <p className="mt-1 font-culinary-display text-xl font-bold tabular-nums text-culinary-navy">{metrics?.totalCustomers ?? '—'}</p>
            </CulinaryCard>
            <CulinaryCard>
              <p className="font-culinary-sans text-[11px] font-bold uppercase tracking-[0.12em] text-culinary-text-muted">Email Subscribers</p>
              <p className="mt-1 font-culinary-display text-xl font-bold tabular-nums text-culinary-navy">{metrics?.emailSubscribers ?? '—'}</p>
            </CulinaryCard>
            <CulinaryCard>
              <p className="font-culinary-sans text-[11px] font-bold uppercase tracking-[0.12em] text-culinary-text-muted">Store Conversion Rate</p>
              {editingKpi === 'conversion' ? (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={conversionInput}
                    onChange={(e) => setConversionInput(e.target.value)}
                    className={`w-20 ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={() => saveSetting('storeConversionRate', parseFloat(conversionInput) || 0)}
                    className="rounded-none border border-culinary-navy bg-culinary-navy px-2 py-1 font-culinary-sans text-xs font-medium text-culinary-on-navy transition-colors duration-refined ease-refined hover:opacity-90"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingKpi(null)}
                    className="font-culinary-sans text-xs text-culinary-text-muted hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="mt-1 flex items-center gap-2 font-culinary-display text-xl font-bold tabular-nums text-culinary-navy">
                  {metrics?.storeConversionRate ?? 0}%
                  <button
                    type="button"
                    onClick={() => setEditingKpi('conversion')}
                    className="font-culinary-sans text-xs text-culinary-text-muted hover:underline"
                  >
                    Edit
                  </button>
                </p>
              )}
            </CulinaryCard>
            <CulinaryCard>
              <p className="font-culinary-sans text-[11px] font-bold uppercase tracking-[0.12em] text-culinary-text-muted">Cash Reserve</p>
              {editingKpi === 'reserve' ? (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <input type="number" value={reserveInput} onChange={(e) => setReserveInput(e.target.value)} className={`w-24 ${inputClass}`} />
                  <button
                    type="button"
                    onClick={() => saveSetting('cashReserve', parseFloat(reserveInput) || 0)}
                    className="rounded-none border border-culinary-navy bg-culinary-navy px-2 py-1 font-culinary-sans text-xs font-medium text-culinary-on-navy transition-colors duration-refined ease-refined hover:opacity-90"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingKpi(null)}
                    className="font-culinary-sans text-xs text-culinary-text-muted hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="mt-1 flex items-center gap-2 font-culinary-display text-xl font-bold tabular-nums text-culinary-navy">
                  {metrics != null ? `$${Number(metrics.cashReserve).toLocaleString()}` : '—'}
                  <button
                    type="button"
                    onClick={() => setEditingKpi('reserve')}
                    className="font-culinary-sans text-xs text-culinary-text-muted hover:underline"
                  >
                    Edit
                  </button>
                </p>
              )}
            </CulinaryCard>
          </div>
        </section>

        {/* Zone 2 — Division Cards */}
        <section>
          <h2 className={sectionHeading}>Divisions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {divisions && (
              <>
                <CulinaryCard className={`min-w-0 border-l-4 ${DIVISION_BORDER_LEFT.Sportswear}`}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-none" style={{ backgroundColor: DIVISION_COLORS.Sportswear }} />
                    <h3 className="font-culinary-sans font-semibold text-culinary-ink">Sportswear</h3>
                  </div>
                  <ul className="space-y-1 font-culinary-sans text-sm text-culinary-text-muted">
                    <li>Orders this week: {divisions.sportswear.ordersThisWeek}</li>
                    <li>Revenue this week: {formatCurrency(divisions.sportswear.revenueThisWeekCents)}</li>
                    <li>Top product: {divisions.sportswear.topProductByUnits}</li>
                  </ul>
                </CulinaryCard>
                <CulinaryCard className={`min-w-0 border-l-4 ${DIVISION_BORDER_LEFT.Academy}`}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-none" style={{ backgroundColor: DIVISION_COLORS.Academy }} />
                    <h3 className="font-culinary-sans font-semibold text-culinary-ink">Academy</h3>
                  </div>
                  <ul className="space-y-1 font-culinary-sans text-sm text-culinary-text-muted">
                    <li>Students enrolled (MTD): {divisions.academy.studentsEnrolled}</li>
                    <li>Guide downloads (MTD): {divisions.academy.guideDownloadsThisMonth}</li>
                    <li>Courses live: {divisions.academy.coursesLiveCount}</li>
                  </ul>
                </CulinaryCard>
                <CulinaryCard className={`min-w-0 border-l-4 ${DIVISION_BORDER_LEFT.Provisions}`}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-none" style={{ backgroundColor: DIVISION_COLORS.Provisions }} />
                    <h3 className="font-culinary-sans font-semibold text-culinary-ink">Provisions</h3>
                  </div>
                  <ul className="space-y-1 font-culinary-sans text-sm text-culinary-text-muted">
                    <li>Upcoming bookings: {divisions.provisions.upcomingBookingsCount}</li>
                    <li>Active leads: {divisions.provisions.activeLeadsCount}</li>
                    <li>Next event: {divisions.provisions.nextEventDate ?? '—'}</li>
                  </ul>
                </CulinaryCard>
                <CulinaryCard className={`min-w-0 border-l-4 ${DIVISION_BORDER_LEFT.ProJu}`}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-none" style={{ backgroundColor: DIVISION_COLORS.ProJu }} />
                    <h3 className="font-culinary-sans font-semibold text-culinary-ink">ProJu</h3>
                  </div>
                  <ul className="space-y-1 font-culinary-sans text-sm text-culinary-text-muted">
                    <li>Farmers contacted: {divisions.proju.farmersContactedCount}</li>
                    <li>Listings live: {divisions.proju.listingsLive}</li>
                    <li>Buyer inquiries (MTD): {divisions.proju.buyerInquiriesThisMonth}</li>
                  </ul>
                </CulinaryCard>
              </>
            )}
          </div>
        </section>

        {/* Zone 3 — Pipeline */}
        <section>
          <h2 className={sectionHeading}>Pipeline</h2>
          <CulinaryCard padded={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-culinary-outline font-culinary-sans">
                <thead>
                  <tr className="bg-culinary-surface-low">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-culinary-text-muted">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-culinary-text-muted">Division</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-culinary-text-muted">Expected Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-culinary-text-muted">Est. Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-culinary-text-muted">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-culinary-outline">
                  {pipeline.map((item) => (
                    <tr key={item.id} className="transition-colors duration-refined ease-refined hover:bg-culinary-surface-low">
                      <td className="px-4 py-3 text-sm text-culinary-ink">{item.title}</td>
                      <td className="px-4 py-3 text-sm text-culinary-text-muted">{item.division}</td>
                      <td className="px-4 py-3 text-sm text-culinary-text-muted">{formatDate(item.expectedDate)}</td>
                      <td className="px-4 py-3 text-sm text-culinary-text-muted">
                        {item.estimatedValue != null ? `$${Number(item.estimatedValue).toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-none border border-culinary-outline bg-culinary-surface-high px-2 py-0.5 font-culinary-sans text-xs font-medium text-culinary-ink">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-culinary-surface-low">
                    <td colSpan={5} className="px-4 py-3">
                      <form onSubmit={addPipeline} className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          placeholder="Title"
                          value={pipelineForm.title}
                          onChange={(e) => setPipelineForm((f) => ({ ...f, title: e.target.value }))}
                          className={`min-w-[140px] ${inputClass}`}
                        />
                        <select
                          value={pipelineForm.division}
                          onChange={(e) => setPipelineForm((f) => ({ ...f, division: e.target.value }))}
                          className={inputClass}
                        >
                          <option value="Sportswear">Sportswear</option>
                          <option value="Academy">Academy</option>
                          <option value="Provisions">Provisions</option>
                          <option value="ProJu">ProJu</option>
                        </select>
                        <input
                          type="date"
                          value={pipelineForm.expectedDate}
                          onChange={(e) => setPipelineForm((f) => ({ ...f, expectedDate: e.target.value }))}
                          className={inputClass}
                        />
                        <input
                          type="number"
                          placeholder="Est. value ($)"
                          value={pipelineForm.estimatedValue}
                          onChange={(e) => setPipelineForm((f) => ({ ...f, estimatedValue: e.target.value }))}
                          className={`w-28 ${inputClass}`}
                        />
                        <select
                          value={pipelineForm.status}
                          onChange={(e) => setPipelineForm((f) => ({ ...f, status: e.target.value }))}
                          className={inputClass}
                        >
                          <option value="lead">Lead</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button
                          type="submit"
                          className="rounded-none border border-culinary-navy bg-culinary-navy px-3 py-1.5 font-culinary-sans text-sm font-medium text-culinary-on-navy transition-colors duration-refined ease-refined hover:opacity-90"
                        >
                          Add
                        </button>
                      </form>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CulinaryCard>
        </section>

        {/* Zone 4 — Activity Feed */}
        <section>
          <h2 className={sectionHeading}>Activity Feed</h2>
          <CulinaryCard padded={false} className="max-h-[400px] divide-y divide-culinary-outline overflow-y-auto">
            {activity.length === 0 ? (
              <p className="px-gutter py-6 font-culinary-sans text-sm text-culinary-text-muted">No activity yet.</p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 px-gutter py-3">
                  <span
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-none"
                    style={{ backgroundColor: DIVISION_COLORS[item.division] ?? chartColors.provisions }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-culinary-sans text-sm text-culinary-ink">{item.description}</p>
                    <p className="mt-0.5 font-culinary-sans text-xs text-culinary-text-muted">
                      {item.division} · {item.eventType} · {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CulinaryCard>
        </section>
      </div>
    </div>
  )
}
