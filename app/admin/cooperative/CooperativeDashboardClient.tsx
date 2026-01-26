'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CooperativeMember, CooperativePayout } from '@/types/cooperative'
import { formatUSD } from '@/lib/money'

interface CooperativeData {
  members: CooperativeMember[]
  recentPayouts: CooperativePayout[]
  totalMembers: number
  activeMembers: number
  totalPayouts: number
  avgImpactScore: number
  totalTrainings: number
  membersByRole: Record<string, number>
}

interface CooperativeDashboardClientProps {
  data: CooperativeData
}

export default function CooperativeDashboardClient({ data }: CooperativeDashboardClientProps) {
  const router = useRouter()
  const [isCalculating, setIsCalculating] = useState(false)
  const [isDistributing, setIsDistributing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleCalculateImpactScores = async () => {
    if (!confirm('Recalculate impact scores for all active members? This may take a few minutes.')) return

    setIsCalculating(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/cooperative/calculate-impact', {
        method: 'POST',
      })

      const result = await response.json()

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Impact scores calculated for ${result.members_updated} member${result.members_updated !== 1 ? 's' : ''}`,
        })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to calculate impact scores' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsCalculating(false)
    }
  }

  const handleDistributePayouts = async () => {
    const period = prompt('Enter payout period (e.g., 2024-01 for January 2024):')
    if (!period) return

    const profitInput = prompt('Enter total cooperative profit for this period (USD):')
    if (!profitInput) return

    const profitCents = Math.round(parseFloat(profitInput) * 100)
    if (isNaN(profitCents) || profitCents <= 0) {
      setMessage({ type: 'error', text: 'Invalid profit amount' })
      return
    }

    if (!confirm(`Distribute ${formatUSD(profitCents)} to cooperative members for period ${period}?`)) return

    setIsDistributing(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/cooperative/distribute-payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          period_type: 'monthly',
          total_profit_cents: profitCents,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Created ${result.payouts_created} payout${result.payouts_created !== 1 ? 's' : ''}, paid ${result.payouts_paid} via Stripe`,
        })
        if (result.errors && result.errors.length > 0) {
          console.warn('Payout errors:', result.errors)
        }
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to distribute payouts' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsDistributing(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'farmer': return 'bg-green-100 text-green-800'
      case 'chef': return 'bg-blue-100 text-blue-800'
      case 'educator': return 'bg-purple-100 text-purple-800'
      case 'builder': return 'bg-yellow-100 text-yellow-800'
      case 'partner': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
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
          <p className="text-sm text-gray-600 mb-1">Total Members</p>
          <p className="text-2xl font-bold text-[#1a5f3f]">{data.totalMembers}</p>
          <p className="text-xs text-gray-500 mt-1">{data.activeMembers} active</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Payouts</p>
          <p className="text-2xl font-bold text-[#1a5f3f]">{formatUSD(data.totalPayouts)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Avg Impact Score</p>
          <p className="text-2xl font-bold text-[#1a5f3f]">{data.avgImpactScore}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Trainings</p>
          <p className="text-2xl font-bold text-[#1a5f3f]">{data.totalTrainings}</p>
        </div>
      </div>

      {/* Governance Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4">Governance Controls</h2>
        <div className="flex gap-4">
          <button
            onClick={handleCalculateImpactScores}
            disabled={isCalculating}
            className="px-4 py-2 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition disabled:opacity-50"
          >
            {isCalculating ? 'Calculating...' : 'Calculate Impact Scores'}
          </button>
          <button
            onClick={handleDistributePayouts}
            disabled={isDistributing}
            className="px-4 py-2 bg-[#FFBC00] text-[#1a5f3f] rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
          >
            {isDistributing ? 'Distributing...' : 'Distribute Payouts'}
          </button>
        </div>
      </div>

      {/* Members by Role */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4">Members by Role</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(data.membersByRole).map(([role, count]) => (
            <div key={role} className="text-center">
              <div className={`px-3 py-2 rounded-lg ${getRoleBadgeColor(role)} mb-2`}>
                <span className="text-sm font-semibold capitalize">{role}</span>
              </div>
              <div className="text-2xl font-bold text-[#1a5f3f]">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#1a5f3f]">All Members</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-gray-600 font-semibold">Member</th>
                <th className="text-left py-3 px-6 text-gray-600 font-semibold">Role</th>
                <th className="text-left py-3 px-6 text-gray-600 font-semibold">Region</th>
                <th className="text-right py-3 px-6 text-gray-600 font-semibold">Impact Score</th>
                <th className="text-right py-3 px-6 text-gray-600 font-semibold">Payout Share</th>
                <th className="text-center py-3 px-6 text-gray-600 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No members yet. Applications will appear here.
                  </td>
                </tr>
              ) : (
                data.members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="py-3 px-6">
                      <div className="font-medium text-gray-900">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getRoleBadgeColor(member.role)}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-gray-700">{member.region}</td>
                    <td className="py-3 px-6 text-right font-semibold text-[#1a5f3f]">{member.impact_score}</td>
                    <td className="py-3 px-6 text-right font-semibold text-[#FFBC00]">
                      {member.payout_share_percent.toFixed(2)}%
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Payouts */}
      {data.recentPayouts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[#1a5f3f]">Recent Payouts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 text-gray-600 font-semibold">Member</th>
                  <th className="text-left py-3 px-6 text-gray-600 font-semibold">Period</th>
                  <th className="text-right py-3 px-6 text-gray-600 font-semibold">Amount</th>
                  <th className="text-right py-3 px-6 text-gray-600 font-semibold">Impact Score</th>
                  <th className="text-center py-3 px-6 text-gray-600 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.recentPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="py-3 px-6">
                      <div className="font-medium text-gray-900">{(payout.member as any)?.name || 'Loading...'}</div>
                      <div className="text-xs text-gray-500">{(payout.member as any)?.role || ''}</div>
                    </td>
                    <td className="py-3 px-6 text-gray-700">{payout.period}</td>
                    <td className="py-3 px-6 text-right font-semibold text-[#1a5f3f]">{formatUSD(payout.amount_cents)}</td>
                    <td className="py-3 px-6 text-right text-gray-700">{payout.impact_score}</td>
                    <td className="py-3 px-6 text-center">
                      {payout.payout_status === 'paid' ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">Paid</span>
                      ) : payout.payout_status === 'pending' ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">Pending</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">Failed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
