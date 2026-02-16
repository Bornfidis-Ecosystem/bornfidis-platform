'use client'

import type { ChefPerformanceMetrics } from '@/lib/chef-performance'
import type { ReviewSummaryForChef } from '@/lib/review-analytics'

type Props = { metrics: ChefPerformanceMetrics; reviewSummary: ReviewSummaryForChef }

export function ChefPerformanceClient({ metrics, reviewSummary }: Props) {
  return (
    <div className="space-y-6">
      {/* Phase 2W: Client reviews summary card */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Client reviews</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="text-xs text-gray-500">Avg rating</p>
            <p className="text-xl font-semibold text-gray-900">
              {reviewSummary.count > 0 ? `${reviewSummary.averageRating.toFixed(1)} ★` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Reviews</p>
            <p className="text-xl font-semibold text-gray-900">{reviewSummary.count}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Low-rating (≤3★)</p>
            <p className="text-xl font-semibold text-gray-900">
              {reviewSummary.count > 0 ? `${reviewSummary.flaggedCount} (${reviewSummary.lowRatingPercent}%)` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Trend</p>
            <p className="text-sm text-gray-700">
              {reviewSummary.trendAvgLast30 != null
                ? `Last 30d: ${reviewSummary.trendAvgLast30.toFixed(1)}★`
                : reviewSummary.trendAvgLast90 != null
                  ? `Last 90d: ${reviewSummary.trendAvgLast90.toFixed(1)}★`
                  : '—'}
            </p>
            {reviewSummary.trendAvgLast90 != null && reviewSummary.trendAvgLast30 != null && (
              <p className="text-xs text-gray-500">Last 90d: {reviewSummary.trendAvgLast90.toFixed(1)}★</p>
            )}
          </div>
        </div>
        {reviewSummary.flaggedCount > 0 && reviewSummary.count > 0 && (
          <p className="mt-3 text-xs text-amber-700">
            You have {reviewSummary.flaggedCount} low-rating review{reviewSummary.flaggedCount !== 1 ? 's' : ''}. Focus on prep and on-time delivery to improve.
          </p>
        )}
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          title="On-time rate"
          value={
            metrics.onTimeRatePercent != null
              ? `${metrics.onTimeRatePercent}%`
              : '—'
          }
          subtitle="Completed by scheduled time"
        />
        <Card
          title="Prep completion"
          value={
            metrics.prepCompletionRatePercent != null
              ? `${metrics.prepCompletionRatePercent}%`
              : '—'
          }
          subtitle="Checklist done before job"
        />
        <Card
          title="Avg payout"
          value={
            metrics.avgPayoutCents != null
              ? `$${(metrics.avgPayoutCents / 100).toFixed(2)}`
              : '—'
          }
          subtitle="Per job (with payout)"
        />
      </div>

      {/* Summary line */}
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
        <strong>{metrics.jobsCompleted}</strong> job{metrics.jobsCompleted !== 1 ? 's' : ''} completed
        {metrics.cancellationRatePercent > 0 && (
          <> · <strong>{metrics.cancellationRatePercent}%</strong> cancellation rate</>
        )}
      </div>

      {/* Last 10 jobs table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <h2 className="px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
          Last 10 jobs
        </h2>
        {metrics.lastJobs.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500 text-center">
            No jobs yet. Assignments will appear here.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Booking</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metrics.lastJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-900">{job.bookingName}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(job.eventDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        job.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : job.status === 'IN_PREP'
                            ? 'bg-blue-100 text-blue-800'
                            : job.status === 'CONFIRMED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {job.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-gray-900">
                    {job.payoutCents != null
                      ? `$${(job.payoutCents / 100).toFixed(2)}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Card({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle: string
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
    </div>
  )
}

