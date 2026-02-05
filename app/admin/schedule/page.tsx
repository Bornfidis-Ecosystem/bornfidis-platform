import Link from 'next/link'
import SignOutButton from '@/components/admin/SignOutButton'

export const dynamic = 'force-dynamic'

/**
 * Phase 2AD — Admin schedule (optional).
 * Optimizer lives on booking detail; this is a placeholder for a future calendar/scheduler view.
 */
export default function AdminSchedulePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-[#FFBC00] hover:underline text-sm mb-2 inline-block">
                ← Admin
              </Link>
              <h1 className="text-2xl font-bold">Schedule</h1>
              <p className="text-green-100 text-sm mt-1">
                Use booking detail for recommended chefs. Calendar view coming later.
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 mb-4">
            To assign the right chef to a booking, open the booking and expand <strong>Team Assignment</strong>.
            The <strong>Recommended Chefs</strong> panel shows the top 3 chefs by tier, performance, and workload balance.
          </p>
          <Link
            href="/admin/bookings"
            className="inline-block px-4 py-2 bg-[#1a5f3f] text-white rounded-lg font-medium hover:bg-[#144a30]"
          >
            View Bookings
          </Link>
        </div>
      </main>
    </div>
  )
}
