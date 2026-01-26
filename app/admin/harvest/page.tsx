import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import SignOutButton from '@/components/admin/SignOutButton'
import HarvestDashboardClient from './HarvestDashboardClient'
import { HarvestMetric, KingdomFund, ImpactTransaction } from '@/types/harvest'
import { ReplicationRegion } from '@/types/replication'

async function getHarvestData() {
  await requireAuth()

  // Fetch harvest metrics
  const { data: metrics, error: metricsError } = await supabaseAdmin
    .from('harvest_metrics')
    .select('*')
    .order('period_start', { ascending: false })
    .limit(100)

  // Fetch kingdom funds
  const { data: funds, error: fundsError } = await supabaseAdmin
    .from('kingdom_funds')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch recent transactions
  const { data: transactions, error: transactionsError } = await supabaseAdmin
    .from('impact_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch regions for dropdown
  const { data: regions, error: regionsError } = await supabaseAdmin
    .from('replication_regions')
    .select('id, name, country')
    .order('name', { ascending: true })

  if (metricsError || fundsError || transactionsError || regionsError) {
    console.error('Error fetching harvest data:', metricsError || fundsError || transactionsError || regionsError)
    throw new Error('Failed to fetch harvest data')
  }

  return {
    metrics: (metrics || []) as HarvestMetric[],
    funds: (funds || []) as KingdomFund[],
    transactions: (transactions || []) as ImpactTransaction[],
    regions: (regions || []) as ReplicationRegion[],
  }
}

export default async function AdminHarvestPage() {
  const harvestData = await getHarvestData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Global Harvest & Kingdom Capital</h1>
              <p className="text-[#FFBC00] text-sm mt-1">Track impact and manage kingdom funds</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <HarvestDashboardClient initialData={harvestData} />
      </main>
    </div>
  )
}
