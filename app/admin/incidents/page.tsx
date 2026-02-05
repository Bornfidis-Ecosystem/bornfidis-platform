import Link from 'next/link'
import { listIncidentsAction, getIncidentTrendsAction } from './actions'
import IncidentsClient from './IncidentsClient'

export const dynamic = 'force-dynamic'

/** Phase 2AO — Incident Postmortems. Admin/Staff only. */
export default async function AdminIncidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string; chefId?: string }> | { bookingId?: string; chefId?: string }
}) {
  const params = typeof searchParams?.then === 'function' ? await searchParams : (searchParams ?? {})
  const bookingId = params.bookingId?.trim() || undefined
  const chefId = params.chefId?.trim() || undefined

  const [incidents, trends] = await Promise.all([
    listIncidentsAction({ bookingId, chefId, limit: 100 }),
    getIncidentTrendsAction(90),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/admin" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Incident postmortems</h1>
        <p className="text-sm text-gray-600 mb-6">
          Blameless learning: log incidents, assess impact, identify root cause, track action items. Read-only after closure.
        </p>
        <IncidentsClient
          initialIncidents={incidents}
          initialTrends={trends}
          prefilledBookingId={bookingId}
          prefilledChefId={chefId}
        />
      </div>
    </div>
  )
}
