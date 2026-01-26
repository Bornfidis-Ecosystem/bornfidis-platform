import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import SignOutButton from '@/components/admin/SignOutButton'
import HousingDashboardClient from './HousingDashboardClient'
import { HousingProject, HousingResident, LegacyFund } from '@/types/housing'

async function getHousingData() {
  await requireAuth()

  // Fetch housing projects
  const { data: projects, error: projectsError } = await supabaseAdmin
    .from('housing_projects')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch housing residents
  const { data: residents, error: residentsError } = await supabaseAdmin
    .from('housing_residents')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch legacy funds
  const { data: funds, error: fundsError } = await supabaseAdmin
    .from('legacy_funds')
    .select('*')
    .order('created_at', { ascending: false })

  if (projectsError || residentsError || fundsError) {
    console.error('Error fetching housing data:', projectsError || residentsError || fundsError)
    throw new Error('Failed to fetch housing data')
  }

  return {
    projects: (projects || []) as HousingProject[],
    residents: (residents || []) as HousingResident[],
    funds: (funds || []) as LegacyFund[],
  }
}

export default async function AdminHousingPage() {
  const housingData = await getHousingData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Generational Wealth & Housing Covenant</h1>
              <p className="text-[#FFBC00] text-sm mt-1">Building faith-aligned housing and inheritance</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <HousingDashboardClient initialData={housingData} />
      </main>
    </div>
  )
}
