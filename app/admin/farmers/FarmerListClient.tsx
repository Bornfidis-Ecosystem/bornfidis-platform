'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Farmer, FarmerStatus } from '@/types/farmer'

interface FarmerListClientProps {
  farmers: Farmer[]
}

export default function FarmerListClient({ farmers }: FarmerListClientProps) {
  const router = useRouter()
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleApprove = async (farmerId: string) => {
    setProcessingId(farmerId)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/farmers/${farmerId}/approve`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Farmer approved! Stripe onboarding link created.' })
        router.refresh()
      } else {
        const errorText = data.error || 'Failed to approve farmer'
        setMessage({ type: 'error', text: errorText })

        if (errorText.includes('Connect') || errorText.includes('connect')) {
          console.error('Stripe Connect Error:', errorText)
        }
      }
    } catch (error: any) {
      console.error('Network error approving farmer:', error)
      setMessage({ type: 'error', text: error.message || 'Network error. Please check your connection and try again.' })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (farmerId: string) => {
    const reason = prompt('Rejection reason (optional):')
    setProcessingId(farmerId)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/farmers/${farmerId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: reason || null }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Farmer application rejected' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to reject farmer' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setProcessingId(null)
    }
  }

  const getAdminStatusBadge = (farmer: Farmer) => {
    if (farmer.status === 'inactive') {
      return { text: 'Inactive', color: 'bg-gray-100 text-gray-800' }
    }

    if (farmer.status === 'pending') {
      return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' }
    }

    if (farmer.status === 'approved') {
      if (farmer.stripe_connect_status === 'connected') {
        return { text: 'Connected', color: 'bg-green-100 text-green-800' }
      }
      if (farmer.stripe_connect_status === 'restricted') {
        return { text: 'Onboarding Required', color: 'bg-orange-100 text-orange-800' }
      }
      if (farmer.stripe_account_id) {
        return { text: 'Onboarding Required', color: 'bg-orange-100 text-orange-800' }
      }
      return { text: 'Approved', color: 'bg-blue-100 text-blue-800' }
    }

    return { text: farmer.status, color: 'bg-gray-100 text-gray-800' }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (farmers.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No farmers found. Applications will appear here.</p>
      </div>
    )
  }

  return (
    <div>
      {message && (
        <div
          className={`mx-6 mt-4 p-4 rounded-lg ${message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}
        >
          <p className="font-semibold mb-1">{message.type === 'error' ? 'Error' : 'Success'}</p>
          <p className="text-sm">{message.text}</p>
          {message.type === 'error' && message.text.includes('Connect') && (
            <div className="mt-3 pt-3 border-t border-red-300">
              <p className="text-xs font-semibold mb-1">How to fix:</p>
              <ol className="text-xs list-decimal list-inside space-y-1">
                <li>Go to <a href="https://dashboard.stripe.com/connect" target="_blank" rel="noopener noreferrer" className="underline">Stripe Dashboard → Connect</a></li>
                <li>Click "Get started" or "Activate Connect"</li>
                <li>Choose "Express accounts"</li>
                <li>Complete the setup process</li>
                <li>Try approving the farmer again</li>
              </ol>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">FARMER</th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">STATUS</th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">APPLIED</th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">STRIPE</th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">LOCATION</th>
              <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {farmers.map((farmer) => {
              const statusBadge = getAdminStatusBadge(farmer)
              const isProcessing = processingId === farmer.id

              return (
                <tr key={farmer.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{farmer.name}</div>
                    <div className="text-sm text-gray-500">{farmer.email}</div>
                    {farmer.phone && (
                      <div className="text-xs text-gray-400">{farmer.phone}</div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                      {statusBadge.text}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {formatDate(farmer.created_at)}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {farmer.stripe_connect_status === 'connected' ? (
                      <span className="text-green-600 font-medium">✓ Connected</span>
                    ) : farmer.stripe_connect_status === 'pending' ? (
                      <span className="text-yellow-600">⏳ Onboarding</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {farmer.location || '—'}
                    {farmer.parish && (
                      <div className="text-xs text-gray-400">{farmer.parish}</div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {farmer.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(farmer.id)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 bg-[#1a5f3f] text-white text-sm font-semibold rounded hover:bg-[#154a32] transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessing ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(farmer.id)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {farmer.status === 'approved' && farmer.stripe_connect_status !== 'connected' && (
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/admin/farmers/${farmer.id}/send-onboarding`)
                              const data = await response.json()
                              if (data.success) {
                                setMessage({ type: 'success', text: 'Onboarding link sent!' })
                              } else {
                                setMessage({ type: 'error', text: data.error || 'Failed to send onboarding link' })
                              }
                            } catch (error) {
                              setMessage({ type: 'error', text: 'An error occurred' })
                            }
                          }}
                          className="px-3 py-1.5 bg-[#FFBC00] text-[#1a5f3f] text-sm font-semibold rounded hover:bg-opacity-90 transition"
                        >
                          Send Onboarding
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
