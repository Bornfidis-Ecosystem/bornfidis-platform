'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PDFDownloadLink } from '@react-pdf/renderer'
import type { BoardDeckData } from '@/lib/board-deck'
import BoardDeckPdf from '@/components/pdf/BoardDeckPdf'

const SECTION_KEYS = [
  'executiveSummary',
  'growth',
  'quality',
  'finance',
  'forecast',
  'risksAndActions',
  'roadmap',
] as const

const SECTION_LABELS: Record<string, string> = {
  executiveSummary: 'Executive summary (KPIs)',
  growth: 'Growth (bookings, AOV, chefs)',
  quality: 'Quality (ratings, SLAs)',
  finance: 'Finance (revenue, margin)',
  forecast: 'Forecast (30/90 days)',
  risksAndActions: 'Risks & actions',
  roadmap: 'Roadmap (next 30–60 days)',
}

function formatUSD(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    cents / 100
  )
}

export default function BoardDeckClient({ initialData }: { initialData: BoardDeckData }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const period = searchParams.get('period') === 'quarter' ? 'quarter' : 'month'

  const [sections, setSections] = useState<Record<string, boolean>>({
    executiveSummary: true,
    growth: true,
    quality: true,
    finance: true,
    forecast: true,
    okrs: true,
    risksAndActions: true,
    roadmap: true,
  })
  const [narrative, setNarrative] = useState('')

  const setPeriod = (p: 'month' | 'quarter') => {
    const next = new URLSearchParams(searchParams.toString())
    next.set('period', p)
    router.push(`/admin/board-deck?${next.toString()}`)
  }

  const toggleSection = (key: string) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const versionedFilename = `board-deck-${initialData.periodLabel.replace(/\s/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Period:</span>
        <button
          type="button"
          onClick={() => setPeriod('month')}
          className={`px-3 py-1.5 rounded text-sm font-medium ${period === 'month' ? 'bg-[#1a5f3f] text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          Month
        </button>
        <button
          type="button"
          onClick={() => setPeriod('quarter')}
          className={`px-3 py-1.5 rounded text-sm font-medium ${period === 'quarter' ? 'bg-[#1a5f3f] text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          Quarter
        </button>
        <button type="button" onClick={() => router.refresh()} className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 text-sm">
          Regenerate data
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Include sections</h2>
        <div className="flex flex-wrap gap-4">
          {SECTION_KEYS.map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sections[key] ?? true}
                onChange={() => toggleSection(key)}
                className="rounded border-gray-300 text-[#1a5f3f]"
              />
              {SECTION_LABELS[key]}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Narrative (1-page notes, optional)</h2>
        <textarea
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Add a one-page narrative or context for the board."
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <PDFDownloadLink
          document={<BoardDeckPdf data={initialData} narrative={narrative} sections={sections} />}
          fileName={versionedFilename}
          className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 text-sm inline-block"
        >
          {({ loading }) => (loading ? 'Preparing PDF…' : 'Download PDF')}
        </PDFDownloadLink>
      </div>

      <p className="text-xs text-gray-500">
        Generated {new Date(initialData.generatedAt).toLocaleString()}. Definitions locked to ops/forecast/costs. Versioned filename for audit.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Executive summary (preview)</h3>
          <p>Revenue: {formatUSD(initialData.executiveSummary.revenueCents)} · Bookings: {initialData.executiveSummary.bookings} · Margin: {initialData.executiveSummary.marginPct}%</p>
          <p>Forecast 90d: {formatUSD(initialData.executiveSummary.forecast90dCents)} · Rating: {initialData.executiveSummary.avgRating} · SLA: {initialData.executiveSummary.slaAdherencePct}%</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Risks & actions (preview)</h3>
          {initialData.risksAndActions.recommendations.length === 0 ? (
            <p className="text-gray-500">None.</p>
          ) : (
            <ul className="list-disc list-inside text-gray-700">
              {initialData.risksAndActions.recommendations.slice(0, 3).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
