'use client'

import { useState, useEffect } from 'react'
import { getFarmersForDashboard, updateFarmerStatusAction } from '@/lib/farmer-dashboard-actions'
import type { GetFarmersFilters } from '@/lib/farmer-service'

interface FarmerRow {
  id: string
  name: string
  phone?: string
  location?: string
  parish?: string
  farmer_status?: string
  crops_available?: string[]
  typical_weekly_volume_lbs?: number
  weekly_volume_lbs?: number
  preferred_collection_day?: string
  created_at?: string
  notes?: string
}

export default function FarmerDashboard() {
  const [farmers, setFarmers] = useState<FarmerRow[]>([])
  const [filter, setFilter] = useState<'all' | string>('all')
  const [loading, setLoading] = useState(true)

  const loadFarmers = async () => {
    setLoading(true)
    const filters: GetFarmersFilters = filter === 'all' ? {} : { status: filter }
    const result = await getFarmersForDashboard(filters)
    if (result.success && result.data) {
      setFarmers(Array.isArray(result.data) ? result.data : [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadFarmers()
  }, [filter])

  const handleStatusChange = async (farmerId: string, newStatus: string) => {
    const result = await updateFarmerStatusAction(farmerId, newStatus)
    if (result.success) {
      loadFarmers()
      alert('Status updated!')
    } else {
      alert(result.error ?? 'Failed to update status')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-800 mb-6">🌾 Farmer Network</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all' ? 'bg-green-700 text-white' : 'bg-gray-200'
            }`}
          >
            All ({farmers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('inquiry')}
            className={`px-4 py-2 rounded ${
              filter === 'inquiry' ? 'bg-yellow-500 text-white' : 'bg-gray-200'
            }`}
          >
            New Inquiries
          </button>
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded ${
              filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded ${
              filter === 'inactive' ? 'bg-gray-500 text-white' : 'bg-gray-200'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : farmers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No farmers found</div>
        ) : (
          farmers.map((farmer) => (
            <div key={farmer.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-green-800">{farmer.name}</h3>
                  <p className="text-gray-600">
                    {farmer.location ?? ''}
                    {farmer.location && farmer.parish ? ', ' : ''}
                    {farmer.parish ?? ''}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    farmer.farmer_status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : farmer.farmer_status === 'inquiry'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {farmer.farmer_status ?? '—'}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  {farmer.phone && (
                    <p className="text-sm text-gray-600">📱 {farmer.phone}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    🌱 {farmer.crops_available?.join(', ') ?? '—'}
                  </p>
                  {(farmer.typical_weekly_volume_lbs ?? farmer.weekly_volume_lbs) != null && (
                    <p className="text-sm text-gray-600">
                      📦 ~
                      {String(
                        farmer.typical_weekly_volume_lbs ?? farmer.weekly_volume_lbs
                      )}{' '}
                      lbs/week
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    📅 Prefers: {farmer.preferred_collection_day ?? '—'}
                  </p>
                  {farmer.created_at && (
                    <p className="text-sm text-gray-600">
                      📅 Registered:{' '}
                      {new Date(farmer.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {farmer.notes && (
                <div className="bg-gray-50 p-3 rounded mb-4">
                  <p className="text-sm text-gray-700">{farmer.notes}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {farmer.farmer_status === 'inquiry' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(farmer.id, 'active')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Activate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(farmer.id, 'inactive')}
                      className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    >
                      Decline
                    </button>
                  </>
                )}
                {farmer.farmer_status === 'active' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(farmer.id, 'inactive')}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                  >
                    Mark Inactive
                  </button>
                )}
                {farmer.farmer_status === 'inactive' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(farmer.id, 'active')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Reactivate
                  </button>
                )}
                {farmer.phone && (
                  <a
                    href={`https://wa.me/${farmer.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 inline-block"
                  >
                    💬 WhatsApp
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
