import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import SignOutButton from '@/components/admin/SignOutButton'
import CoordinatorDashboardClient from './CoordinatorDashboardClient'

interface FarmerApplication {
  id: string
  created_at: string
  name: string
  phone: string
  parish: string | null
  acres: number | null
  crops: string | null
  status: string
  voice_ready: boolean
}

async function getFarmersData() {
  await requireAuth()

  // Fetch all farmer applications
  const { data: farmers, error } = await supabaseAdmin
    .from('farmers_applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching farmers:', error)
    throw new Error('Failed to fetch farmers')
  }

  // Get unique parishes and crops for filters
  const parishes = [...new Set((farmers || []).map(f => f.parish).filter(Boolean))]
  const crops = [...new Set((farmers || []).map(f => f.crops).filter(Boolean).flatMap(c => c?.split(',').map(x => x.trim()) || []))]

  return {
    farmers: (farmers || []) as FarmerApplication[],
    parishes: parishes.sort(),
    crops: crops.sort(),
  }
}

export default async function CoordinatorDashboardPage() {
  const farmersData = await getFarmersData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Coordinator Command Center</h1>
              <p className="text-[#FFBC00] text-sm mt-1">
                Manage farmers, make calls, send messages
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <CoordinatorDashboardClient initialData={farmersData} />
      </main>
    </div>
  )
}
