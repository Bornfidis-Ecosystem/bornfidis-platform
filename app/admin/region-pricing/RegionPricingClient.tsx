'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { saveRegion, removeRegion, toggleRegionEnabled, getPreview } from './actions'
import type { RegionPricingRow } from '@/lib/region-pricing'

function formatUSD(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export default function RegionPricingClient({ initialRegions }: { initialRegions: RegionPricingRow[] }) {
  const router = useRouter()
  const [regions, setRegions] = useState(initialRegions)
  useEffect(() => {
    setRegions(initialRegions)
  }, [initialRegions])
  const [editing, setEditing] = useState<RegionPricingRow | null>(null)
  const [previewSubtotal, setPreviewSubtotal] = useState('10000')
  const [previewRegion, setPreviewRegion] = useState('')
  const [previewResult, setPreviewResult] = useState<Awaited<ReturnType<typeof getPreview>>['preview'] | null>(null)

  const runPreview = async () => {
    const cents = Math.round((parseFloat(previewSubtotal || '0') || 0) * 100)
    const res = await getPreview(cents, previewRegion || null)
    if (res.success && res.preview) setPreviewResult(res.preview)
    else setPreviewResult(null)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = {
      id: (editing?.id || '') || undefined,
      regionCode: (form.querySelector('[name="regionCode"]') as HTMLInputElement).value.trim().toUpperCase(),
      name: (form.querySelector('[name="name"]') as HTMLInputElement).value.trim() || null,
      zone: (form.querySelector('[name="zone"]') as HTMLInputElement).value.trim() || null,
      multiplier: parseFloat((form.querySelector('[name="multiplier"]') as HTMLInputElement).value) || 1,
      travelFeeCents: Math.round(parseFloat((form.querySelector('[name="travelFeeCents"]') as HTMLInputElement).value) * 100) || 0,
      minimumCents: Math.round(parseFloat((form.querySelector('[name="minimumCents"]') as HTMLInputElement).value) * 100) || 0,
      enabled: (form.querySelector('[name="enabled"]') as HTMLInputElement)?.checked ?? true,
    }
    const res = await saveRegion(data)
    if (res.success) {
      toast.success('Region saved')
      setEditing(null)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this region rule?')) return
    const res = await removeRegion(id)
    if (res.success) {
      toast.success('Region removed')
      setRegions(regions.filter((r) => r.id !== id))
      setEditing(null)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const handleToggle = async (id: string, enabled: boolean) => {
    const res = await toggleRegionEnabled(id, enabled)
    if (res.success) {
      setRegions(regions.map((r) => (r.id === id ? { ...r, enabled } : r)))
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Preview pricing</h2>
        <div className="flex flex-wrap gap-2 items-end">
          <label className="text-sm">
            Base subtotal ($)
            <input
              type="number"
              step="0.01"
              value={previewSubtotal}
              onChange={(e) => setPreviewSubtotal(e.target.value)}
              className="ml-2 border rounded px-2 py-1 w-24"
            />
          </label>
          <label className="text-sm">
            Region code
            <input
              type="text"
              value={previewRegion}
              onChange={(e) => setPreviewRegion(e.target.value)}
              placeholder="e.g. KINGSTON"
              className="ml-2 border rounded px-2 py-1 w-32"
            />
          </label>
          <button
            type="button"
            onClick={runPreview}
            className="px-3 py-1.5 rounded bg-green-600 text-white text-sm hover:bg-green-700"
          >
            Preview
          </button>
        </div>
        {previewResult && (
          <div className="mt-3 text-sm text-gray-600">
            Job value: {formatUSD(previewResult.finalJobCents)}
            {previewResult.appliedMinimum && ' (minimum applied)'}
          </div>
        )}
      </div>

      {/* Form (add / edit) */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          {editing ? 'Edit region' : 'Add region'}
        </h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <input type="hidden" name="id" value={editing?.id || ''} />
          <label>
            Region code *
            <input name="regionCode" required defaultValue={editing?.regionCode} className="ml-2 border rounded px-2 py-1 w-full" placeholder="KINGSTON" />
          </label>
          <label>
            Name
            <input name="name" defaultValue={editing?.name ?? ''} className="ml-2 border rounded px-2 py-1 w-full" placeholder="Kingston (Urban)" />
          </label>
          <label>
            Zone
            <input name="zone" defaultValue={editing?.zone ?? ''} className="ml-2 border rounded px-2 py-1 w-full" placeholder="Urban | Rural" />
          </label>
          <label>
            Multiplier
            <input name="multiplier" type="number" step="0.01" defaultValue={editing?.multiplier ?? 1} className="ml-2 border rounded px-2 py-1 w-full" />
          </label>
          <label>
            Travel fee ($)
            <input name="travelFeeCents" type="number" step="0.01" defaultValue={editing ? editing.travelFeeCents / 100 : 0} className="ml-2 border rounded px-2 py-1 w-full" />
          </label>
          <label>
            Minimum job ($)
            <input name="minimumCents" type="number" step="0.01" defaultValue={editing ? editing.minimumCents / 100 : 0} className="ml-2 border rounded px-2 py-1 w-full" />
          </label>
          <label className="flex items-center gap-2">
            <input name="enabled" type="checkbox" defaultChecked={editing?.enabled ?? true} />
            Enabled
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

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Code</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Name / Zone</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Multiplier</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Travel fee</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Minimum</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Enabled</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {regions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No region rules. Add one above; use region code in booking quote to apply.
                </td>
              </tr>
            ) : (
              regions.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.regionCode}</td>
                  <td className="px-4 py-3 text-gray-600">{[r.name, r.zone].filter(Boolean).join(' / ') || '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{r.multiplier}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{formatUSD(r.travelFeeCents)}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{formatUSD(r.minimumCents)}</td>
                  <td className="px-4 py-3">
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={r.enabled}
                        onChange={(e) => handleToggle(r.id, e.target.checked)}
                        className="rounded border-gray-300 text-green-600"
                      />
                      {r.enabled ? 'On' : 'Off'}
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setEditing(r)} className="text-green-700 hover:underline mr-2">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline">
                      Delete
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

