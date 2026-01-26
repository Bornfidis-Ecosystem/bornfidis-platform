import { supabaseAdmin } from '@/lib/supabase'
import PublicTestamentClient from './PublicTestamentClient'
import { LivingTestament, CommissionedLeader } from '@/types/testament'

async function getPublicTestamentData() {
  // Get featured testimonies
  const { data: featuredTestimonies } = await supabaseAdmin
    .from('living_testament')
    .select('*')
    .eq('is_public', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  // Get all public testimonies
  const { data: allTestimonies } = await supabaseAdmin
    .from('living_testament')
    .select('*')
    .eq('is_public', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  // Get commissioned leaders with covenant signed
  const { data: leaders } = await supabaseAdmin
    .from('commissioned_leaders')
    .select('*')
    .eq('is_public', true)
    .eq('covenant_signed', true)
    .order('display_order', { ascending: true })
    .order('commissioned_at', { ascending: false })

  return {
    featuredTestimonies: (featuredTestimonies || []) as LivingTestament[],
    allTestimonies: (allTestimonies || []) as LivingTestament[],
    leaders: (leaders || []) as CommissionedLeader[],
  }
}

export default async function PublicTestamentPage() {
  const testamentData = await getPublicTestamentData()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-4">The Living Testament</h1>
          <div className="h-1 w-32 bg-[#FFBC00] mx-auto mb-6"></div>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Our story, our covenant, and our commissioning as a faith-anchored movement.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <PublicTestamentClient testamentData={testamentData} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 text-center text-gray-600 text-sm">
        <p className="italic">
          "Go therefore and make disciples of all nations, baptizing them in the name of the Father
          and of the Son and of the Holy Spirit."
        </p>
        <p className="mt-2 font-semibold">— Matthew 28:19</p>
      </footer>
    </div>
  )
}
