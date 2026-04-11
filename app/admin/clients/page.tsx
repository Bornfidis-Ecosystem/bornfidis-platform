import Link from 'next/link'
import { db } from '@/lib/db'
import { requireAdminUser } from '@/lib/requireAdmin'

function formatDate(value?: Date | null) {
  if (!value) return '—'
  return value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function AdminClientsPage() {
  await requireAdminUser()

  const clients = await db.clientProfile.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { bookings: true } },
      bookings: {
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Client Profiles</h1>
          <p className="text-gold text-sm mt-1">{clients.length} total client{clients.length === 1 ? '' : 's'}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Booking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-5 text-center text-sm text-gray-500">
                      No client profiles yet.
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{client.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{client.phone || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{client.email || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{client._count.bookings}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatDate(client.bookings[0]?.createdAt)}</td>
                      <td className="px-6 py-4 text-sm">
                        <Link href={`/admin/clients/${client.id}`} className="text-navy hover:underline font-medium">
                          View profile
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

