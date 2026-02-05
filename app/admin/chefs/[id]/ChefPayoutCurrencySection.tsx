'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setChefPayoutCurrencyOverride } from '../actions'
import { SUPPORTED_CURRENCIES } from '@/lib/currency'

type Props = {
  chefId: string
  preferredCurrency: string | null
  overrideCurrency: string | null
}

export default function ChefPayoutCurrencySection({
  chefId,
  preferredCurrency,
  overrideCurrency,
}: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [value, setValue] = useState(overrideCurrency ?? '')
  const effective = overrideCurrency ?? preferredCurrency ?? 'USD'

  async function handleSetOverride() {
    const currency = value === '' ? null : value
    setSaving(true)
    const res = await setChefPayoutCurrencyOverride(chefId, currency)
    setSaving(false)
    if (res.success) router.refresh()
    else alert(res.error ?? 'Failed to save')
  }

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Payout currency (Phase 2AI)</h3>
      <p className="text-xs text-gray-500 mb-2">
        Chef preferred: <strong>{preferredCurrency ?? 'USD'}</strong>. Effective: <strong>{effective}</strong>.
        Override applies to future payouts only; rate locked at payout creation.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">No override (use chef preferred)</option>
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSetOverride}
          disabled={saving}
          className="rounded bg-[#1a5f3f] px-3 py-1.5 text-sm text-white hover:bg-[#154a32] disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Set override'}
        </button>
      </div>
    </div>
  )
}
