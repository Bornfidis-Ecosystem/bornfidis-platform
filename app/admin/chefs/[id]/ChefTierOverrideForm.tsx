'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setChefTierOverride } from '../actions'
import { ChefTier } from '@prisma/client'

type Props = { chefId: string; currentOverride: ChefTier | null }

export default function ChefTierOverrideForm({ chefId, currentOverride }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [value, setValue] = useState<string>(currentOverride ?? 'none')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const tier: ChefTier | null = value === 'none' ? null : (value as ChefTier)
    const res = await setChefTierOverride(chefId, tier)
    setSaving(false)
    if (res.success) router.refresh()
    else alert(res.error ?? 'Failed to update')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <label className="text-sm text-gray-600">Override tier:</label>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm"
      >
        <option value="none">Use computed</option>
        <option value="STANDARD">Standard</option>
        <option value="PRO">Pro (+10%)</option>
        <option value="ELITE">Elite (+20%)</option>
      </select>
      <button
        type="submit"
        disabled={saving}
        className="rounded bg-[#1a5f3f] px-3 py-1.5 text-sm text-white hover:bg-[#154a32] disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
