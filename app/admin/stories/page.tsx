import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import SignOutButton from '@/components/admin/SignOutButton'
import StoriesDashboardClient from './StoriesDashboardClient'
import { Story } from '@/types/launch'

async function getStoriesData() {
  await requireAuth()

  // Fetch all stories
  const { data: stories, error: storiesError } = await supabaseAdmin
    .from('stories')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (storiesError) {
    console.error('Error fetching stories:', storiesError)
    throw new Error('Failed to fetch stories')
  }

  return {
    stories: (stories || []) as Story[],
  }
}

export default async function AdminStoriesPage() {
  const storiesData = await getStoriesData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Story Management</h1>
              <p className="text-[#FFBC00] text-sm mt-1">Approve and feature stories</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <StoriesDashboardClient initialData={storiesData} />
      </main>
    </div>
  )
}
