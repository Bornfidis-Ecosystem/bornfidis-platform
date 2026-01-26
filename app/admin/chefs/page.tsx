import Link from 'next/link'
import { getAllChefs } from './actions'
import { Chef, ChefStatus } from '@/types/chef'
import SignOutButton from '@/components/admin/SignOutButton'
import ChefListClient from './ChefListClient'

/**
 * Phase 5A: Admin Chefs Management Page
 */
export default async function AdminChefsPage() {
  const result = await getAllChefs()

  if (!result.success) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-semibold">Error loading chefs</p>
            <p className="text-sm mt-1">{result.error}</p>
          </div>
        </div>
      </div>
    )
  }

  const chefs = result.chefs || []

  const getStatusBadgeColor = (status: ChefStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-navy text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/bookings"
                className="text-gold hover:underline text-sm mb-2 inline-block"
              >
                ← Back to Bookings
              </Link>
              <h1 className="text-2xl font-bold">Chef Network</h1>
              <p className="text-gold text-sm mt-1">{chefs.length} chef{chefs.length !== 1 ? 's' : ''}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-navy">All Chefs</h2>
              <Link
                href="/chef/apply"
                target="_blank"
                className="text-sm text-navy hover:underline"
              >
                View Application Form →
              </Link>
            </div>
          </div>

          <ChefListClient chefs={chefs} />
        </div>
      </main>
    </div>
  )
}
