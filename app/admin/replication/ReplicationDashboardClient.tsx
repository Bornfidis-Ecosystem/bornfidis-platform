'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReplicationRegion, ReplicationKit, ImpactInvestor } from '@/types/replication'
import { formatUSD } from '@/lib/money'

interface ReplicationData {
  regions: ReplicationRegion[]
  kits: ReplicationKit[]
  investors: ImpactInvestor[]
  totalRegions: number
  activeRegions: number
  launchingRegions: number
  totalCapitalRaised: number
  totalCapitalCommitted: number
  totalKits: number
}

interface ReplicationDashboardClientProps {
  data: ReplicationData
}

export default function ReplicationDashboardClient({ data }: ReplicationDashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'regions' | 'kits' | 'investors'>('regions')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleApproveRegion = async (regionId: string) => {
    if (!confirm('Approve this region to proceed with launch planning?')) return

    try {
      const response = await fetch(`/api/admin/replication/regions/${regionId}/approve`, {
        method: 'POST',
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Region approved successfully' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to approve region' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    }
  }

  const handleRejectRegion = async (regionId: string) => {
    const reason = prompt('Rejection reason (optional):')
    if (reason === null) return

    try {
      const response = await fetch(`/api/admin/replication/regions/${regionId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || null }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Region rejected' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to reject region' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'launching': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-yellow-100 text-yellow-800'
      case 'inquiry': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getKitTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'chef': return 'bg-blue-100 text-blue-800'
      case 'farm': return 'bg-green-100 text-green-800'
      case 'market': return 'bg-purple-100 text-purple-800'
      case 'housing': return 'bg-yellow-100 text-yellow-800'
      case 'education': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getInvestorStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paid': return 'bg-blue-100 text-blue-800'
      case 'committed': return 'bg-yellow-100 text-yellow-800'
      case 'inquiry': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg ${message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}
        >
          {message.text}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Regions</p>
          <p className="text-2xl font-bold text-[#1a5f3f]">{data.totalRegions}</p>
          <p className="text-xs text-gray-500 mt-1">{data.activeRegions} active, {data.launchingRegions} launching</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Capital Raised</p>
          <p className="text-2xl font-bold text-[#1a5f3f]">{formatUSD(data.totalCapitalRaised)}</p>
          <p className="text-xs text-gray-500 mt-1">{formatUSD(data.totalCapitalCommitted)} committed</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Replication Kits</p>
          <p className="text-2xl font-bold text-[#1a5f3f]">{data.totalKits}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Impact Investors</p>
          <p className="text-2xl font-bold text-[#1a5f3f]">{data.investors.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('regions')}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === 'regions'
                  ? 'border-[#1a5f3f] text-[#1a5f3f]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Regions ({data.regions.length})
            </button>
            <button
              onClick={() => setActiveTab('kits')}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === 'kits'
                  ? 'border-[#1a5f3f] text-[#1a5f3f]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Kits ({data.kits.length})
            </button>
            <button
              onClick={() => setActiveTab('investors')}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === 'investors'
                  ? 'border-[#1a5f3f] text-[#1a5f3f]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Investors ({data.investors.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Regions Tab */}
          {activeTab === 'regions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 text-gray-600 font-semibold">Region</th>
                    <th className="text-left py-3 px-6 text-gray-600 font-semibold">Leader</th>
                    <th className="text-left py-3 px-6 text-gray-600 font-semibold">Country</th>
                    <th className="text-right py-3 px-6 text-gray-600 font-semibold">Capital Needed</th>
                    <th className="text-center py-3 px-6 text-gray-600 font-semibold">Status</th>
                    <th className="text-right py-3 px-6 text-gray-600 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.regions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No regions yet. Applications will appear here.
                      </td>
                    </tr>
                  ) : (
                    data.regions.map((region) => (
                      <tr key={region.id} className="hover:bg-gray-50">
                        <td className="py-3 px-6">
                          <div className="font-medium text-gray-900">{region.name}</div>
                          {region.city && (
                            <div className="text-xs text-gray-500">{region.city}</div>
                          )}
                        </td>
                        <td className="py-3 px-6">
                          <div className="text-gray-900">{region.leader_name}</div>
                          <div className="text-xs text-gray-500">{region.leader_email}</div>
                        </td>
                        <td className="py-3 px-6 text-gray-700">{region.country}</td>
                        <td className="py-3 px-6 text-right font-semibold text-[#1a5f3f]">
                          {formatUSD(region.capital_needed_cents)}
                        </td>
                        <td className="py-3 px-6 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(region.status)}`}>
                            {region.status}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-right">
                          {region.status === 'inquiry' && (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleApproveRegion(region.id)}
                                className="px-3 py-1 bg-[#1a5f3f] text-white text-xs font-semibold rounded hover:bg-[#154a32] transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectRegion(region.id)}
                                className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Kits Tab */}
          {activeTab === 'kits' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#1a5f3f]">Replication Kits</h3>
                <a
                  href="/admin/replication/kits/new"
                  className="px-4 py-2 bg-[#1a5f3f] text-white rounded-lg text-sm font-semibold hover:bg-[#154a32] transition"
                >
                  + Create Kit
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.kits.map((kit) => (
                  <div key={kit.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{kit.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getKitTypeBadgeColor(kit.kit_type)}`}>
                          {kit.kit_type}
                        </span>
                      </div>
                      {kit.required_for_launch && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">Required</span>
                      )}
                    </div>
                    {kit.description && (
                      <p className="text-sm text-gray-600 mb-2">{kit.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Version: {kit.version}</span>
                      {kit.estimated_completion_days && (
                        <span>{kit.estimated_completion_days} days</span>
                      )}
                      {kit.is_public && (
                        <span className="text-green-600">Public</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Investors Tab */}
          {activeTab === 'investors' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 text-gray-600 font-semibold">Investor</th>
                    <th className="text-left py-3 px-6 text-gray-600 font-semibold">Organization</th>
                    <th className="text-left py-3 px-6 text-gray-600 font-semibold">Regions</th>
                    <th className="text-right py-3 px-6 text-gray-600 font-semibold">Committed</th>
                    <th className="text-right py-3 px-6 text-gray-600 font-semibold">Paid</th>
                    <th className="text-center py-3 px-6 text-gray-600 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.investors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No investors yet. Applications will appear here.
                      </td>
                    </tr>
                  ) : (
                    data.investors.map((investor) => (
                      <tr key={investor.id} className="hover:bg-gray-50">
                        <td className="py-3 px-6">
                          <div className="font-medium text-gray-900">{investor.name}</div>
                          <div className="text-xs text-gray-500">{investor.email}</div>
                        </td>
                        <td className="py-3 px-6 text-gray-700">{investor.organization || '—'}</td>
                        <td className="py-3 px-6 text-gray-700">
                          {investor.region_interest && investor.region_interest.length > 0
                            ? investor.region_interest.join(', ')
                            : '—'}
                        </td>
                        <td className="py-3 px-6 text-right font-semibold text-[#1a5f3f]">
                          {formatUSD(investor.capital_committed_cents)}
                        </td>
                        <td className="py-3 px-6 text-right font-semibold text-green-600">
                          {formatUSD(investor.capital_paid_cents)}
                        </td>
                        <td className="py-3 px-6 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getInvestorStatusBadgeColor(investor.status)}`}>
                            {investor.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
