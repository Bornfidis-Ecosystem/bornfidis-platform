import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import SignOutButton from '@/components/admin/SignOutButton'
import CooperativeDashboardClient from './CooperativeDashboardClient'
import { CooperativeMember, CooperativePayout } from '@/types/cooperative'

async function getCooperativeData() {
  await requireAuth()

  // Get all members
  const { data: members } = await supabaseAdmin
    .from('cooperative_members')
    .select('*')
    .order('impact_score', { ascending: false })

  // Get recent payouts
  const { data: recentPayouts } = await supabaseAdmin
    .from('cooperative_payouts')
    .select(`
      *,
      member:cooperative_members(name, email, role)
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  // Get training count
  const { data: trainings } = await supabaseAdmin
    .from('cooperative_training')
    .select('id')
    .eq('is_active', true)

  // Calculate metrics
  const totalMembers = members?.length || 0
  const activeMembers = members?.filter(m => m.status === 'active').length || 0
  const totalPayouts = recentPayouts?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0
  const totalImpactScore = members?.reduce((sum, m) => sum + (m.impact_score || 0), 0) || 0
  const avgImpactScore = activeMembers > 0 ? Math.round(totalImpactScore / activeMembers) : 0

  // Members by role
  const membersByRole = {
    farmer: members?.filter(m => m.role === 'farmer').length || 0,
    chef: members?.filter(m => m.role === 'chef').length || 0,
    educator: members?.filter(m => m.role === 'educator').length || 0,
    builder: members?.filter(m => m.role === 'builder').length || 0,
    partner: members?.filter(m => m.role === 'partner').length || 0,
  }

  return {
    members: (members || []) as CooperativeMember[],
    recentPayouts: (recentPayouts || []) as CooperativePayout[],
    totalMembers,
    activeMembers,
    totalPayouts,
    avgImpactScore,
    totalTrainings: trainings?.length || 0,
    membersByRole,
  }
}

export default async function CooperativeDashboardPage() {
  const data = await getCooperativeData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Cooperative Dashboard</h1>
              <p className="text-[#FFBC00] text-sm mt-1">
                {data.activeMembers} active member{data.activeMembers !== 1 ? 's' : ''} • {data.totalTrainings} training{data.totalTrainings !== 1 ? 's' : ''}
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <CooperativeDashboardClient data={data} />
      </main>
    </div>
  )
}
