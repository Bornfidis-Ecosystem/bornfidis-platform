'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface FarmerApplication {
  id: string
  created_at: string
  name: string
  phone: string
  parish: string | null
  acres: number | null
  crops: string | null
  status: string
  notes: string | null
}

interface CallLog {
  id: string
  created_at: string
  call_sid: string
  call_status: string
  call_duration_seconds: number | null
  interest_level: string | null
  crops_confirmed: string | null
  volume_estimate: string | null
  preferred_contact_time: string | null
  notes: string | null
  call_outcome: string | null
  follow_up_sms_sent: boolean
}

interface FarmerDetailClientProps {
  initialApplication: FarmerApplication
}

export default function FarmerDetailClient({ initialApplication }: FarmerDetailClientProps) {
  const router = useRouter()
  const [application, setApplication] = useState(initialApplication)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCalling, setIsCalling] = useState(false)
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [showCallSummary, setShowCallSummary] = useState(false)
  const [activeCallLogId, setActiveCallLogId] = useState<string | null>(null)
  const [callSummary, setCallSummary] = useState({
    interest_level: '',
    crops_confirmed: '',
    volume_estimate: '',
    preferred_contact_time: '',
    notes: '',
    call_outcome: '',
  })
  const [coordinatorPhone, setCoordinatorPhone] = useState('')
  const [whatsAppMessage, setWhatsAppMessage] = useState('')
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)

  // Load call history
  useEffect(() => {
    loadCallHistory()
  }, [])

  const loadCallHistory = async () => {
    try {
      const response = await fetch(`/api/farmers/call/${application.id}`)
      const result = await response.json()
      if (result.success) {
        setCallLogs(result.call_logs || [])
      }
    } catch (error) {
      console.error('Error loading call history:', error)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/farmers/${application.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await response.json()

      if (result.success) {
        setApplication(prev => ({ ...prev, status: newStatus }))
        setMessage({ type: 'success', text: 'Status updated successfully' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update status' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleInitiateCall = async () => {
    setIsCalling(true)
    setMessage(null)

    try {
      const response = await fetch('/api/farmers/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_id: application.id,
          coordinator_phone: coordinatorPhone || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Call initiated! The farmer will receive a call shortly.' })
        // Reload call history after a moment
        setTimeout(() => {
          loadCallHistory()
        }, 2000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to initiate call' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' })
    } finally {
      setIsCalling(false)
    }
  }

  const handleSaveCallSummary = async () => {
    if (!activeCallLogId) return

    setIsUpdating(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/farmers/call/${activeCallLogId}/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interest_level: callSummary.interest_level || null,
          crops_confirmed: callSummary.crops_confirmed || null,
          volume_estimate: callSummary.volume_estimate || null,
          preferred_contact_time: callSummary.preferred_contact_time || null,
          notes: callSummary.notes || null,
          call_outcome: callSummary.call_outcome || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Call summary saved successfully' })
        setShowCallSummary(false)
        setActiveCallLogId(null)
        setCallSummary({
          interest_level: '',
          crops_confirmed: '',
          volume_estimate: '',
          preferred_contact_time: '',
          notes: '',
          call_outcome: '',
        })
        loadCallHistory()
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save call summary' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleOpenCallSummary = (callLog: CallLog) => {
    setActiveCallLogId(callLog.id)
    setCallSummary({
      interest_level: callLog.interest_level || '',
      crops_confirmed: callLog.crops_confirmed || '',
      volume_estimate: callLog.volume_estimate || '',
      preferred_contact_time: callLog.preferred_contact_time || '',
      notes: callLog.notes || '',
      call_outcome: callLog.call_outcome || '',
    })
    setShowCallSummary(true)
  }

  const handleNotesUpdate = async (notes: string) => {
    setIsUpdating(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/farmers/${application.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      const result = await response.json()

      if (result.success) {
        setApplication(prev => ({ ...prev, notes }))
        setMessage({ type: 'success', text: 'Notes updated successfully' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update notes' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' })
    } finally {
      setIsUpdating(false)
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

  const getCallStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
      case 'no-answer':
      case 'busy':
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

      {/* Application Details */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
          <p className="text-lg font-semibold text-gray-900">{application.name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
          <p className="text-lg text-gray-900">
            <a href={`tel:${application.phone}`} className="text-[#1a5f3f] hover:underline">
              {application.phone}
            </a>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Parish</label>
          <p className="text-lg text-gray-900">{application.parish || 'Not specified'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Acres</label>
          <p className="text-lg text-gray-900">{application.acres || 'Not specified'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Crops</label>
          <p className="text-lg text-gray-900">{application.crops || 'Not specified'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
          <p className="text-lg text-gray-900">
            {new Date(application.created_at).toLocaleString()}
          </p>
        </div>

        {(application as any).voice_ready && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              🎙️ Voice Intake
            </label>
            <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-[#FFBC00] text-[#1a5f3f]">
              Voice Ready
            </span>
          </div>
        )}

        {(application as any).transcript && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Transcript</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {(application as any).transcript}
              </p>
            </div>
          </div>
        )}

        {(application as any).intake_channel && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Intake Channel</label>
            <p className="text-lg text-gray-900 capitalize">
              {(application as any).intake_channel}
              {(application as any).intake_source && ` • ${(application as any).intake_source}`}
            </p>
          </div>
        )}
      </div>

      {/* Call & WhatsApp Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Call Farmer Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-[#1a5f3f]">
          <h2 className="text-xl font-bold text-[#1a5f3f] mb-4">Call Farmer</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="coordinator_phone" className="block text-sm font-medium text-gray-700 mb-2">
                Your Phone Number (Optional - to connect call to you)
              </label>
              <input
                type="tel"
                id="coordinator_phone"
                value={coordinatorPhone}
                onChange={(e) => setCoordinatorPhone(e.target.value)}
                placeholder="+1XXXXXXXXXX"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to play greeting only. Enter your number to connect the call to you.
              </p>
            </div>
            <button
              onClick={handleInitiateCall}
              disabled={isCalling}
              className="w-full px-6 py-3 bg-[#1a5f3f] text-white rounded-lg font-bold hover:bg-[#154a32] transition disabled:opacity-50 min-h-[48px]"
            >
              {isCalling ? 'Initiating Call...' : '📞 Call Farmer'}
            </button>
          </div>
        </div>

        {/* WhatsApp Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-green-600">
          <h2 className="text-xl font-bold text-green-700 mb-4">Send WhatsApp</h2>
          <div className="space-y-4">
            <button
              onClick={() => {
                setWhatsAppMessage(`Hello ${application.name}, this is Bornfidis Portland. We're excited to connect with you! How can we help you today?`)
                setShowWhatsAppModal(true)
              }}
              disabled={isSendingWhatsApp}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 min-h-[48px]"
            >
              {isSendingWhatsApp ? 'Sending...' : '💬 Send WhatsApp'}
            </button>
            <p className="text-xs text-gray-500">
              Send a WhatsApp message to the farmer. You can customize the message before sending.
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-green-600 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Send WhatsApp Message</h2>
                <button
                  onClick={() => {
                    setShowWhatsAppModal(false)
                    setWhatsAppMessage('')
                  }}
                  className="text-white hover:text-green-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setIsSendingWhatsApp(true)
                setMessage(null)

                try {
                  const response = await fetch('/api/farmers/whatsapp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      farmer_id: application.id,
                      phone: application.phone,
                      message: whatsAppMessage,
                    }),
                  })

                  const result = await response.json()

                  if (result.success) {
                    setMessage({ type: 'success', text: 'WhatsApp message sent successfully!' })
                    setShowWhatsAppModal(false)
                    setWhatsAppMessage('')
                    router.refresh()
                  } else {
                    setMessage({ type: 'error', text: result.error || 'Failed to send WhatsApp' })
                  }
                } catch (error: any) {
                  setMessage({ type: 'error', text: error.message || 'An error occurred' })
                } finally {
                  setIsSendingWhatsApp(false)
                }
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label htmlFor="whatsapp_message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="whatsapp_message"
                  value={whatsAppMessage}
                  onChange={(e) => setWhatsAppMessage(e.target.value)}
                  rows={6}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  placeholder="Type your WhatsApp message..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowWhatsAppModal(false)
                    setWhatsAppMessage('')
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingWhatsApp || !whatsAppMessage.trim()}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {isSendingWhatsApp ? 'Sending...' : 'Send WhatsApp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Call History */}
      {callLogs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#1a5f3f] mb-4">Call History</h2>
          <div className="space-y-3">
            {callLogs.map((log) => (
              <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCallStatusColor(log.call_status)}`}>
                      {log.call_status}
                    </span>
                    {log.call_outcome && (
                      <span className="ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {log.call_outcome}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleOpenCallSummary(log)}
                    className="px-3 py-1 bg-[#FFBC00] text-[#1a5f3f] rounded-lg text-sm font-semibold hover:bg-gold-dark"
                  >
                    {log.interest_level ? 'Edit Summary' : 'Add Summary'}
                  </button>
                </div>
                {log.call_duration_seconds && (
                  <p className="text-sm text-gray-600">Duration: {log.call_duration_seconds}s</p>
                )}
                {log.notes && (
                  <p className="text-sm text-gray-700 mt-2">{log.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call Summary Modal */}
      {showCallSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#1a5f3f] text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Call Summary</h2>
                <button
                  onClick={() => {
                    setShowCallSummary(false)
                    setActiveCallLogId(null)
                  }}
                  className="text-white hover:text-[#FFBC00] text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSaveCallSummary()
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label htmlFor="call_outcome" className="block text-sm font-medium text-gray-700 mb-1">
                  Call Outcome *
                </label>
                <select
                  id="call_outcome"
                  value={callSummary.call_outcome}
                  onChange={(e) => setCallSummary(prev => ({ ...prev, call_outcome: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
                >
                  <option value="">Select outcome...</option>
                  <option value="connected">Connected</option>
                  <option value="no_answer">No Answer</option>
                  <option value="busy">Busy</option>
                  <option value="failed">Failed</option>
                  <option value="voicemail">Voicemail</option>
                </select>
              </div>

              <div>
                <label htmlFor="interest_level" className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Level
                </label>
                <select
                  id="interest_level"
                  value={callSummary.interest_level}
                  onChange={(e) => setCallSummary(prev => ({ ...prev, interest_level: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
                >
                  <option value="">Select level...</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="not_interested">Not Interested</option>
                </select>
              </div>

              <div>
                <label htmlFor="crops_confirmed" className="block text-sm font-medium text-gray-700 mb-1">
                  Crops Confirmed
                </label>
                <input
                  type="text"
                  id="crops_confirmed"
                  value={callSummary.crops_confirmed}
                  onChange={(e) => setCallSummary(prev => ({ ...prev, crops_confirmed: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
                  placeholder="What crops did they confirm?"
                />
              </div>

              <div>
                <label htmlFor="volume_estimate" className="block text-sm font-medium text-gray-700 mb-1">
                  Volume Estimate
                </label>
                <input
                  type="text"
                  id="volume_estimate"
                  value={callSummary.volume_estimate}
                  onChange={(e) => setCallSummary(prev => ({ ...prev, volume_estimate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
                  placeholder="Estimated volume or quantity"
                />
              </div>

              <div>
                <label htmlFor="preferred_contact_time" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Contact Time
                </label>
                <input
                  type="text"
                  id="preferred_contact_time"
                  value={callSummary.preferred_contact_time}
                  onChange={(e) => setCallSummary(prev => ({ ...prev, preferred_contact_time: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
                  placeholder="e.g., Mornings, Afternoons, Weekends"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={callSummary.notes}
                  onChange={(e) => setCallSummary(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
                  placeholder="Additional notes about the call..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCallSummary(false)
                    setActiveCallLogId(null)
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-6 py-3 bg-[#1a5f3f] text-white rounded-lg font-bold hover:bg-[#154a32] transition disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Summary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update */}
      <div className="bg-white rounded-lg shadow-sm p-6 border-t">
        <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
        <div className="flex gap-2 flex-wrap">
          {['new', 'reviewed', 'approved', 'declined'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusUpdate(status)}
              disabled={isUpdating || application.status === status}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                application.status === status
                  ? getStatusColor(status) + ' cursor-default'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg shadow-sm p-6 border-t">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          id="notes"
          value={application.notes || ''}
          onChange={(e) => setApplication(prev => ({ ...prev, notes: e.target.value }))}
          onBlur={(e) => handleNotesUpdate(e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
          placeholder="Add notes about this application..."
        />
        <p className="text-xs text-gray-500 mt-1">Notes are saved automatically when you click away.</p>
      </div>
    </div>
  )
}
