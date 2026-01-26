import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import SignOutButton from '@/components/admin/SignOutButton'
import LegacyDashboardClient from './LegacyDashboardClient'
import { LegacyLeader, LegacyDocument, PrayerRequest } from '@/types/legacy'

async function getLegacyData() {
  await requireAuth()

  // Fetch legacy leaders
  const { data: leaders, error: leadersError } = await supabaseAdmin
    .from('legacy_leaders')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch legacy documents
  const { data: documents, error: documentsError } = await supabaseAdmin
    .from('legacy_documents')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch prayer requests
  const { data: prayers, error: prayersError } = await supabaseAdmin
    .from('prayer_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (leadersError || documentsError || prayersError) {
    console.error('Error fetching legacy data:', leadersError || documentsError || prayersError)
    throw new Error('Failed to fetch legacy data')
  }

  return {
    leaders: (leaders || []) as LegacyLeader[],
    documents: (documents || []) as LegacyDocument[],
    prayers: (prayers || []) as PrayerRequest[],
  }
}

export default async function AdminLegacyPage() {
  const legacyData = await getLegacyData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Legacy & Succession Engine</h1>
              <p className="text-[#FFBC00] text-sm mt-1">Building for 100+ years of impact</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <LegacyDashboardClient initialData={legacyData} />
      </main>
    </div>
  )
}
