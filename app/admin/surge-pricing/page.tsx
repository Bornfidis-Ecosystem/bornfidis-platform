import Link from 'next/link'
import { listSurgeConfigs } from '@/lib/surge-pricing'
import SurgePricingClient from './SurgePricingClient'

export const dynamic = 'force-dynamic'

/**
 * Phase 2AN — Surge pricing config. Enable/disable per region, thresholds, cap. No retroactive surge.
 */
export default async function AdminSurgePricingPage() {
  const configs = await listSurgeConfigs()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/admin" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Surge pricing</h1>
        <p className="text-sm text-gray-600 mb-6">
          Demand-based multiplier when high demand, low supply, or short notice. Multiplier 1.05–1.30. Locked at quote time; no retroactive change.
        </p>
        <SurgePricingClient initialConfigs={configs} />
      </div>
    </div>
  )
}
