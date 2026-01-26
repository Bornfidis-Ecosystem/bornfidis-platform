'use client'

import { useState, useEffect } from 'react'
import { getBookingPrepItems, updatePrepItem } from '../actions'

interface PrepItem {
  id: string
  title: string
  order: number
  completed: boolean
  completedAt: string | null
  notes: string | null
  createdAt: string
}

interface PrepSectionProps {
  bookingId: string
  eventDate: string
}

/**
 * Phase 3.5: Event Prep Checklist Component
 * Displays and manages prep checklist items for a booking
 */
export default function PrepSection({ bookingId, eventDate }: PrepSectionProps) {
  const [prepItems, setPrepItems] = useState<PrepItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null)
  const [notesValue, setNotesValue] = useState('')

  useEffect(() => {
    loadPrepItems()
  }, [bookingId])

  const loadPrepItems = async () => {
    setIsLoading(true)
    try {
      const result = await getBookingPrepItems(bookingId)
      if (result.success) {
        setPrepItems(result.prepItems || [])
      } else {
        console.warn('Prep items not available:', result.error)
        setPrepItems([])
      }
    } catch (error: any) {
      console.error('Error loading prep items:', error)
      setPrepItems([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async (itemId: string, currentCompleted: boolean) => {
    setUpdatingId(itemId)
    try {
      const result = await updatePrepItem(itemId, {
        completed: !currentCompleted,
      })
      if (result.success) {
        // Update local state
        setPrepItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  completed: !currentCompleted,
                  completedAt: !currentCompleted ? new Date().toISOString() : null,
                }
              : item
          )
        )
      }
    } catch (error) {
      console.error('Error toggling prep item:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSaveNotes = async (itemId: string) => {
    setUpdatingId(itemId)
    try {
      const result = await updatePrepItem(itemId, {
        notes: notesValue || null,
      })
      if (result.success) {
        // Update local state
        setPrepItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, notes: notesValue || null } : item
          )
        )
        setEditingNotesId(null)
        setNotesValue('')
      }
    } catch (error) {
      console.error('Error saving notes:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const startEditingNotes = (item: PrepItem) => {
    setEditingNotesId(item.id)
    setNotesValue(item.notes || '')
  }

  // Calculate days until event
  const daysUntilEvent = (() => {
    try {
      const event = new Date(eventDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      event.setHours(0, 0, 0, 0)
      const diffTime = event.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return null
    }
  })()

  // Check if prep is incomplete and event is approaching
  const incompleteCount = prepItems.filter((item) => !item.completed).length
  const showWarning = daysUntilEvent !== null && daysUntilEvent <= 7 && incompleteCount > 0

  if (isLoading) {
    return (
      <div className="border-t pt-6">
        <div className="text-center text-gray-500 py-4">Loading prep checklist...</div>
      </div>
    )
  }

  if (prepItems.length === 0) {
    return (
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-navy mb-4">🧰 Event Prep Checklist</h3>
        <p className="text-gray-500 text-sm">
          Prep checklist will be automatically generated when booking is approved.
        </p>
      </div>
    )
  }

  const completedCount = prepItems.filter((item) => item.completed).length
  const progressPercent = (completedCount / prepItems.length) * 100

  return (
    <div className="border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-navy">🧰 Event Prep Checklist</h3>
        <span className="text-sm text-gray-600">
          {completedCount} of {prepItems.length} completed
        </span>
      </div>

      {/* Warning for approaching events */}
      {showWarning && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Event in {daysUntilEvent} day{daysUntilEvent !== 1 ? 's' : ''}</strong> — {incompleteCount} prep item{incompleteCount !== 1 ? 's' : ''} still incomplete
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Prep Items */}
      <div className="space-y-3">
        {prepItems.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-lg border ${
              item.completed
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-gray-200 hover:border-gray-300'
            } transition-colors`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleToggle(item.id, item.completed)}
                disabled={updatingId === item.id}
                className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors mt-0.5 ${
                  item.completed
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 hover:border-blue-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {item.completed && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div
                  className={`font-medium ${
                    item.completed ? 'text-blue-800 line-through' : 'text-gray-900'
                  }`}
                >
                  {item.title}
                </div>
                {item.completed && item.completedAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    Completed {new Date(item.completedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                )}
                {item.notes && !editingNotesId && (
                  <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded border">
                    <strong>Notes:</strong> {item.notes}
                  </div>
                )}
                {editingNotesId === item.id ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      rows={2}
                      placeholder="Add notes about this prep item..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveNotes(item.id)}
                        disabled={updatingId === item.id}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingNotesId(null)
                          setNotesValue('')
                        }}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditingNotes(item)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    {item.notes ? 'Edit notes' : 'Add notes'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
