import { supabaseAdmin } from '@/lib/supabase'
import PressClient from './PressClient'
import { PressKit } from '@/types/launch'

async function getPressData() {
  // Get active press kits
  const { data: pressKits } = await supabaseAdmin
    .from('press_kit')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return {
    pressKits: (pressKits || []) as PressKit[],
  }
}

export default async function PressPage() {
  const pressData = await getPressData()

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-4">Press Kit</h1>
          <div className="h-1 w-32 bg-[#FFBC00] mx-auto mb-6"></div>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Media resources, press releases, and information for journalists and media partners.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <PressClient initialData={pressData} />
      </main>
    </div>
  )
}
