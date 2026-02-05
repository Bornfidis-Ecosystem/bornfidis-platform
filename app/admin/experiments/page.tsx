import Link from 'next/link'
import { getExperimentsList } from './actions'
import ExperimentsClient from './ExperimentsClient'

export const dynamic = 'force-dynamic'

/**
 * Phase 2AX/2BD — Experimentation & Automated Growth Experiments
 * Define hypothesis → A/B variant → metric. 50/50 split, one per surface; auto-stop on harm; declare/promote winner.
 */
export default async function AdminExperimentsPage() {
  const experiments = await getExperimentsList()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/admin" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Growth experiments</h1>
        <p className="text-sm text-gray-600 mb-6">
          Test pricing, messaging, incentives, and booking flow. Hypothesis → Variant A/B → Metric. 50/50 split; one experiment per surface; harm thresholds auto-stop. Declare winner and optionally promote. Nightly results update.
        </p>
        <ExperimentsClient initialExperiments={experiments} />
      </div>
    </div>
  )
}
