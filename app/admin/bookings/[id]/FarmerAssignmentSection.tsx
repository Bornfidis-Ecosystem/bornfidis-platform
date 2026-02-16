'use client'

import { useState, useEffect } from 'react'
import { getBookingFarmers, assignFarmerToBooking, removeFarmerFromBooking, getAllFarmers } from '../actions'
import { notifyClient } from '@/lib/notify'
import { farmerAssignmentWA } from '@/lib/whatsapp-templates'

interface AssignedFarmer {
  id: string
  farmerId: string
  farmerName: string
  farmerPhone: string
  role: string | null
  notes: string | null
  createdAt: string
}

interface Farmer {
  id: string
  name: string
  phone: string
  parish: string | null
}

interface FarmerAssignmentSectionProps {
  bookingId: string
  eventDate: string
}

/**
 * Phase 4: Farmer Assignment Component
 * Allows admin to assign farmers to bookings and notify them via WhatsApp
 */
export default function FarmerAssignmentSection({ bookingId, eventDate }: FarmerAssignmentSectionProps) {
  const [assignedFarmers, setAssignedFarmers] = useState<AssignedFarmer[]>([])
  const [availableFarmers, setAvailableFarmers] = useState<Farmer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedFarmerId, setSelectedFarmerId] = useState('')
  const [role, setRole] = useState('')
  const [notes, setNotes] = useState('')
  const [sendNotification, setSendNotification] = useState(false)

  useEffect(() => {
    loadData()
  }, [bookingId])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [farmersResult, allFarmersResult] = await Promise.all([
        getBookingFarmers(bookingId),
        getAllFarmers(),
      ])
      
      if (farmersResult.success) {
        setAssignedFarmers(farmersResult.farmers || [])
      }
      
      if (allFarmersResult.success) {
        setAvailableFarmers(allFarmersResult.farmers || [])
      }
    } catch (error) {
      console.error('Error loading farmer data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedFarmerId) {
      alert('Please select a farmer')
      return
    }

    setIsAssigning(true)
    try {
      const result = await assignFarmerToBooking(bookingId, selectedFarmerId, role || undefined, notes || undefined)
      
      if (result.success) {
        // Reload assigned farmers
        await loadData()
        
        // Send WhatsApp notification if requested
        if (sendNotification) {
          const farmer = availableFarmers.find((f) => f.id === selectedFarmerId)
          if (farmer) {
            const eventDateFormatted = new Date(eventDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
            
            // Check if farmer prefers WhatsApp (for now, assume yes if we're sending)
            const prefersWhatsApp = true // In future, check farmer's preference
            
            notifyClient({
              phone: farmer.phone,
              prefersWhatsApp,
              message: farmerAssignmentWA(farmer.name, role || null, eventDateFormatted),
            }).catch((error) => {
              console.error('Error sending farmer assignment notification (non-blocking):', error)
            })
          }
        }
        
        // Reset form
        setShowAssignModal(false)
        setSelectedFarmerId('')
        setRole('')
        setNotes('')
        setSendNotification(false)
      } else {
        alert(result.error || 'Failed to assign farmer')
      }
    } catch (error) {
      console.error('Error assigning farmer:', error)
      alert('An error occurred')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemove = async (assignmentId: string, farmerName: string) => {
    if (!confirm(`Remove ${farmerName} from this booking?`)) {
      return
    }

    try {
      const result = await removeFarmerFromBooking(assignmentId)
      if (result.success) {
        await loadData()
      } else {
        alert(result.error || 'Failed to remove farmer')
      }
    } catch (error) {
      console.error('Error removing farmer:', error)
      alert('An error occurred')
    }
  }

  if (isLoading) {
    return (
      <div className="border-t pt-6">
        <div className="text-center text-gray-500 py-4">Loading farmer assignments...</div>
      </div>
    )
  }

  return (
    <div className="border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-navy">🌾 Assigned Farmers</h3>
        <button
          onClick={() => setShowAssignModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-sm"
        >
          + Assign Farmer
        </button>
      </div>

      {assignedFarmers.length === 0 ? (
        <p className="text-gray-500 text-sm">No farmers assigned yet. Click "Assign Farmer" to get started.</p>
      ) : (
        <div className="space-y-3">
          {assignedFarmers.map((assignment) => (
            <div
              key={assignment.id}
              className="p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{assignment.farmerName}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {assignment.farmerPhone}
                  </div>
                  {assignment.role && (
                    <div className="text-sm text-blue-600 mt-1 font-medium">Role: {assignment.role}</div>
                  )}
                  {assignment.notes && (
                    <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded border">
                      <strong>Notes:</strong> {assignment.notes}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(assignment.id, assignment.farmerName)}
                  className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Farmer Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-navy mb-4">Assign Farmer to Booking</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Farmer
                </label>
                <select
                  value={selectedFarmerId}
                  onChange={(e) => setSelectedFarmerId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">-- Select a farmer --</option>
                  {availableFarmers
                    .filter((farmer) => !assignedFarmers.some((af) => af.farmerId === farmer.id))
                    .map((farmer) => (
                      <option key={farmer.id} value={farmer.id}>
                        {farmer.name} {farmer.parish ? `(${farmer.parish})` : ''}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role (optional)
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Vegetables, Poultry, Herbs"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes about this assignment..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendNotification"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="sendNotification" className="ml-2 text-sm text-gray-700">
                  Send WhatsApp notification to farmer
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAssign}
                disabled={isAssigning || !selectedFarmerId}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssigning ? 'Assigning...' : 'Assign Farmer'}
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedFarmerId('')
                  setRole('')
                  setNotes('')
                  setSendNotification(false)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

