import Link from 'next/link'
import {
  listOpenAction,
  listBlockedAction,
  listShippedThisWeekAction,
} from './actions'
import ImprovementsClient from './ImprovementsClient'

export const dynamic = 'force-dynamic'

/** Phase 2AQ — Continuous Improvement Backlog. Admin/Staff only. */
export default async function AdminImprovementsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; title?: string }> | { source?: string; title?: string }
}) {
  const params = typeof searchParams?.then === 'function' ? await searchParams : (searchParams ?? {})
  const [open, blocked, shipped] = await Promise.all([
    listOpenAction(),
    listBlockedAction(),
    listShippedThisWeekAction(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/admin" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Improvement backlog</h1>
        <p className="text-sm text-gray-600 mb-6">
          Single backlog from incidents, reviews, SLA, ops. Score = Impact × Urgency ÷ Effort. Ship top 3.
        </p>
        <ImprovementsClient
          initialOpen={open}
          initialBlocked={blocked}
          initialShipped={shipped}
          prefilledSource={params.source}
          prefilledTitle={params.title}
        />
      </div>
    </div>
  )
}
