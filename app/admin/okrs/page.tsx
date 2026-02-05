import Link from 'next/link'
import { getOKRsList, getOKRsByPeriod } from './actions'
import OkrsClient from './OkrsClient'
import type { OkrWithKrs } from '@/lib/okrs'

export const dynamic = 'force-dynamic'

export default async function AdminOKRsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const params = await searchParams
  const period = params.period?.trim() || null
  const okrList = await getOKRsList(null)
  const okrsForPeriod = period ? await getOKRsByPeriod(period) : ([] as OkrWithKrs[])
  const periods = [...new Set(okrList.map((o) => o.period))].sort().reverse()
  const selectedPeriod = period || (periods[0] ?? '')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/admin" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">OKRs</h1>
        <p className="text-sm text-gray-600 mb-6">
          Objectives and key results. Key results pull from ops KPIs, reviews, and forecasts.
        </p>
        <OkrsClient
          initialPeriod={selectedPeriod}
          initialPeriods={periods}
          initialOKRs={period ? okrsForPeriod : []}
        />
      </div>
    </div>
  )
}
