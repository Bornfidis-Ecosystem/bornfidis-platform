import { supabaseAdmin } from '@/lib/supabase'
import PublicHousingClient from './PublicHousingClient'
import { HousingProject } from '@/types/housing'

async function getPublicHousingData() {
  // Get active housing projects
  const { data: projects } = await supabaseAdmin
    .from('housing_projects')
    .select('*')
    .eq('project_status', 'active')
    .order('name', { ascending: true })

  return {
    projects: (projects || []) as HousingProject[],
  }
}

export default async function PublicHousingPage() {
  const housingData = await getPublicHousingData()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-4">Generational Wealth & Housing Covenant</h1>
          <div className="h-1 w-32 bg-[#FFBC00] mx-auto mb-6"></div>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Building faith-aligned housing and inheritance for Bornfidis communities.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <PublicHousingClient housingData={housingData} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 text-center text-gray-600 text-sm">
        <p className="italic">
          "Every good and perfect gift is from above, coming down from the Father of the heavenly lights."
        </p>
        <p className="mt-2 font-semibold">— James 1:17</p>
      </footer>
    </div>
  )
}

