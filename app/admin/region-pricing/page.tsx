import Link from 'next/link'
import { listRegionPricing } from '@/lib/region-pricing'
import RegionPricingClient from './RegionPricingClient'

export const dynamic = 'force-dynamic'

/**
 * Phase 2AL — Region-based pricing rules. CRUD, toggle, preview.
 */
export default async function AdminRegionPricingPage() {
  const regions = await listRegionPricing(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/admin" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Region pricing</h1>
        <p className="text-sm text-gray-600 mb-6">
          Adjust pricing by location (multiplier, travel fee, minimum). Region is locked at quote time; no retroactive changes.
        </p>
        <RegionPricingClient initialRegions={regions} />
      </div>
    </div>
  )
}
