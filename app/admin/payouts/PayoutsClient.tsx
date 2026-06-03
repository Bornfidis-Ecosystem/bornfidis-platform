'use client'

import { useState, useEffect } from 'react'
import { getAllPayouts, approvePayout, markPayoutPaid } from './actions'
import { PayoutStatus } from '@prisma/client'
import { centsToDollars, formatUSD } from '@/lib/money'

interface Payout {
  id: string
  bookingId: string
  farmerId: string
  description: string
  amount: number
  status: PayoutStatus
  approvedAt: string | null
  paidAt: string | null
  notes: string | null
  createdAt: string
  booking: {
    id: string
    name: string
    eventDate: string
  }
  farmer: {
    id: string
    name: string
    phone: string
  }
}

/**
 * Phase 4.5: Payouts Client Component
 * Displays and manages farmer payouts
 */
export default function PayoutsClient() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<PayoutStatus | 'ALL'>('ALL')
  const [filterFarmerId, setFilterFarmerId] = useState<string>('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    loadPayouts()
  }, [filterStatus, filterFarmerId])

  const loadPayouts = async () => {
    setIsLoading(true)
    try {
      const result = await getAllPayouts({
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        farmerId: filterFarmerId || undefined,
      })
      if (result.success && result.payouts) {
        setPayouts(result.payouts)
      } else {
        console.error('Failed to load payouts:', result.error)
        setPayouts([])
      }
    } catch (error) {
      console.error('Error loading payouts:', error)
      setPayouts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (payoutId: string) => {
    if (!confirm('Approve this payout? This action cannot be undone.')) {
      return
    }

    setUpdatingId(payoutId)
    try {
      const result = await approvePayout(payoutId)
      if (result.success) {
        await loadPayouts()
      } else {
        alert(result.error || 'Failed to approve payout')
      }
    } catch (error) {
      console.error('Error approving payout:', error)
      alert('An error occurred')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleMarkPaid = async (payoutId: string) => {
    if (!confirm('Mark this payout as paid? This confirms the payment has been completed.')) {
      return
    }

    setUpdatingId(payoutId)
    try {
      const result = await markPayoutPaid(payoutId)
      if (result.success) {
        await loadPayouts()
      } else {
        alert(result.error || 'Failed to mark payout as paid')
      }
    } catch (error) {
      console.error('Error marking payout as paid:', error)
      alert('An error occurred')
    } finally {
      setUpdatingId(null)
    }
  }

  if (isLoading) {
    return <div className="text-center text-gray-500 py-8">Loading payouts...</div>
  }

  // Calculate totals
  const totalPending = payouts
    .filter((p) => p.status === PayoutStatus.PENDING)
    .reduce((sum, p) => sum + p.amount, 0)
  const totalApproved = payouts
    .filter((p) => p.status === PayoutStatus.APPROVED)
    .reduce((sum, p) => sum + p.amount, 0)
  const totalPaid = payouts
    .filter((p) => p.status === PayoutStatus.PAID)
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-navy mb-2">All Payouts</h2>
        <p className="text-sm text-gray-600">
          Track farmer compensation for each event. Payouts must be approved before marking as paid.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-800 font-medium">Pending</div>
          <div className="text-2xl font-bold text-yellow-900">{formatUSD(centsToDollars(totalPending))}</div>
          <div className="text-xs text-yellow-700 mt-1">
            {payouts.filter((p) => p.status === PayoutStatus.PENDING).length} payout(s)
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800 font-medium">Approved</div>
          <div className="text-2xl font-bold text-blue-900">{formatUSD(centsToDollars(totalApproved))}</div>
          <div className="text-xs text-blue-700 mt-1">
            {payouts.filter((p) => p.status === PayoutStatus.APPROVED).length} payout(s)
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-800 font-medium">Paid</div>
          <div className="text-2xl font-bold text-green-900">{formatUSD(centsToDollars(totalPaid))}</div>
          <div className="text-xs text-green-700 mt-1">
            {payouts.filter((p) => p.status === PayoutStatus.PAID).length} payout(s)
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as PayoutStatus | 'ALL')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy focus:border-transparent"
          >
            <option value="ALL">All Statuses</option>
            <option value={PayoutStatus.PENDING}>Pending</option>
            <option value={PayoutStatus.APPROVED}>Approved</option>
            <option value={PayoutStatus.PAID}>Paid</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Farmer Phone</label>
          <input
            type="text"
            value={filterFarmerId}
            onChange={(e) => setFilterFarmerId(e.target.value)}
            placeholder="Filter by farmer phone..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy focus:border-transparent"
          />
        </div>
      </div>

      {/* Payouts Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-navy text-white text-sm">
              <th className="border p-3 text-left">Farmer</th>
              <th className="border p-3 text-left">Event</th>
              <th className="border p-3 text-left">Description</th>
              <th className="border p-3 text-right">Amount</th>
              <th className="border p-3 text-left">Status</th>
              <th className="border p-3 text-left">Created</th>
              <th className="border p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payouts.length === 0 ? (
              <tr>
                <td colSpan={7} className="border p-8 text-center text-gray-500">
                  No payouts found
                </td>
              </tr>
            ) : (
              payouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50">
                  <td className="border p-3">
                    <div className="font-medium">{payout.farmer.name}</div>
                    <div className="text-xs text-gray-500">{payout.farmer.phone}</div>
                  </td>
                  <td className="border p-3">
                    <div className="font-medium">{payout.booking.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(payout.booking.eventDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </td>
                  <td className="border p-3">{payout.description}</td>
                  <td className="border p-3 text-right font-semibold">
                    {formatUSD(payout.amount)}
                  </td>
                  <td className="border p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        payout.status === PayoutStatus.PENDING
                          ? 'bg-yellow-100 text-yellow-800'
                          : payout.status === PayoutStatus.APPROVED
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {payout.status}
                    </span>
                    {payout.approvedAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Approved: {new Date(payout.approvedAt).toLocaleDateString()}
                      </div>
                    )}
                    {payout.paidAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Paid: {new Date(payout.paidAt).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="border p-3 text-sm text-gray-600">
                    {new Date(payout.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="border p-3">
                    <div className="flex gap-2">
                      {payout.status === PayoutStatus.PENDING && (
                        <button
                          onClick={() => handleApprove(payout.id)}
                          disabled={updatingId === payout.id}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {payout.status === PayoutStatus.APPROVED && (
                        <button
                          onClick={() => handleMarkPaid(payout.id)}
                          disabled={updatingId === payout.id}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Mark Paid
                        </button>
                      )}
                      {payout.status === PayoutStatus.PAID && (
                        <span className="text-xs text-gray-500">Completed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Payout Workflow</h3>
        <div className="text-xs text-blue-800 space-y-1">
          <div>
            <strong>PENDING:</strong> Payout created, awaiting admin review
          </div>
          <div>
            <strong>APPROVED:</strong> Admin reviewed and approved, ready for payment
          </div>
          <div>
            <strong>PAID:</strong> Payment completed (cash/transfer confirmed)
          </div>
        </div>
      </div>
    </div>
  )
}

