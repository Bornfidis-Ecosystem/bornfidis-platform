import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import SignOutButton from '@/components/admin/SignOutButton'
import Link from 'next/link'
import FarmerDetailClient from './FarmerDetailClient'
import { notFound } from 'next/navigation'

interface FarmerApplication {
  id: string
  created_at: string
  name: string
  phone: string
  acres: number | null
  crops: string | null
  status: string
  notes: string | null
}

async function getFarmerApplication(id: string): Promise<FarmerApplication | null> {
  await requireAuth()

  const { data: application, error } = await supabaseAdmin
    .from('farmers_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !application) {
    return null
  }

  return application as FarmerApplication
}

export default async function FarmerDetailPage({ params }: { params: { id: string } }) {
  const application = await getFarmerApplication(params.id)

  if (!application) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin/farmers" className="text-green-100 hover:text-white mb-2 inline-block">
                ← Back to Applications
              </Link>
              <h1 className="text-2xl font-bold">Farmer Application</h1>
              <p className="text-[#FFBC00] text-sm mt-1">{application.name}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <FarmerDetailClient initialApplication={application} />
      </main>
    </div>
  )
}
