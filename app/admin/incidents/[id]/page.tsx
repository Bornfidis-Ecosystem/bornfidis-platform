import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getIncidentAction } from '../actions'
import IncidentDetailClient from './IncidentDetailClient'

export const dynamic = 'force-dynamic'

/** Phase 2AO — Incident detail. Read-only after closure. */
export default async function IncidentDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const incident = await getIncidentAction(id)
  if (!incident) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Link href="/admin/incidents" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
          ← Incidents
        </Link>
        <IncidentDetailClient incident={incident} />
      </div>
    </div>
  )
}
