'use client'

import Link from 'next/link'
import { HarvestSummary, KingdomFund } from '@/types/harvest'
import { ReplicationRegion } from '@/types/replication'
import { formatUSD } from '@/lib/money'

interface PublicImpactClientProps {
  impactData: {
    summary: HarvestSummary
    funds: KingdomFund[]
    regions: ReplicationRegion[]
    totalFundBalance: number
  }
}

export default function PublicImpactClient({ impactData }: PublicImpactClientProps) {
  const { summary, funds, regions, totalFundBalance } = impactData

  return (
    <div className="space-y-12">
      {/* Key Metrics */}
      <section>
        <h2 className="text-3xl font-bold text-[#1a5f3f] mb-8 text-center">Our Global Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#f0fdf4] p-6 rounded-lg shadow-md border border-[#d1fae5] text-center">
            <div className="text-4xl font-bold text-[#1a5f3f] mb-2">{summary.total_food_tons.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Tons of Food Harvested</div>
          </div>
          <div className="bg-[#f0fdf4] p-6 rounded-lg shadow-md border border-[#d1fae5] text-center">
            <div className="text-4xl font-bold text-[#1a5f3f] mb-2">{summary.total_meals_served.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Meals Served</div>
          </div>
          <div className="bg-[#f0fdf4] p-6 rounded-lg shadow-md border border-[#d1fae5] text-center">
            <div className="text-4xl font-bold text-[#1a5f3f] mb-2">{summary.total_land_regenerated_acres.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Acres Regenerated</div>
          </div>
          <div className="bg-[#fffbeb] p-6 rounded-lg shadow-md border border-[#fef3c7] text-center">
            <div className="text-4xl font-bold text-[#FFBC00] mb-2">{formatUSD(totalFundBalance)}</div>
            <div className="text-sm text-gray-600">Kingdom Funds</div>
          </div>
        </div>
      </section>

      {/* Additional Metrics */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-2xl font-bold text-[#1a5f3f]">{summary.total_farmers_supported}</div>
            <div className="text-xs text-gray-600 mt-1">Farmers Supported</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-2xl font-bold text-[#1a5f3f]">{summary.total_chefs_deployed}</div>
            <div className="text-xs text-gray-600 mt-1">Chefs Deployed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-2xl font-bold text-[#1a5f3f]">{summary.total_disciples_trained}</div>
            <div className="text-xs text-gray-600 mt-1">Disciples Trained</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-2xl font-bold text-[#1a5f3f]">{summary.total_community_events}</div>
            <div className="text-xs text-gray-600 mt-1">Community Events</div>
          </div>
        </div>
      </section>

      {/* Kingdom Funds */}
      {funds.length > 0 && (
        <section className="bg-[#fffbeb] p-8 rounded-lg shadow-md border border-[#fef3c7]">
          <h2 className="text-2xl font-bold text-[#1a5f3f] mb-6 text-center">Kingdom Funds</h2>
          <p className="text-gray-700 text-center mb-6">
            These funds support specific regenerative initiatives and community development projects.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {funds.map((fund) => (
              <div key={fund.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#1a5f3f] mb-2">{fund.fund_name}</h3>
                <p className="text-sm text-gray-600 mb-4">{fund.purpose}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-[#FFBC00]">{formatUSD(fund.balance_cents)}</p>
                    {fund.target_balance_cents && (
                      <p className="text-xs text-gray-500 mt-1">
                        Goal: {formatUSD(fund.target_balance_cents)} ({Math.round((fund.balance_cents / fund.target_balance_cents) * 100)}%)
                      </p>
                    )}
                  </div>
                  <span className="px-2 py-1 bg-[#1a5f3f] text-white text-xs rounded capitalize">{fund.fund_type}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Regions Map */}
      <section>
        <h2 className="text-2xl font-bold text-[#1a5f3f] mb-6 text-center">Our Global Presence</h2>
        {regions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No active regions yet. Be part of the movement!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region) => (
              <div key={region.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-[#1a5f3f] mb-2">{region.name}</h3>
                <p className="text-gray-600 mb-2">{region.city ? `${region.city}, ` : ''}{region.country}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                  region.status === 'active' ? 'bg-green-100 text-green-800' :
                  region.status === 'launching' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {region.status}
                </span>
                {region.launch_date && (
                  <p className="text-xs text-gray-500 mt-2">Launched: {new Date(region.launch_date).toLocaleDateString()}</p>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-700 italic mb-4">
            (Interactive map coming soon to visualize our global footprint!)
          </p>
          <Link
            href="/replicate"
            className="inline-block px-6 py-3 bg-[#1a5f3f] text-white font-semibold rounded-lg shadow-md hover:bg-[#154a32] transition"
          >
            Launch a Region
          </Link>
        </div>
      </section>

      {/* Invest in Regeneration */}
      <section className="bg-[#1a5f3f] text-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-3xl font-bold mb-4">Invest in Regeneration</h2>
        <p className="text-green-100 mb-6 max-w-2xl mx-auto">
          Your investment directly supports regenerative agriculture, community development, and global replication.
          Join us in building a more abundant and equitable world.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/replicate/invest"
            className="px-8 py-3 bg-[#FFBC00] text-[#1a5f3f] font-semibold rounded-lg shadow-md hover:bg-gold-dark transition"
          >
            Become an Impact Investor
          </Link>
          <Link
            href="/replicate/apply-leader"
            className="px-8 py-3 bg-white text-[#1a5f3f] font-semibold rounded-lg shadow-md hover:bg-gray-100 transition"
          >
            Launch a Region
          </Link>
        </div>
      </section>
    </div>
  )
}
