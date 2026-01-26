import Link from 'next/link'
import { getAllBookings } from './actions'
import { BookingInquiry, BookingStatus } from '@/types/booking'
import SignOutButton from '@/components/admin/SignOutButton'

/**
 * Admin Bookings Dashboard
 * Lists all booking inquiries in a clean table
 * TODO: Phase 2B - Add authentication middleware here
 */
export default async function AdminBookingsPage() {
  const result = await getAllBookings()

  if (!result.success) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-semibold">Error loading bookings</p>
            <p className="text-sm mt-1">{result.error}</p>
          </div>
        </div>
      </div>
    )
  }

  const bookings = result.bookings || []

  const getStatusBadgeColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
      case 'New':
        return 'bg-blue-100 text-blue-800'
      case 'reviewed':
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-800'
      case 'quoted':
        return 'bg-purple-100 text-purple-800'
      case 'booked':
      case 'Confirmed':
        return 'bg-green-100 text-green-800'
      case 'declined':
      case 'Closed':
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-navy text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Bookings Dashboard</h1>
              <p className="text-gold text-sm mt-1">Manage all booking inquiries</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/submissions"
                className="px-4 py-2 bg-gold text-navy rounded hover:bg-opacity-90 transition text-sm font-semibold"
              >
                Legacy Submissions
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No bookings found</p>
              <p className="text-sm mt-2">Bookings will appear here once customers submit inquiries.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.email || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(booking.event_date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDateTime(booking.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="px-3 py-1 bg-navy text-white rounded hover:bg-opacity-90 transition text-xs font-semibold"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {bookings.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Total Bookings</div>
              <div className="text-2xl font-bold text-navy mt-1">{bookings.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Pending</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {bookings.filter(b => b.status === 'pending' || b.status === 'New').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Booked</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {bookings.filter(b => b.status === 'booked' || b.status === 'Confirmed').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Declined</div>
              <div className="text-2xl font-bold text-gray-600 mt-1">
                {bookings.filter(b => b.status === 'declined' || b.status === 'Closed').length}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
