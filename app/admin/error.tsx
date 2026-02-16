'use client'

import Link from 'next/link'

/**
 * Admin error boundary — catches server/client errors in /admin and shows a friendly message.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-600 text-sm mb-4">
          A server-side error occurred. This can be due to a missing configuration, database issue, or permissions.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4 font-mono">Digest: {error.digest}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-opacity-90 transition text-sm font-semibold"
          >
            Try again
          </button>
          <Link
            href="/admin/login"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-semibold"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

