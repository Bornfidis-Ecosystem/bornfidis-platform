'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setPreferredPayoutCurrency } from './actions'
import type { SupportedCurrency } from '@/lib/currency'

type Props = {
  currentCurrency: string
  currencies: readonly SupportedCurrency[]
}

export default function ChefPreferredCurrencyForm({ currentCurrency, currencies }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [value, setValue] = useState(currentCurrency)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (value === currentCurrency) return
    setSaving(true)
    const res = await setPreferredPayoutCurrency(value)
    setSaving(false)
    if (res.success) router.refresh()
    else alert(res.error ?? 'Failed to save')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded border border-gray-300 px-3 py-2 text-sm"
        aria-label="Preferred payout currency"
      >
        {currencies.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={saving}
        className="rounded bg-[#1a5f3f] px-3 py-2 text-sm text-white hover:bg-[#154a32] disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
