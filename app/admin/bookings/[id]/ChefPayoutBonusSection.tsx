'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setChefPayoutBonusOverride } from '../actions'

type Props = {
  bookingId: string
  chefPayoutAmountCents: number | null | undefined
  chefPayoutBaseCents: number | null | undefined
  chefPayoutBonusCents: number | null | undefined
  chefPayoutBonusBreakdown: Array<{ badge: string; pct: number }> | null | undefined
  chefPayoutBonusOverride: boolean | null | undefined
  chefPayoutStatus: string | null | undefined
  /** Phase 2S: Tier snapshot for this job (locked at assignment) */
  chefTierSnapshot?: string | null
  chefRateMultiplier?: number | null
}

export default function ChefPayoutBonusSection({
  bookingId,
  chefPayoutAmountCents,
  chefPayoutBaseCents,
  chefPayoutBonusCents,
  chefPayoutBonusBreakdown,
  chefPayoutBonusOverride,
  chefPayoutStatus,
  chefTierSnapshot,
  chefRateMultiplier,
}: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const override = chefPayoutBonusOverride === true
  const totalCents = chefPayoutAmountCents ?? 0
  const baseCents = chefPayoutBaseCents ?? totalCents
  const bonusCents = chefPayoutBonusCents ?? 0
  const isPaid = (chefPayoutStatus ?? '').toLowerCase() === 'paid'

  if (totalCents <= 0) return null

  async function handleToggleOverride() {
    setSaving(true)
    const res = await setChefPayoutBonusOverride(bookingId, !override)
    setSaving(false)
    if (res.success) router.refresh()
    else alert(res.error ?? 'Failed to update')
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
        Chef payout
      </h3>
      {(chefTierSnapshot || chefRateMultiplier != null) && (
        <p className="text-xs text-gray-500 mb-2">
          Tier: {chefTierSnapshot ?? '—'} {chefRateMultiplier != null && chefRateMultiplier !== 1 ? `(×${chefRateMultiplier} locked for this job)` : ''}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="text-gray-700">
          Base: <strong>${(baseCents / 100).toFixed(2)}</strong>
        </span>
        {bonusCents > 0 && (
          <>
            <span className="text-gray-700">
              Bonus: <strong>${(bonusCents / 100).toFixed(2)}</strong>
              {chefPayoutBonusBreakdown?.length ? (
                <span className="ml-1 text-gray-500">
                  ({chefPayoutBonusBreakdown.map((b) => `${b.badge} +${b.pct}%`).join(', ')})
                </span>
              ) : null}
            </span>
          </>
        )}
        <span className="text-gray-900 font-medium">
          Total: ${(totalCents / 100).toFixed(2)}
        </span>
        {!isPaid && (
          <label className="flex items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              checked={override}
              onChange={handleToggleOverride}
              disabled={saving}
              className="h-4 w-4 rounded border-gray-300 text-amber-600"
            />
            <span>Disable bonus for this job</span>
          </label>
        )}
      </div>
    </div>
  )
}

