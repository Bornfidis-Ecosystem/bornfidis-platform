import Link from 'next/link'
import { getForecastData } from '@/lib/forecast'
import ForecastClient from './ForecastClient'

export const dynamic = 'force-dynamic'

/** Phase 2AP — Revenue Forecasting. Admin/Staff only. */
export default async function AdminForecastPage() {
  const data = await getForecastData()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/admin" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Revenue forecast</h1>
        <p className="text-sm text-gray-600 mb-6">
          Near-term revenue for staffing and cash flow. Confirmed = locked bookings; projected = trend-based estimates only, not guarantees.
        </p>
        <ForecastClient data={data} />
      </div>
    </div>
  )
}
