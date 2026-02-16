import { supabaseAdmin } from '@/lib/supabase'
import PublicImpactClient from './PublicImpactClient'
import { HarvestMetric, KingdomFund } from '@/types/harvest'
import { ReplicationRegion } from '@/types/replication'

async function getPublicImpactData() {
  // Get aggregate harvest metrics (public-safe)
  const { data: metrics } = await supabaseAdmin
    .from('harvest_metrics')
    .select('food_tons, meals_served, land_regenerated_acres, farmers_supported, chefs_deployed, disciples_trained, community_events, scholarships_funded')
    .order('period_start', { ascending: false })

  // Get active kingdom funds (public-safe)
  const { data: funds } = await supabaseAdmin
    .from('kingdom_funds')
    .select('id, fund_name, purpose, fund_type, balance_cents, target_balance_cents')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Get active regions for map
  const { data: regions } = await supabaseAdmin
    .from('replication_regions')
    .select('id, name, country, city, status, launch_date')
    .in('status', ['approved', 'launching', 'active'])
    .order('name', { ascending: true })

  // Calculate totals
  const summary = {
    total_food_tons: metrics?.reduce((sum, m) => sum + (m.food_tons || 0), 0) || 0,
    total_meals_served: metrics?.reduce((sum, m) => sum + (m.meals_served || 0), 0) || 0,
    total_land_regenerated_acres: metrics?.reduce((sum, m) => sum + (Number(m.land_regenerated_acres) || 0), 0) || 0,
    total_farmers_supported: metrics?.reduce((sum, m) => sum + (m.farmers_supported || 0), 0) || 0,
    total_chefs_deployed: metrics?.reduce((sum, m) => sum + (m.chefs_deployed || 0), 0) || 0,
    total_disciples_trained: metrics?.reduce((sum, m) => sum + (m.disciples_trained || 0), 0) || 0,
    total_community_events: metrics?.reduce((sum, m) => sum + (m.community_events || 0), 0) || 0,
    total_scholarships_funded: metrics?.reduce((sum, m) => sum + (m.scholarships_funded || 0), 0) || 0,
  }

  const totalFundBalance = funds?.reduce((sum, f) => sum + (f.balance_cents || 0), 0) || 0

  return {
    summary,
    funds: (funds || []) as KingdomFund[],
    regions: (regions || []) as ReplicationRegion[],
    totalFundBalance,
  }
}

export default async function PublicImpactPage() {
  const impactData = await getPublicImpactData()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-4">Global Harvest & Kingdom Impact</h1>
          <div className="h-1 w-32 bg-[#FFBC00] mx-auto mb-6"></div>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Every meal tells a story of faith, community, and regeneration.
            See how your support is transforming lives and healing the land.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <PublicImpactClient impactData={impactData} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 text-center text-gray-600 text-sm">
        <p className="italic">
          "The earth is the Lord's, and everything in it, the world, and all who live in it."
        </p>
        <p className="mt-2 font-semibold">— Psalm 24:1</p>
      </footer>
    </div>
  )
}

