import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import SignOutButton from '@/components/admin/SignOutButton'
import ReplicationDashboardClient from './ReplicationDashboardClient'
import { ReplicationRegion, ReplicationKit, ImpactInvestor } from '@/types/replication'

async function getReplicationData() {
  await requireAuth()

  // Get all regions
  const { data: regions } = await supabaseAdmin
    .from('replication_regions')
    .select('*')
    .order('created_at', { ascending: false })

  // Get all kits
  const { data: kits } = await supabaseAdmin
    .from('replication_kits')
    .select('*')
    .order('sort_order', { ascending: true })

  // Get all investors
  const { data: investors } = await supabaseAdmin
    .from('impact_investors')
    .select('*')
    .order('created_at', { ascending: false })

  // Calculate metrics
  const totalRegions = regions?.length || 0
  const activeRegions = regions?.filter(r => r.status === 'active').length || 0
  const launchingRegions = regions?.filter(r => r.status === 'launching').length || 0
  const totalCapitalRaised = investors?.reduce((sum, i) => sum + (i.capital_paid_cents || 0), 0) || 0
  const totalCapitalCommitted = investors?.reduce((sum, i) => sum + (i.capital_committed_cents || 0), 0) || 0
  const totalKits = kits?.filter(k => k.is_active).length || 0

  return {
    regions: (regions || []) as ReplicationRegion[],
    kits: (kits || []) as ReplicationKit[],
    investors: (investors || []) as ImpactInvestor[],
    totalRegions,
    activeRegions,
    launchingRegions,
    totalCapitalRaised,
    totalCapitalCommitted,
    totalKits,
  }
}

export default async function ReplicationDashboardPage() {
  const data = await getReplicationData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Global Replication Dashboard</h1>
              <p className="text-[#FFBC00] text-sm mt-1">
                {data.totalRegions} region{data.totalRegions !== 1 ? 's' : ''} • {data.activeRegions} active • {data.totalKits} kit{data.totalKits !== 1 ? 's' : ''}
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <ReplicationDashboardClient data={data} />
      </main>
    </div>
  )
}
