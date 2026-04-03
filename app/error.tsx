'use client'

import Link from 'next/link'

/**
 * Root error boundary — avoids dev “missing required error components” when a route throws.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-16 text-center bg-[#F7F3EA] text-[#0F3D2E]">
      <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
      <p className="text-sm text-[#25483C] max-w-md mb-6">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-[#0F3D2E] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-[#0F3D2E]/30 px-5 py-2.5 text-sm font-medium hover:bg-[#0F3D2E] hover:text-white transition"
        >
          Home
        </Link>
      </div>
    </div>
  )
}
