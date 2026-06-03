'use client'

interface SuccessAlertProps {
  title?: string
  message: string
  className?: string
}

export function SuccessAlert({ title = 'Success', message, className = '' }: SuccessAlertProps) {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-forest/30 bg-green-50 px-4 py-3 text-forest ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 text-green-600" aria-hidden>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <div>
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-sm mt-0.5">{message}</p>
        </div>
      </div>
    </div>
  )
}
