'use client'

import { useState } from 'react'

interface ReprocessIntakeButtonProps {
  intakeId: string
  onSuccess?: () => void
}

export default function ReprocessIntakeButton({ intakeId, onSuccess }: ReprocessIntakeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReprocess = async () => {
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/intakes/reprocess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ intakeId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reprocess intake')
      }

      // Call success callback if provided (e.g., to refresh the page)
      if (onSuccess) {
        onSuccess()
      } else {
        // Default: reload the page
        window.location.reload()
      }
    } catch (err: any) {
      console.error('Error reprocessing intake:', err)
      setError(err.message || 'Failed to reprocess intake')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleReprocess}
        disabled={isLoading}
        className={`
          px-3 py-1 text-xs font-medium rounded
          transition-colors
          ${isLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[#1a5f3f] text-white hover:bg-[#154a32]'
          }
        `}
        title="Reprocess this intake to re-parse the message and update farmer profile"
      >
        {isLoading ? 'Processing...' : 'Reprocess'}
      </button>
      {error && (
        <span className="text-xs text-red-600" title={error}>
          {error}
        </span>
      )}
    </div>
  )
}
