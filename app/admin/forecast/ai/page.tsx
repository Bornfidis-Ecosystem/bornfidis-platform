import Link from 'next/link'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { getAiDemandForecast } from '@/lib/ai-demand-forecast'
import AiDemandForecastClient from './AiDemandForecastClient'

export const dynamic = 'force-dynamic'

/** Phase 2BB — AI Demand Forecasting. Admin/Staff only. */
export default async function AdminForecastAiPage() {
  const role = await getCurrentUserRole()
  const roleStr = role ? String(role).toUpperCase() : ''
  if (roleStr !== 'ADMIN' && roleStr !== 'STAFF') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-xl font-semibold text-red-600">Access Denied</h1>
        <p className="text-gray-600">AI demand forecast is available to Admin and Staff only.</p>
        <a href="/admin" className="text-[#1a5f3f] hover:underline">Back to Dashboard</a>
      </div>
    )
  }

  const data = await getAiDemandForecast()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/admin/forecast" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
          ← Revenue forecast
        </Link>
        <Link href="/admin" className="text-sm text-gray-500 hover:underline mb-4 inline-block ml-4">
          Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI demand forecast</h1>
        <p className="text-sm text-gray-600 mb-6">
          Predict where and when demand will rise. Time-series baseline + trend; confidence bands (low/base/high). Use for staffing, pricing, and marketing.
        </p>
        <AiDemandForecastClient data={data} />
      </div>
    </div>
  )
}
