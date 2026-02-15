'use client'

import { useState } from 'react'

/** Client-only "Mark as Complete" toggle; state not persisted (Phase D). */
export function CoursePlayerClient() {
  const [completed, setCompleted] = useState(false)

  return (
    <div className="mt-6 flex items-center gap-3">
      <button
        type="button"
        onClick={() => setCompleted((c) => !c)}
        className="flex items-center gap-2 rounded-xl border border-forest/30 bg-card px-4 py-2.5 text-sm font-medium text-forest transition-all duration-200 ease-in-out hover:shadow-md"
        aria-pressed={completed}
      >
        <span
          className={
            completed
              ? 'inline-flex h-5 w-5 items-center justify-center rounded border-2 border-forest bg-forest text-goldAccent'
              : 'inline-flex h-5 w-5 items-center justify-center rounded border-2 border-gray-300 bg-white'
          }
          aria-hidden
        >
          {completed && (
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
        {completed ? 'Completed' : 'Mark as Complete'}
      </button>
    </div>
  )
}
