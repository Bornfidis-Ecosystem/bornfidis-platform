'use client'

import { useState, useEffect } from 'react'
import { getBookingPayouts, createPayout } from '../../payouts/actions'
import { getBookingFarmers } from '../actions'
import { PayoutStatus } from '@prisma/client'
import { formatUSD, dollarsToCents } from '@/lib/money'

interface Payout {
  id: string
  farmerId: string
  description: string
  amount: number
  status: PayoutStatus
  approvedAt: string | null
  paidAt: string | null
  notes: string | null
  createdAt: string
  farmer: {
    id: string
    name: string
    phone: string
  }
}

interface AssignedFarmer {
  farmerId: string
  farmerName: string
  farmerPhone: string
  role: string | null
}

interface PayoutSectionProps {
  bookingId: string
}

/**
 * Phase 4.5: Payout Section Component
 * Displays and manages payouts for a specific booking
 */
export default function PayoutSection({ bookingId }: PayoutSectionProps) {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [assignedFarmers, setAssignedFarmers] = useState<AssignedFarmer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    farmerId: '',
    description: '',
    amount: '',
    notes: '',
  })

  useEffect(() => {
    loadPayouts()
    loadAssignedFarmers()
  }, [bookingId])

  const loadAssignedFarmers = async () => {
    try {
      const result = await getBookingFarmers(bookingId)
      if (result.success && result.farmers) {
        setAssignedFarmers(result.farmers)
      }
    } catch (error) {
      console.error('Error loading assigned farmers:', error)
    }
  }

  const loadPayouts = async () => {
    setIsLoading(true)
    try {
      const result = await getBookingPayouts(bookingId)
      if (result.success && result.payouts) {
        setPayouts(result.payouts)
      } else {
        console.warn('Payouts not available:', result.error)
        setPayouts([])
      }
    } catch (error: any) {
      console.error('Error loading payouts:', error)
      setPayouts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePayout = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const amountCents = dollarsToCents(parseFloat(formData.amount) || 0)
      if (amountCents <= 0) {
        alert('Amount must be greater than 0')
        return
      }

      const result = await createPayout({
        bookingId,
        farmerId: formData.farmerId,
        description: formData.description,
        amount: amountCents,
        notes: formData.notes || undefined,
      })

      if (result.success) {
        setShowCreateForm(false)
        setFormData({
          farmerId: '',
          description: '',
          amount: '',
          notes: '',
        })
        await loadPayouts()
      } else {
        alert(result.error || 'Failed to create payout')
      }
    } catch (error) {
      console.error('Error creating payout:', error)
      alert('An error occurred')
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return <div className="text-center text-gray-500 py-4">Loading payouts...</div>
  }

  const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-navy">💰 Farmer Payouts</h3>
          <p className="text-sm text-gray-600 mt-1">
            Track compensation for assigned farmers. Total: {formatUSD(totalAmount)}
          </p>
        </div>
        {assignedFarmers.length > 0 && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-navy text-white rounded hover:bg-navy/90 text-sm"
          >
            {showCreateForm ? 'Cancel' : '+ Create Payout'}
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-navy mb-3">Create New Payout</h4>
          <form onSubmit={handleCreatePayout} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farmer *
              </label>
              <select
                value={formData.farmerId}
                onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy focus:border-transparent"
              >
                <option value="">Select farmer...</option>
                {assignedFarmers.map((assignment) => (
                  <option key={assignment.farmerId} value={assignment.farmerId}>
                    {assignment.farmerName} ({assignment.farmerPhone})
                    {assignment.role && ` - ${assignment.role}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Vegetables for 40 guests"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="250.00"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-navy text-white rounded hover:bg-navy/90 disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Payout'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setFormData({
                    farmerId: '',
                    description: '',
                    amount: '',
                    notes: '',
                  })
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payouts List */}
      {payouts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>No payouts created yet.</p>
          {assignedFarmers.length === 0 && (
            <p className="text-sm mt-2">Assign farmers to this booking first.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {payouts.map((payout) => (
            <div
              key={payout.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-navy">{payout.farmer.name}</span>
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
                  </div>
                  <p className="text-sm text-gray-700">{payout.description}</p>
                  {payout.notes && (
                    <p className="text-xs text-gray-500 mt-1">Notes: {payout.notes}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Created: {new Date(payout.createdAt).toLocaleDateString()}
                    {payout.approvedAt &&
                      ` • Approved: ${new Date(payout.approvedAt).toLocaleDateString()}`}
                    {payout.paidAt &&
                      ` • Paid: ${new Date(payout.paidAt).toLocaleDateString()}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-navy">{formatUSD(payout.amount)}</div>
                  <a
                    href="/admin/payouts"
                    className="text-xs text-navy hover:underline"
                  >
                    Manage →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

