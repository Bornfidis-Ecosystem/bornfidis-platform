'use client'

import { useEffect, useState } from 'react'

const BRAND = {
  forest: '#1A3C34',
  coral: '#E07B54',
  gold: '#C9A84C',
  sage: '#8FBC8B',
}
const DIVISION_COLORS: Record<string, string> = {
  Sportswear: '#CE472E',
  Academy: '#534AB7',
  Provisions: '#002747',
  ProJu: '#3B6D11',
}

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

  useEffect(() => { load() }, [])

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

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <p className="text-gray-500">Loading dashboard…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-2xl font-bold text-gray-900" style={{ color: BRAND.forest }}>
            Founder Dashboard
          </h1>
          <p className="text-gray-600 text-sm mt-1">Ecosystem health at a glance</p>
        </header>

        {/* Zone 1 — Ecosystem Health KPIs */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Ecosystem Health</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase">Monthly Revenue</p>
              <p className="text-xl font-bold mt-1" style={{ color: BRAND.forest }}>
                {metrics ? formatCurrency(metrics.monthlyRevenueCents) : '—'}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase">Total Customers</p>
              <p className="text-xl font-bold mt-1" style={{ color: BRAND.forest }}>
                {metrics?.totalCustomers ?? '—'}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase">Email Subscribers</p>
              <p className="text-xl font-bold mt-1" style={{ color: BRAND.forest }}>
                {metrics?.emailSubscribers ?? '—'}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase">Store Conversion Rate</p>
              {editingKpi === 'conversion' ? (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={conversionInput}
                    onChange={(e) => setConversionInput(e.target.value)}
                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => saveSetting('storeConversionRate', parseFloat(conversionInput) || 0)}
                    className="text-xs font-medium rounded px-2 py-1"
                    style={{ backgroundColor: BRAND.sage, color: BRAND.forest }}
                  >
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingKpi(null)} className="text-gray-500 text-xs">
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-xl font-bold mt-1 flex items-center gap-2" style={{ color: BRAND.forest }}>
                  {metrics?.storeConversionRate ?? 0}%
                  <button
                    type="button"
                    onClick={() => setEditingKpi('conversion')}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Edit
                  </button>
                </p>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase">Cash Reserve</p>
              {editingKpi === 'reserve' ? (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number"
                    value={reserveInput}
                    onChange={(e) => setReserveInput(e.target.value)}
                    className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => saveSetting('cashReserve', parseFloat(reserveInput) || 0)}
                    className="text-xs font-medium rounded px-2 py-1"
                    style={{ backgroundColor: BRAND.sage, color: BRAND.forest }}
                  >
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingKpi(null)} className="text-gray-500 text-xs">
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-xl font-bold mt-1 flex items-center gap-2" style={{ color: BRAND.forest }}>
                  {metrics != null ? `$${Number(metrics.cashReserve).toLocaleString()}` : '—'}
                  <button
                    type="button"
                    onClick={() => setEditingKpi('reserve')}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Edit
                  </button>
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Zone 2 — Division Cards */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Divisions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {divisions && (
              <>
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: DIVISION_COLORS.Sportswear }} />
                    <h3 className="font-semibold text-gray-900">Sportswear</h3>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Orders this week: {divisions.sportswear.ordersThisWeek}</li>
                    <li>Revenue this week: {formatCurrency(divisions.sportswear.revenueThisWeekCents)}</li>
                    <li>Top product: {divisions.sportswear.topProductByUnits}</li>
                  </ul>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: DIVISION_COLORS.Academy }} />
                    <h3 className="font-semibold text-gray-900">Academy</h3>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Students enrolled (MTD): {divisions.academy.studentsEnrolled}</li>
                    <li>Guide downloads (MTD): {divisions.academy.guideDownloadsThisMonth}</li>
                    <li>Courses live: {divisions.academy.coursesLiveCount}</li>
                  </ul>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: DIVISION_COLORS.Provisions }} />
                    <h3 className="font-semibold text-gray-900">Provisions</h3>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Upcoming bookings: {divisions.provisions.upcomingBookingsCount}</li>
                    <li>Active leads: {divisions.provisions.activeLeadsCount}</li>
                    <li>Next event: {divisions.provisions.nextEventDate ?? '—'}</li>
                  </ul>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: DIVISION_COLORS.ProJu }} />
                    <h3 className="font-semibold text-gray-900">ProJu</h3>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Farmers contacted: {divisions.proju.farmersContactedCount}</li>
                    <li>Listings live: {divisions.proju.listingsLive}</li>
                    <li>Buyer inquiries (MTD): {divisions.proju.buyerInquiriesThisMonth}</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Zone 3 — Pipeline */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Pipeline</h2>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Division</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pipeline.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.division}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(item.expectedDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.estimatedValue != null ? `$${Number(item.estimatedValue).toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: BRAND.sage, color: BRAND.forest }}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-4 py-3">
                      <form onSubmit={addPipeline} className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          placeholder="Title"
                          value={pipelineForm.title}
                          onChange={(e) => setPipelineForm((f) => ({ ...f, title: e.target.value }))}
                          className="border border-gray-300 rounded px-2 py-1.5 text-sm min-w-[140px]"
                        />
                        <select
                          value={pipelineForm.division}
                          onChange={(e) => setPipelineForm((f) => ({ ...f, division: e.target.value }))}
                          className="border border-gray-300 rounded px-2 py-1.5 text-sm"
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
                          className="border border-gray-300 rounded px-2 py-1.5 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Est. value ($)"
                          value={pipelineForm.estimatedValue}
                          onChange={(e) => setPipelineForm((f) => ({ ...f, estimatedValue: e.target.value }))}
                          className="border border-gray-300 rounded px-2 py-1.5 text-sm w-28"
                        />
                        <select
                          value={pipelineForm.status}
                          onChange={(e) => setPipelineForm((f) => ({ ...f, status: e.target.value }))}
                          className="border border-gray-300 rounded px-2 py-1.5 text-sm"
                        >
                          <option value="lead">Lead</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button
                          type="submit"
                          className="rounded px-3 py-1.5 text-sm font-medium text-white"
                          style={{ backgroundColor: BRAND.forest }}
                        >
                          Add
                        </button>
                      </form>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Zone 4 — Activity Feed */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Activity Feed</h2>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
            {activity.length === 0 ? (
              <p className="px-4 py-6 text-gray-500 text-sm">No activity yet.</p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-2.5 h-2.5 rounded-full mt-1.5"
                    style={{ backgroundColor: DIVISION_COLORS[item.division] ?? BRAND.forest }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.division} · {item.eventType} · {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
