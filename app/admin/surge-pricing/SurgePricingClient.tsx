'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { saveSurgeConfig, toggleSurgeEnabled } from './actions'
import type { SurgeConfigRow } from '@/lib/surge-pricing'

export default function SurgePricingClient({ initialConfigs }: { initialConfigs: SurgeConfigRow[] }) {
  const router = useRouter()
  const [configs, setConfigs] = useState(initialConfigs)
  const [editing, setEditing] = useState<SurgeConfigRow | null>(null)

  useEffect(() => {
    setConfigs(initialConfigs)
  }, [initialConfigs])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = {
      id: (editing?.id || '') || undefined,
      regionCode: (form.querySelector('[name="regionCode"]') as HTMLInputElement).value.trim().toUpperCase(),
      enabled: (form.querySelector('[name="enabled"]') as HTMLInputElement)?.checked ?? true,
      demandBookingsThreshold: parseInt((form.querySelector('[name="demandBookingsThreshold"]') as HTMLInputElement).value, 10) || 5,
      supplyChefsThreshold: parseInt((form.querySelector('[name="supplyChefsThreshold"]') as HTMLInputElement).value, 10) || 2,
      shortNoticeHours: parseInt((form.querySelector('[name="shortNoticeHours"]') as HTMLInputElement).value, 10) || 48,
      surgeMultiplier: parseFloat((form.querySelector('[name="surgeMultiplier"]') as HTMLInputElement).value) || 1.15,
      minMultiplier: parseFloat((form.querySelector('[name="minMultiplier"]') as HTMLInputElement).value) || 1.05,
      maxMultiplier: parseFloat((form.querySelector('[name="maxMultiplier"]') as HTMLInputElement).value) || 1.30,
    }
    const res = await saveSurgeConfig(data)
    if (res.success) {
      toast.success('Surge config saved')
      setEditing(null)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const handleToggle = async (id: string, enabled: boolean) => {
    const res = await toggleSurgeEnabled(id, enabled)
    if (res.success) {
      setConfigs(configs.map((c) => (c.id === id ? { ...c, enabled } : c)))
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          {editing ? 'Edit surge config' : 'Add surge config'}
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Surge applies when any condition is met: bookings in region on event date ≥ demand threshold, available chefs ≤ supply threshold, or event within short-notice hours.
        </p>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <label>
            Region code *
            <input name="regionCode" required defaultValue={editing?.regionCode} className="ml-2 border rounded px-2 py-1 w-full" placeholder="KINGSTON or DEFAULT" />
          </label>
          <label className="flex items-center gap-2">
            <input name="enabled" type="checkbox" defaultChecked={editing?.enabled ?? true} />
            Enabled
          </label>
          <label>
            Demand threshold (bookings/day in region)
            <input name="demandBookingsThreshold" type="number" min={1} defaultValue={editing?.demandBookingsThreshold ?? 5} className="ml-2 border rounded px-2 py-1 w-full" />
          </label>
          <label>
            Supply threshold (min available chefs)
            <input name="supplyChefsThreshold" type="number" min={0} defaultValue={editing?.supplyChefsThreshold ?? 2} className="ml-2 border rounded px-2 py-1 w-full" />
          </label>
          <label>
            Short notice (hours before event)
            <input name="shortNoticeHours" type="number" min={0} defaultValue={editing?.shortNoticeHours ?? 48} className="ml-2 border rounded px-2 py-1 w-full" />
          </label>
          <label>
            Surge multiplier
            <input name="surgeMultiplier" type="number" step="0.01" min={1.05} max={1.30} defaultValue={editing?.surgeMultiplier ?? 1.15} className="ml-2 border rounded px-2 py-1 w-full" />
          </label>
          <label>
            Min multiplier (cap)
            <input name="minMultiplier" type="number" step="0.01" defaultValue={editing?.minMultiplier ?? 1.05} className="ml-2 border rounded px-2 py-1 w-full" />
          </label>
          <label>
            Max multiplier (cap)
            <input name="maxMultiplier" type="number" step="0.01" defaultValue={editing?.maxMultiplier ?? 1.30} className="ml-2 border rounded px-2 py-1 w-full" />
          </label>
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700">
              Save
            </button>
            {editing && (
              <button type="button" onClick={() => setEditing(null)} className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Region</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Demand</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Supply</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Short notice (h)</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Multiplier</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Enabled</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {configs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No surge configs. Add one (e.g. region KINGSTON or DEFAULT for global). Surge applies when quote is saved with a region and event date.
                </td>
              </tr>
            ) : (
              configs.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.regionCode}</td>
                  <td className="px-4 py-3 text-right text-gray-600">≥{c.demandBookingsThreshold}</td>
                  <td className="px-4 py-3 text-right text-gray-600">≤{c.supplyChefsThreshold}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{c.shortNoticeHours}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{c.surgeMultiplier} (cap {c.minMultiplier}–{c.maxMultiplier})</td>
                  <td className="px-4 py-3">
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={c.enabled}
                        onChange={(e) => handleToggle(c.id, e.target.checked)}
                        className="rounded border-gray-300 text-green-600"
                      />
                      {c.enabled ? 'On' : 'Off'}
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setEditing(c)} className="text-green-700 hover:underline">
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
