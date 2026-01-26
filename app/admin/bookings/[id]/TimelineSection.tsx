'use client'

import { useState, useEffect } from 'react'
import { getBookingTimeline, toggleTimelineMilestone } from '../actions'

interface TimelineItem {
  id: string
  title: string
  order: number
  completed: boolean
  completedAt: string | null
  createdAt: string
}

interface TimelineSectionProps {
  bookingId: string
}

/**
 * Phase 2A: Booking Timeline Component
 * Displays and manages timeline milestones for a booking
 */
export default function TimelineSection({ bookingId }: TimelineSectionProps) {
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    loadTimeline()
  }, [bookingId])

  const loadTimeline = async () => {
    setIsLoading(true)
    try {
      const result = await getBookingTimeline(bookingId)
      if (result.success) {
        setTimeline(result.timeline || [])
      } else {
        // If timeline fetch fails (e.g., table doesn't exist), show empty state
        console.warn('Timeline not available:', result.error)
        setTimeline([])
      }
    } catch (error: any) {
      console.error('Error loading timeline:', error)
      // Gracefully handle errors - show empty timeline
      setTimeline([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async (milestoneId: string, currentCompleted: boolean) => {
    setTogglingId(milestoneId)
    try {
      const result = await toggleTimelineMilestone(milestoneId, !currentCompleted)
      if (result.success) {
        // Update local state
        setTimeline((prev) =>
          prev.map((item) =>
            item.id === milestoneId
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
      console.error('Error toggling milestone:', error)
    } finally {
      setTogglingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="border-t pt-6">
        <div className="text-center text-gray-500 py-4">Loading timeline...</div>
      </div>
    )
  }

  if (timeline.length === 0) {
    return (
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-navy mb-4">🗓 Event Timeline</h3>
        <p className="text-gray-500 text-sm">
          Timeline will be automatically generated when booking is approved.
        </p>
      </div>
    )
  }

  const completedCount = timeline.filter((item) => item.completed).length
  const progressPercent = (completedCount / timeline.length) * 100

  return (
    <div className="border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-navy">🗓 Event Timeline</h3>
        <span className="text-sm text-gray-600">
          {completedCount} of {timeline.length} completed
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Timeline Items */}
      <div className="space-y-3">
        {timeline.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              item.completed
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-200 hover:border-gray-300'
            } transition-colors`}
          >
            <button
              onClick={() => handleToggle(item.id, item.completed)}
              disabled={togglingId === item.id}
              className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                item.completed
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'bg-white border-gray-300 hover:border-green-500'
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
            <div className="flex-1">
              <div
                className={`font-medium ${
                  item.completed ? 'text-green-800 line-through' : 'text-gray-900'
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
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
