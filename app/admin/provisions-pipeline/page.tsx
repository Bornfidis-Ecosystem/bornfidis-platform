import Link from 'next/link'
import { getAllBookings } from '@/app/admin/bookings/actions'
import { ProvisionsPipelineBoard } from '@/components/admin/ProvisionsPipelineBoard'
import { PIPELINE_COLUMNS, getColumnIdForStatus } from '@/lib/provisions-pipeline'

export const dynamic = 'force-dynamic'

/**
 * Provisions Pipeline Board — CRM-style view of BookingInquiry by stage.
 * Columns: New | Quote Sent | Follow Up | Confirmed | Completed
 */
export default async function ProvisionsPipelinePage() {
  const result = await getAllBookings()

  if (!result.success) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
            <p className="font-semibold">Error loading pipeline</p>
            <p className="text-sm mt-1">{result.error}</p>
            <Link href="/admin/bookings" className="text-sm underline mt-2 inline-block">
              Back to Bookings
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const bookings = result.bookings ?? []

  const funnelCounts = PIPELINE_COLUMNS.map((col) => ({
    label: col.label,
    count: bookings.filter((b) => getColumnIdForStatus(b.status) === col.id).length,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Provisions Pipeline</h1>
              <p className="text-gold text-sm mt-1">
                Move bookings through stages — status updates are saved and logged
              </p>
            </div>
            <Link
              href="/admin/bookings"
              className="px-4 py-2 bg-gold text-navy rounded hover:opacity-90 transition text-sm font-semibold"
            >
              Bookings list
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
          <span className="font-medium text-gray-500">Funnel summary</span>
          {funnelCounts.map(({ label, count }) => (
            <span key={label} className="flex items-baseline gap-1.5">
              <span className="text-gray-600">{label}</span>
              <span className="font-semibold tabular-nums text-navy">{count}</span>
            </span>
          ))}
        </div>
        <ProvisionsPipelineBoard initialBookings={bookings} />
      </main>
    </div>
  )
}
