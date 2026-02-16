'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FarmerApplication {
  id: string
  created_at: string
  name: string
  phone: string
  parish: string | null
  acres: number | null
  crops: string | null
  status: string
  voice_ready: boolean
}

interface CoordinatorDashboardClientProps {
  initialData: {
    farmers: FarmerApplication[]
    parishes: string[]
    crops: string[]
  }
}

export default function CoordinatorDashboardClient({ initialData }: CoordinatorDashboardClientProps) {
  const router = useRouter()
  const [farmers] = useState(initialData.farmers)
  const [selectedParish, setSelectedParish] = useState<string>('all')
  const [selectedCrop, setSelectedCrop] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCalling, setIsCalling] = useState<string | null>(null)
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Filter farmers
  const filteredFarmers = useMemo(() => {
    return farmers.filter(farmer => {
      // Parish filter
      if (selectedParish !== 'all' && farmer.parish !== selectedParish) {
        return false
      }

      // Crop filter
      if (selectedCrop !== 'all') {
        const farmerCrops = farmer.crops?.toLowerCase().split(',').map(c => c.trim()) || []
        if (!farmerCrops.some(c => c.includes(selectedCrop.toLowerCase()))) {
          return false
        }
      }

      // Status filter
      if (selectedStatus !== 'all' && farmer.status !== selectedStatus) {
        return false
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = farmer.name.toLowerCase().includes(query)
        const matchesPhone = farmer.phone.includes(query)
        const matchesCrops = farmer.crops?.toLowerCase().includes(query)
        if (!matchesName && !matchesPhone && !matchesCrops) {
          return false
        }
      }

      return true
    })
  }, [farmers, selectedParish, selectedCrop, selectedStatus, searchQuery])

  const handleCall = async (farmerId: string, farmerPhone: string) => {
    setIsCalling(farmerId)
    setMessage(null)

    try {
      const response = await fetch('/api/farmers/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_id: farmerId,
          coordinator_phone: '', // Coordinator can enter their phone in the detail page
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Call initiated! The farmer will receive a call shortly.' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to initiate call' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' })
    } finally {
      setIsCalling(null)
    }
  }

  const handleSendWhatsApp = async (farmerId: string, farmerPhone: string, farmerName: string) => {
    setIsSendingWhatsApp(farmerId)
    setMessage(null)

    try {
      const response = await fetch('/api/farmers/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_id: farmerId,
          phone: farmerPhone,
          message: `Hello ${farmerName}, this is Bornfidis Portland. We're excited to connect with you! How can we help you today?`,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'WhatsApp message sent!' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send WhatsApp' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' })
    } finally {
      setIsSendingWhatsApp(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'declined':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name, phone, crops..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
            />
          </div>

          {/* Parish Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parish</label>
            <select
              value={selectedParish}
              onChange={(e) => setSelectedParish(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
            >
              <option value="all">All Parishes</option>
              {initialData.parishes.map(parish => (
                <option key={parish} value={parish}>{parish}</option>
              ))}
            </select>
          </div>

          {/* Crop Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
            >
              <option value="all">All Crops</option>
              {initialData.crops.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredFarmers.length} of {farmers.length} farmers
        </div>
      </div>

      {/* Farmers List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parish
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crops
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFarmers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No farmers found.
                  </td>
                </tr>
              ) : (
                filteredFarmers.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{farmer.name}</div>
                      {farmer.voice_ready && (
                        <span className="text-xs text-gold">🎙️ Voice Ready</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a href={`tel:${farmer.phone}`} className="text-[#1a5f3f] hover:underline">
                        {farmer.phone}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {farmer.parish || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {farmer.crops || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(farmer.status)}`}>
                        {farmer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/farmers/${farmer.id}`}
                          className="px-3 py-1 bg-[#1a5f3f] text-white rounded-lg hover:bg-[#154a32] transition text-xs"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleCall(farmer.id, farmer.phone)}
                          disabled={isCalling === farmer.id}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs disabled:opacity-50"
                        >
                          {isCalling === farmer.id ? 'Calling...' : '📞 Call'}
                        </button>
                        <button
                          onClick={() => handleSendWhatsApp(farmer.id, farmer.phone, farmer.name)}
                          disabled={isSendingWhatsApp === farmer.id}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs disabled:opacity-50"
                        >
                          {isSendingWhatsApp === farmer.id ? 'Sending...' : '💬 WhatsApp'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

