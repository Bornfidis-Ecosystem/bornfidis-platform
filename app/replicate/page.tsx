import PublicReplicationClient from './PublicReplicationClient'
import { supabaseAdmin } from '@/lib/supabase'

async function getPublicReplicationData() {
  // Get public-safe replication data
  const { data: regions } = await supabaseAdmin
    .from('replication_regions')
    .select('id, name, country, city, status, launch_date')
    .in('status', ['approved', 'launching', 'active'])
    .order('launch_date', { ascending: true })

  const activeRegions = regions?.filter(r => r.status === 'active').length || 0
  const launchingRegions = regions?.filter(r => r.status === 'launching').length || 0

  return {
    totalRegions: regions?.length || 0,
    activeRegions,
    launchingRegions,
    regions: regions || [],
  }
}

export default async function PublicReplicationPage() {
  const data = await getPublicReplicationData()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-4">Replicate the Movement</h1>
          <div className="h-1 w-32 bg-[#FFBC00] mx-auto mb-6"></div>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Launch a regenerative food hub in your region. Join the global network
            of faith-anchored communities transforming food systems.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <PublicReplicationClient data={data} />
      </main>
    </div>
  )
}
