import { supabaseAdmin } from '@/lib/supabase'
import PublicLegacyClient from './PublicLegacyClient'
import { LegacyDocument, PrayerRequest } from '@/types/legacy'

async function getPublicLegacyData() {
  // Get public legacy documents
  const { data: documents } = await supabaseAdmin
    .from('legacy_documents')
    .select('*')
    .eq('is_public', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Get public prayer requests (unanswered first)
  const { data: prayers } = await supabaseAdmin
    .from('prayer_requests')
    .select('*')
    .eq('is_public', true)
    .order('answered', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(50)

  return {
    documents: (documents || []) as LegacyDocument[],
    prayers: (prayers || []) as PrayerRequest[],
  }
}

export default async function PublicLegacyPage() {
  const legacyData = await getPublicLegacyData()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-4">Our Legacy</h1>
          <div className="h-1 w-32 bg-[#FFBC00] mx-auto mb-6"></div>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Building for 100+ years of regenerative impact, faith, and community transformation.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <PublicLegacyClient legacyData={legacyData} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 text-center text-gray-600 text-sm">
        <p className="italic">
          "One generation shall commend your works to another, and shall declare your mighty acts."
        </p>
        <p className="mt-2 font-semibold">— Psalm 145:4</p>
      </footer>
    </div>
  )
}
