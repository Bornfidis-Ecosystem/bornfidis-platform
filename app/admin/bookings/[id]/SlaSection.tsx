'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { acknowledgeSlaAction } from '../actions'
import type { BookingInquiry } from '@/types/booking'

type Props = {
  booking: Pick<BookingInquiry, 'id' | 'sla_status' | 'sla_breaches' | 'sla_acknowledged_at' | 'sla_acknowledged_by'>
}

/**
 * Phase 2AJ: SLA badge and manual acknowledge for booking detail.
 */
export default function SlaSection({ booking }: Props) {
  const router = useRouter()
  const status = booking.sla_status ?? 'on_track'
  const breaches = booking.sla_breaches ?? []
  const acknowledged = !!booking.sla_acknowledged_at

  async function handleAcknowledge() {
    const res = await acknowledgeSlaAction(booking.id)
    if (res.success) router.refresh()
    else alert(res.error ?? 'Failed to acknowledge')
  }

  const label = status === 'breached' ? 'Breached' : status === 'at_risk' ? 'At risk' : 'On track'
  const badgeClass =
    status === 'breached'
      ? 'bg-red-100 text-red-800'
      : status === 'at_risk'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-green-100 text-green-800'

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">SLA (Phase 2AJ)</h2>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${badgeClass}`}>
          {label}
        </span>
        {breaches.length > 0 && (
          <span className="text-sm text-gray-600">
            Breaches: {breaches.map((b) => b.type.replace('_', ' ')).join(', ')}
          </span>
        )}
        {acknowledged && (
          <span className="text-xs text-gray-500">
            Acknowledged
            {booking.sla_acknowledged_at &&
              ` ${new Date(booking.sla_acknowledged_at).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}`}
          </span>
        )}
        {(status === 'breached' || status === 'at_risk') && !acknowledged && (
          <button
            type="button"
            onClick={handleAcknowledge}
            className="rounded bg-gray-700 px-3 py-1.5 text-sm text-white hover:bg-gray-800"
          >
            Acknowledge
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        <Link href="/admin/ops" className="text-forestDark hover:underline">
          View SLA At Risk list →
        </Link>
      </p>
    </div>
  )
}

