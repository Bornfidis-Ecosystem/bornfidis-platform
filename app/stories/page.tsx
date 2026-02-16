import { supabaseAdmin } from '@/lib/supabase'
import StoriesClient from './StoriesClient'
import { Story } from '@/types/launch'

async function getStoriesData() {
  // Get approved, public stories
  const { data: stories } = await supabaseAdmin
    .from('stories')
    .select('*')
    .eq('is_approved', true)
    .eq('is_public', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  // Get featured stories
  const { data: featured } = await supabaseAdmin
    .from('stories')
    .select('*')
    .eq('is_approved', true)
    .eq('is_public', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(3)

  return {
    stories: (stories || []) as Story[],
    featured: (featured || []) as Story[],
  }
}

export default async function StoriesPage() {
  const storiesData = await getStoriesData()

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-4">Our Stories</h1>
          <div className="h-1 w-32 bg-[#FFBC00] mx-auto mb-6"></div>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Real stories from farmers, chefs, communities, and partners in the Bornfidis movement.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <StoriesClient initialData={storiesData} />
      </main>
    </div>
  )
}

