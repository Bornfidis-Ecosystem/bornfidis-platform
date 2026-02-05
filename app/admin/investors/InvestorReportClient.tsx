'use client'

import { useRouter } from 'next/navigation'
import { PDFDownloadLink } from '@react-pdf/renderer'
import type { InvestorReportData } from '@/lib/investor-report'
import InvestorReportPdf from '@/components/pdf/InvestorReportPdf'

function formatUSD(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    cents / 100
  )
}

export default function InvestorReportClient({ data }: { data: InvestorReportData }) {
  const router = useRouter()
  const r = data.revenue
  const g = data.growth
  const q = data.quality
  const u = data.unitEconomics
  const o = data.outlook

  const exportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Period', data.periodLabel],
      ['Generated', data.generatedAt],
      ['Revenue MTD (cents)', r.mtdCents],
      ['Revenue MTD (bookings)', r.mtdBookings],
      ['Revenue QTD (cents)', r.qtdCents],
      ['Revenue QTD (bookings)', r.qtdBookings],
      ['YoY %', r.yoyPercent ?? ''],
      ['AOV (cents)', g.aovCents],
      ['Active chefs', g.activeChefs],
      ['Avg rating', q.avgRating],
      ['Review count', q.reviewCount],
      ['SLA adherence %', q.slaAdherencePct],
      ['Margin %', u.marginPct],
      ['Bonus %', u.bonusPct],
      ['Forecast 90d (cents)', o.forecast90dCents],
    ]
    const csv = rows.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `investor-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => router.refresh()}
          className="px-3 py-1.5 rounded bg-gray-700 text-white hover:bg-gray-800 text-sm"
        >
          Regenerate
        </button>
        <PDFDownloadLink
          document={<InvestorReportPdf data={data} />}
          fileName={`investor-report-${new Date().toISOString().slice(0, 10)}.pdf`}
          className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 text-sm inline-block"
        >
          {({ loading }) => (loading ? 'Preparing PDF…' : 'Export PDF')}
        </PDFDownloadLink>
        <button
          type="button"
          onClick={exportCSV}
          className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 text-sm"
        >
          Export CSV
        </button>
      </div>

      <p className="text-xs text-gray-500">
        {data.periodLabel} · Generated {new Date(data.generatedAt).toLocaleString()}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Revenue</h2>
          <ul className="space-y-1 text-sm">
            <li><span className="text-gray-600">MTD:</span> <strong>{formatUSD(r.mtdCents)}</strong> ({r.mtdBookings} bookings)</li>
            <li><span className="text-gray-600">QTD:</span> <strong>{formatUSD(r.qtdCents)}</strong> ({r.qtdBookings} bookings)</li>
            {r.yoyPercent != null && (
              <li><span className="text-gray-600">YoY (same month):</span> <strong>{r.yoyPercent}%</strong></li>
            )}
          </ul>
        </section>
        <section className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Growth</h2>
          <ul className="space-y-1 text-sm">
            <li><span className="text-gray-600">Bookings MTD / QTD:</span> <strong>{g.bookingsMtd} / {g.bookingsQtd}</strong></li>
            <li><span className="text-gray-600">AOV:</span> <strong>{formatUSD(g.aovCents)}</strong></li>
            <li><span className="text-gray-600">Active chefs (MTD):</span> <strong>{g.activeChefs}</strong></li>
          </ul>
        </section>
        <section className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Quality</h2>
          <ul className="space-y-1 text-sm">
            <li><span className="text-gray-600">Avg rating:</span> <strong>{q.avgRating}</strong> ({q.reviewCount} reviews)</li>
            <li><span className="text-gray-600">SLA adherence:</span> <strong>{q.slaAdherencePct}%</strong> ({q.slaOnTrack}/{q.slaTotal})</li>
          </ul>
        </section>
        <section className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Unit economics</h2>
          <ul className="space-y-1 text-sm">
            <li><span className="text-gray-600">Margin (MTD):</span> <strong>{u.marginPct}%</strong></li>
            <li><span className="text-gray-600">Revenue / Payout (MTD):</span> <strong>{formatUSD(u.revenueMtdCents)} / {formatUSD(u.payoutMtdCents)}</strong></li>
            <li><span className="text-gray-600">Bonus % (of paid payouts):</span> <strong>{u.bonusPct}%</strong></li>
          </ul>
        </section>
      </div>

      <section className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Outlook (next 90 days)</h2>
        <ul className="space-y-1 text-sm">
          <li><span className="text-gray-600">Forecast (expected):</span> <strong>{formatUSD(o.forecast90dCents)}</strong></li>
          <li><span className="text-gray-600">Range:</span> <strong>{formatUSD(o.forecast90dLow)} – {formatUSD(o.forecast90dHigh)}</strong></li>
        </ul>
      </section>

      <p className="text-xs text-gray-500">
        Definitions aligned with ops dashboard and forecast. Read-only. Audit-friendly totals.
      </p>
    </div>
  )
}
