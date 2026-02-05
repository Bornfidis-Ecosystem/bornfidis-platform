'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { saveConfig, getOverrideLog } from './actions'
import type { MarginGuardrailConfigRow, MarginOverrideLogRow } from '@/lib/margin-guardrails'

type Props = {
  initialConfigs: MarginGuardrailConfigRow[]
  initialLogs: MarginOverrideLogRow[]
}

export default function MarginGuardrailsClient({ initialConfigs, initialLogs }: Props) {
  const router = useRouter()
  const [configs, setConfigs] = useState(initialConfigs)
  const [logs, setLogs] = useState(initialLogs)
  const [editing, setEditing] = useState<MarginGuardrailConfigRow | null>(null)
  const [isNew, setIsNew] = useState(false)

  useEffect(() => {
    setConfigs(initialConfigs)
    setLogs(initialLogs)
  }, [initialConfigs, initialLogs])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const regionEl = form.querySelector('[name="regionCode"]') as HTMLInputElement
    const minMarginEl = form.querySelector('[name="minGrossMarginPct"]') as HTMLInputElement
    const maxBonusEl = form.querySelector('[name="maxBonusPlusTierPct"]') as HTMLInputElement
    const maxSurgeEl = form.querySelector('[name="maxSurgeMultiplier"]') as HTMLInputElement
    const minJobEl = form.querySelector('[name="minJobValueCents"]') as HTMLInputElement
    const blockEl = form.querySelector('[name="blockOrWarn"]') as HTMLInputElement
    const data = {
      id: editing?.id,
      regionCode: regionEl?.value?.trim() || null,
      minGrossMarginPct: parseFloat(minMarginEl?.value || '25') || 25,
      maxBonusPlusTierPct: parseFloat(maxBonusEl?.value || '20') || 20,
      maxSurgeMultiplier: maxSurgeEl?.value?.trim() ? parseFloat(maxSurgeEl.value) : null,
      minJobValueCents: minJobEl?.value?.trim() ? Math.round(parseFloat(minJobEl.value) * 100) : null,
      blockOrWarn: blockEl?.checked ?? true,
    }
    if (data.regionCode) data.regionCode = data.regionCode.toUpperCase()
    const res = await saveConfig(data)
    if (res.success) {
      toast.success('Config saved')
      setEditing(null)
      setIsNew(false)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const refreshLogs = async () => {
    const res = await getOverrideLog(50)
    if (res.success && res.logs) setLogs(res.logs)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Thresholds (global or per region)
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Min gross margin %; max bonus + tier uplift %; optional max surge and min job value. Block = hard block; Warn = allow but flag.
        </p>
        <ul className="mb-4 space-y-1 text-sm">
          {configs.map((c) => (
            <li key={c.id} className="flex items-center gap-2">
              <span className="font-medium">{c.regionCode ?? 'Global'}</span>
              <span className="text-gray-600">
                margin ≥{c.minGrossMarginPct}%, bonus+tier ≤{c.maxBonusPlusTierPct}%
                {c.maxSurgeMultiplier != null && `, surge ≤${c.maxSurgeMultiplier}`}
                {c.minJobValueCents != null && `, min job $${(c.minJobValueCents / 100).toFixed(2)}`}
                — {c.blockOrWarn ? 'Block' : 'Warn'}
              </span>
              <button
                type="button"
                onClick={() => { setEditing(c); setIsNew(false) }}
                className="text-[#1a5f3f] hover:underline"
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={handleSave} className="space-y-3 max-w-md">
          {(editing || isNew) && (
            <>
              <label className="block text-sm">
                Region (blank = global)
                <input name="regionCode" type="text" defaultValue={editing?.regionCode ?? ''} placeholder="e.g. KINGSTON" className="ml-2 border rounded px-2 py-1 w-32" />
              </label>
              <label className="block text-sm">
                Min gross margin %
                <input name="minGrossMarginPct" type="number" step="0.1" min="0" max="100" defaultValue={editing?.minGrossMarginPct ?? 25} className="ml-2 border rounded px-2 py-1 w-20" />
              </label>
              <label className="block text-sm">
                Max bonus + tier %
                <input name="maxBonusPlusTierPct" type="number" step="0.1" min="0" max="100" defaultValue={editing?.maxBonusPlusTierPct ?? 20} className="ml-2 border rounded px-2 py-1 w-20" />
              </label>
              <label className="block text-sm">
                Max surge multiplier (optional)
                <input name="maxSurgeMultiplier" type="number" step="0.01" min="1" defaultValue={editing?.maxSurgeMultiplier ?? ''} placeholder="e.g. 1.30" className="ml-2 border rounded px-2 py-1 w-24" />
              </label>
              <label className="block text-sm">
                Min job value $ (optional)
                <input name="minJobValueCents" type="number" step="0.01" min="0" defaultValue={editing?.minJobValueCents != null ? editing.minJobValueCents / 100 : ''} placeholder="e.g. 150" className="ml-2 border rounded px-2 py-1 w-24" />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input name="blockOrWarn" type="checkbox" defaultChecked={editing?.blockOrWarn ?? true} />
                Block when failed (uncheck = warn only)
              </label>
              <div className="flex gap-2">
                <button type="submit" className="px-3 py-1.5 rounded bg-green-600 text-white text-sm hover:bg-green-700">Save</button>
                <button type="button" onClick={() => { setEditing(null); setIsNew(false) }} className="px-3 py-1.5 rounded border border-gray-300 text-sm">Cancel</button>
              </div>
            </>
          )}
          {!editing && !isNew && (
            <button type="button" onClick={() => setIsNew(true)} className="px-3 py-1.5 rounded bg-gray-700 text-white text-sm hover:bg-gray-800">
              Add config
            </button>
          )}
        </form>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Override audit log</h2>
        <p className="text-sm text-gray-500 mb-3">When a payout is allowed despite failing margin guardrails (override).</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-2">Date</th>
                <th className="py-2 pr-2">Booking</th>
                <th className="py-2 pr-2">User</th>
                <th className="py-2 pr-2">Action</th>
                <th className="py-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={5} className="py-4 text-gray-500">No overrides yet.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="py-2 pr-2 text-gray-600">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-2">
                      <Link href={`/admin/bookings/${log.bookingId}`} className="text-[#1a5f3f] hover:underline">
                        {log.bookingId.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="py-2 pr-2">{log.userName ?? log.userId}</td>
                    <td className="py-2 pr-2">{log.action}</td>
                    <td className="py-2">{log.reason ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={refreshLogs} className="mt-2 text-sm text-[#1a5f3f] hover:underline">Refresh log</button>
      </div>
    </div>
  )
}
