'use client'

interface StatusWorkflowProps {
  currentStatus: string
}

const WORKFLOW_STEPS = [
  { key: 'NEW', label: 'New' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'QUOTED', label: 'Quoted' },
  { key: 'BOOKED', label: 'Booked' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'COMPLETED', label: 'Completed' },
]

/** Map app booking status values to workflow step keys for visual progress */
const STATUS_TO_STEP: Record<string, string> = {
  new: 'NEW',
  pending: 'PENDING',
  reviewed: 'PENDING',
  quoted: 'QUOTED',
  booked: 'BOOKED',
  confirmed: 'CONFIRMED',
  closed: 'COMPLETED',
  completed: 'COMPLETED',
}

export function StatusWorkflow({ currentStatus }: StatusWorkflowProps) {
  const stepKey = STATUS_TO_STEP[currentStatus?.toLowerCase()] ?? currentStatus?.toUpperCase() ?? 'NEW'
  const currentIndex = WORKFLOW_STEPS.findIndex((step) => step.key === stepKey)

  return (
    <div className="bg-white border rounded-lg p-6 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-4">
        Booking Progress
      </h3>
      <div className="flex items-center justify-between">
        {WORKFLOW_STEPS.map((step, index) => {
          const isComplete = index < currentIndex
          const isCurrent = index === currentIndex

          return (
            <div key={step.key} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full
                    ${
                      isComplete
                        ? 'bg-green-600 text-white'
                        : isCurrent
                        ? 'bg-green-600 text-white ring-4 ring-green-100'
                        : 'bg-gray-200 text-gray-400'
                    }
                  `}
                >
                  {isComplete ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 3.75a8.25 8.25 0 100 16.5 8.25 8.25 0 000-16.5z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-xs font-medium
                    ${isCurrent ? 'text-green-700' : 'text-gray-600'}
                  `}
                >
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="text-xs text-green-600 mt-1">
                    ↑ You are here
                  </span>
                )}
              </div>

              {/* Arrow */}
              {index < WORKFLOW_STEPS.length - 1 && (
                <div
                  className={`
                    w-16 h-0.5 mx-2
                    ${index < currentIndex ? 'bg-green-600' : 'bg-gray-300'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
