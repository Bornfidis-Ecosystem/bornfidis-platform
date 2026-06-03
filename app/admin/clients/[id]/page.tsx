import Link from 'next/link'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAdminUser } from '@/lib/requireAdmin'
import { updateClientProfileNotes } from './actions'
import { formatUSD } from '@/lib/money'

export default async function AdminClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdminUser()
  const { id } = await params

  const client = await db.clientProfile.findUnique({
    where: { id },
    include: {
      bookings: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          status: true,
          eventDate: true,
          location: true,
          quoteTotalCents: true,
          totalCents: true,
          createdAt: true,
        },
      },
    },
  })

  if (!client) notFound()

  const totalBookings = client.bookings.length
  const totalEstimatedRevenueCents = client.bookings.reduce((sum, booking) => {
    const cents = booking.quoteTotalCents ?? booking.totalCents ?? 0
    return sum + cents
  }, 0)

  async function saveNotes(formData: FormData) {
    'use server'
    const result = await updateClientProfileNotes(id, {
      dietaryPreferences: String(formData.get('dietaryPreferences') || ''),
      favoriteNotes: String(formData.get('favoriteNotes') || ''),
      preferredLocations: String(formData.get('preferredLocations') || ''),
      internalNotes: String(formData.get('internalNotes') || ''),
    })

    if (!result.success) {
      throw new Error(result.error || 'Failed to save client profile notes')
    }

    revalidatePath(`/admin/clients/${id}`)
    revalidatePath('/admin/clients')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white">
        <div className="container mx-auto px-4 py-6">
          <Link href="/admin/clients" className="text-gold text-sm hover:underline">
            ← Back to clients
          </Link>
          <h1 className="text-2xl font-bold mt-2">{client.name}</h1>
          <p className="text-gold text-sm mt-1">{totalBookings} booking{totalBookings === 1 ? '' : 's'}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Client identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="text-gray-900 font-medium mt-1">{client.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Phone</p>
              <p className="text-gray-900 font-medium mt-1">{client.phone || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="text-gray-900 font-medium mt-1">{client.email || '—'}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-700">
            Estimated revenue from linked bookings: <span className="font-semibold">{formatUSD(totalEstimatedRevenueCents)}</span>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences and internal memory</h2>
          <form action={saveNotes} className="space-y-4">
            <div>
              <label htmlFor="dietaryPreferences" className="block text-sm font-medium text-gray-700 mb-1">Dietary preferences</label>
              <textarea id="dietaryPreferences" name="dietaryPreferences" defaultValue={client.dietaryPreferences || ''} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label htmlFor="favoriteNotes" className="block text-sm font-medium text-gray-700 mb-1">Favorite notes</label>
              <textarea id="favoriteNotes" name="favoriteNotes" defaultValue={client.favoriteNotes || ''} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label htmlFor="preferredLocations" className="block text-sm font-medium text-gray-700 mb-1">Preferred locations</label>
              <textarea id="preferredLocations" name="preferredLocations" defaultValue={client.preferredLocations || ''} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label htmlFor="internalNotes" className="block text-sm font-medium text-gray-700 mb-1">Internal notes</label>
              <textarea id="internalNotes" name="internalNotes" defaultValue={client.internalNotes || ''} rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            </div>
            <button type="submit" className="inline-flex items-center rounded-lg bg-navy text-white px-4 py-2 font-semibold hover:opacity-90">
              Save client profile
            </button>
          </form>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Related bookings</h2>
          {client.bookings.length === 0 ? (
            <p className="text-sm text-gray-500">No linked bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {client.bookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900">{booking.name}</p>
                    <p className="text-sm text-gray-600">
                      {booking.eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} · {booking.location}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Status: {booking.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-700 font-semibold">{formatUSD(booking.quoteTotalCents ?? booking.totalCents ?? 0)}</p>
                    <Link href={`/admin/bookings/${booking.id}`} className="text-sm text-navy hover:underline">
                      View booking
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

