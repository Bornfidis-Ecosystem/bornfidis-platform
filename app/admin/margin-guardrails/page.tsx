import Link from 'next/link'
import { listMarginGuardrailConfigs, listMarginOverrideLogs } from '@/lib/margin-guardrails'
import MarginGuardrailsClient from './MarginGuardrailsClient'

export const dynamic = 'force-dynamic'

/**
 * Phase 2AV / Phase 4 — Margin guardrails (Labs: experimental pricing controls).
 * Page was missing; client + actions already existed (nav previously 404'd).
 */
export default async function AdminMarginGuardrailsPage() {
  const [configs, logs] = await Promise.all([
    listMarginGuardrailConfigs(),
    listMarginOverrideLogs(50),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/admin/labs" className="mb-4 inline-block text-sm text-forestDark hover:underline">
          ← Labs
        </Link>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Margin guardrails</h1>
        <p className="mb-6 text-sm text-gray-600">
          Min gross margin %; max bonus + tier uplift %; optional max surge and min job value. Block =
          hard block; Warn = allow but flag. Experimental — reach from Labs when enabled.
        </p>
        <MarginGuardrailsClient initialConfigs={configs} initialLogs={logs} />
      </div>
    </div>
  )
}
