import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import SignOutButton from '@/components/admin/SignOutButton'
import TestamentDashboardClient from './TestamentDashboardClient'
import { LivingTestament, CommissionedLeader } from '@/types/testament'

async function getTestamentData() {
  await requireAuth()

  // Fetch living testament entries
  const { data: testimonies, error: testimoniesError } = await supabaseAdmin
    .from('living_testament')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  // Fetch commissioned leaders
  const { data: leaders, error: leadersError } = await supabaseAdmin
    .from('commissioned_leaders')
    .select('*')
    .order('display_order', { ascending: true })
    .order('commissioned_at', { ascending: false })

  if (testimoniesError || leadersError) {
    console.error('Error fetching testament data:', testimoniesError || leadersError)
    throw new Error('Failed to fetch testament data')
  }

  return {
    testimonies: (testimonies || []) as LivingTestament[],
    leaders: (leaders || []) as CommissionedLeader[],
  }
}

export default async function AdminTestamentPage() {
  const testamentData = await getTestamentData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">The Living Testament</h1>
              <p className="text-[#FFBC00] text-sm mt-1">Public covenant, story, and commissioning</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <TestamentDashboardClient initialData={testamentData} />
      </main>
    </div>
  )
}
