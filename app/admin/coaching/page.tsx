import Link from 'next/link'
import { listCoachingCases } from '@/lib/coaching'
import { evaluateAllChefsForCoaching } from '@/lib/coaching-triggers'
import { getCoachOptions } from './actions'
import CoachingListClient from './CoachingListClient'
import SignOutButton from '@/components/admin/SignOutButton'
import EvaluateAllButton from './EvaluateAllButton'
import { CulinaryCard } from '@/components/culinary-os'

export const dynamic = 'force-dynamic'

/**
 * Phase 2Z — Coaching workflows. List cases, assign coach, set plan, close.
 */
export default async function AdminCoachingPage() {
  const [cases, coachOptions] = await Promise.all([
    listCoachingCases(),
    getCoachOptions(),
  ])

  return (
    <div className="min-h-screen bg-culinary-bone">
      <header className="bg-forestDark text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-gold hover:underline text-sm mb-2 inline-block">
                ← Admin
              </Link>
              <h1 className="text-2xl font-bold">Coaching</h1>
              <p className="text-green-100 text-sm mt-1">
                Private. Triggers: avg rating &lt; 4.5, on-time &lt; 90%, prep missed 2+ (last 5).
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-4">
          <EvaluateAllButton />
        </div>
        <CulinaryCard padded={false} className="overflow-hidden">
          <div className="px-4 py-3 border-b border-culinary-outline">
            <h2 className="text-lg font-semibold text-gray-900">Cases</h2>
          </div>
          <CoachingListClient cases={cases} coachOptions={coachOptions} />
        </CulinaryCard>
      </main>
    </div>
  )
}
