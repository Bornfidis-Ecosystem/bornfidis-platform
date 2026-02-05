import Link from 'next/link'
import { getCostInsights } from '@/lib/cost-insights'
import CostInsightsClient from './CostInsightsClient'

export const dynamic = 'force-dynamic'

/** Phase 2AT — Cost Optimization. Admin/Staff only. */
export default async function AdminCostsPage() {
  const data = await getCostInsights()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/admin" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Cost optimization</h1>
        <p className="text-sm text-gray-600 mb-6">
          Labor, idle capacity, surge, rework, travel. Match source data; adjust region, surge, availability.
        </p>
        <CostInsightsClient data={data} />
      </div>
    </div>
  )
}
