import { supabaseAdmin } from '@/lib/supabase'
import PublicCooperativeClient from './PublicCooperativeClient'

async function getPublicCooperativeData() {
  // Get public-safe cooperative data
  const { data: members } = await supabaseAdmin
    .from('cooperative_members')
    .select('id, name, role, region, joined_at, impact_score')
    .eq('status', 'active')
    .order('impact_score', { ascending: false })
    .limit(50)

  // Get regions
  const regions = new Set(members?.map(m => m.region) || [])
  const regionCounts: Record<string, number> = {}
  members?.forEach(m => {
    regionCounts[m.region] = (regionCounts[m.region] || 0) + 1
  })

  // Get total metrics (public-safe aggregates)
  const { data: allMembers } = await supabaseAdmin
    .from('cooperative_members')
    .select('id, role, region')
    .eq('status', 'active')

  const totalMembers = allMembers?.length || 0
  const membersByRole = {
    farmer: allMembers?.filter(m => m.role === 'farmer').length || 0,
    chef: allMembers?.filter(m => m.role === 'chef').length || 0,
    educator: allMembers?.filter(m => m.role === 'educator').length || 0,
    builder: allMembers?.filter(m => m.role === 'builder').length || 0,
    partner: allMembers?.filter(m => m.role === 'partner').length || 0,
  }

  return {
    members: members || [],
    totalMembers,
    membersByRole,
    regions: Array.from(regions),
    regionCounts,
  }
}

export default async function PublicCooperativePage() {
  const data = await getPublicCooperativeData()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-4">Bornfidis Global Regenerative Cooperative</h1>
          <div className="h-1 w-32 bg-[#FFBC00] mx-auto mb-6"></div>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            A global network of farmers, chefs, educators, and builders working together
            to create a regenerative food system rooted in faith and community.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <PublicCooperativeClient data={data} />
      </main>
    </div>
  )
}

