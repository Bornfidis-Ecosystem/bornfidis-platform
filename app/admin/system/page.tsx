import Link from 'next/link'
import SystemStatus from './SystemStatus'

export const dynamic = 'force-dynamic'

/**
 * Operations layer — System: health and environment overview.
 * ADMIN only (via nav-config).
 */
export default function AdminSystemPage() {
  const envName =
    process.env.VERCEL_ENV ||
    process.env.NODE_ENV ||
    'unknown'
  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-navy mb-2">System</h1>
        <p className="text-gray-600 text-sm mb-6">
          Environment and service status. For full details, use the health API.
        </p>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Environment</h2>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Name:</span> {envName}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">Stripe:</span>{' '}
            {stripeConfigured ? 'configured' : 'not set'}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Health API</h2>
          <p className="text-sm text-gray-600 mb-2">
            Live status for database, auth, and operational status:
          </p>
          <Link
            href="/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-forest hover:underline font-medium"
          >
            /api/health
          </Link>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Status</h2>
          <SystemStatus />
        </section>

        <p className="mt-8 text-sm text-gray-500">
          <Link href="/admin" className="text-forest hover:underline">
            Back to admin
          </Link>
        </p>
      </div>
    </div>
  )
}
