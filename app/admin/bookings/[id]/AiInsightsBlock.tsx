import type { AiOpsInsightRow } from '@/lib/ai-ops-insights'

/**
 * Phase 2AZ — Inline AI ops insights/warnings on booking detail.
 */
export default function AiInsightsBlock({ insights }: { insights: AiOpsInsightRow[] }) {
  if (insights.length === 0) return null

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-6">
      <h2 className="text-sm font-semibold text-amber-900 mb-2">AI Insights</h2>
      <p className="text-xs text-amber-800 mb-3">Actionable warnings for this booking.</p>
      <ul className="space-y-3">
        {insights.map((i) => (
          <li key={i.id} className="text-sm">
            <p className="font-medium text-gray-900">{i.title}</p>
            <p className="text-gray-600 mt-0.5">{i.whyItMatters}</p>
            <p className="text-forestDark mt-1"><strong>Suggested:</strong> {i.suggestedAction}</p>
            <p className="text-xs text-gray-500 mt-0.5">{i.confidencePct}% confidence</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

