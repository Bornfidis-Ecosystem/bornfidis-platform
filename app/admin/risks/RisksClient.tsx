'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  createRiskAction,
  updateRiskAction,
  deleteRiskAction,
} from './actions'
import type { RiskRow } from '@/lib/risks'
import { RISK_CATEGORIES } from '@/lib/risks'
import type { RiskImpact, RiskLikelihood, RiskStatus } from '@prisma/client'

const IMPACTS: RiskImpact[] = ['LOW', 'MEDIUM', 'HIGH']
const LIKELIHOODS: RiskLikelihood[] = ['LOW', 'MEDIUM', 'HIGH']
const STATUSES: RiskStatus[] = ['OPEN', 'MONITORING', 'CLOSED']

const STATUS_CLASS: Record<RiskStatus, string> = {
  OPEN: 'bg-amber-100 text-amber-800',
  MONITORING: 'bg-blue-100 text-blue-800',
  CLOSED: 'bg-gray-100 text-gray-700',
}

type Props = {
  initialRisks: RiskRow[]
  initialCategory?: string
  initialStatus?: RiskStatus
}

export default function RisksClient({ initialRisks, initialCategory, initialStatus }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [risks, setRisks] = useState<RiskRow[]>(initialRisks)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<RiskRow | null>(null)

  useEffect(() => {
    setRisks(initialRisks)
  }, [initialRisks])

  const setFilters = (category?: string, status?: string) => {
    const next = new URLSearchParams(searchParams.toString())
    if (category) next.set('category', category)
    else next.delete('category')
    if (status) next.set('status', status)
    else next.delete('status')
    router.push(`/admin/risks?${next.toString()}`)
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const category = (form.querySelector('[name="category"]') as HTMLSelectElement).value
    const risk = (form.querySelector('[name="risk"]') as HTMLInputElement).value.trim()
    const mitigation = (form.querySelector('[name="mitigation"]') as HTMLTextAreaElement).value.trim()
    if (!risk || !mitigation) {
      toast.error('Risk description and mitigation are required')
      return
    }
    const res = await createRiskAction({
      category,
      risk,
      impact: (form.querySelector('[name="impact"]') as HTMLSelectElement).value as RiskImpact,
      likelihood: (form.querySelector('[name="likelihood"]') as HTMLSelectElement).value as RiskLikelihood,
      mitigation,
      owner: (form.querySelector('[name="owner"]') as HTMLInputElement).value.trim() || null,
      status: 'OPEN',
    })
    if (res.success && res.item) {
      toast.success('Risk logged')
      setShowForm(false)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editing) return
    const form = e.currentTarget
    const res = await updateRiskAction(editing.id, {
      category: (form.querySelector('[name="category"]') as HTMLSelectElement).value,
      risk: (form.querySelector('[name="risk"]') as HTMLInputElement).value.trim(),
      impact: (form.querySelector('[name="impact"]') as HTMLSelectElement).value as RiskImpact,
      likelihood: (form.querySelector('[name="likelihood"]') as HTMLSelectElement).value as RiskLikelihood,
      mitigation: (form.querySelector('[name="mitigation"]') as HTMLTextAreaElement).value.trim(),
      owner: (form.querySelector('[name="owner"]') as HTMLInputElement).value.trim() || null,
      status: (form.querySelector('[name="status"]') as HTMLSelectElement).value as RiskStatus,
    })
    if (res.success) {
      toast.success('Updated')
      setEditing(null)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const handleMarkReviewed = async (id: string) => {
    const res = await updateRiskAction(id, { reviewedAt: new Date() })
    if (res.success) {
      toast.success('Marked as reviewed')
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this risk?')) return
    const res = await deleteRiskAction(id)
    if (res.success) {
      toast.success('Deleted')
      setEditing(null)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const formatDate = (d: Date | null) => (d ? new Date(d).toLocaleDateString() : '—')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Category:</span>
          <select
            value={initialCategory ?? ''}
            onChange={(e) => setFilters(e.target.value || undefined, initialStatus)}
            className="rounded border border-gray-300 text-sm py-1.5 px-2"
          >
            <option value="">All</option>
            {RISK_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <select
            value={initialStatus ?? ''}
            onChange={(e) => setFilters(initialCategory, e.target.value || undefined)}
            className="rounded border border-gray-300 text-sm py-1.5 px-2"
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded bg-[#1a5f3f] text-white text-sm px-3 py-1.5 hover:bg-[#144a30]"
        >
          + Log risk
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Log new risk</h2>
          <form onSubmit={handleCreate} className="space-y-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label>
                <span className="block text-gray-600 mb-1">Category</span>
                <select name="category" required className="w-full rounded border border-gray-300 py-1.5 px-2">
                  {RISK_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="block text-gray-600 mb-1">Owner (name or email)</span>
                <input type="text" name="owner" className="w-full rounded border border-gray-300 py-1.5 px-2" placeholder="Optional" />
              </label>
            </div>
            <label>
              <span className="block text-gray-600 mb-1">Risk description</span>
              <input type="text" name="risk" required className="w-full rounded border border-gray-300 py-1.5 px-2" placeholder="e.g. Chef no-shows, SLA breaches" />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label>
                <span className="block text-gray-600 mb-1">Impact</span>
                <select name="impact" className="w-full rounded border border-gray-300 py-1.5 px-2">
                  {IMPACTS.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="block text-gray-600 mb-1">Likelihood</span>
                <select name="likelihood" className="w-full rounded border border-gray-300 py-1.5 px-2">
                  {LIKELIHOODS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <span className="block text-gray-600 mb-1">Mitigation</span>
              <textarea name="mitigation" required rows={2} className="w-full rounded border border-gray-300 py-1.5 px-2" placeholder="How we mitigate this risk" />
            </label>
            <div className="flex gap-2">
              <button type="submit" className="rounded bg-[#1a5f3f] text-white px-3 py-1.5 text-sm">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-600 hover:underline text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impact / Likelihood</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mitigation</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last reviewed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {risks.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{r.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{r.risk}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.impact} / {r.likelihood}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={r.mitigation}>{r.mitigation}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.owner ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_CLASS[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(r.reviewedAt)}</td>
                  <td className="px-4 py-3 text-sm">
                    {editing?.id === r.id ? (
                      <EditForm
                        risk={r}
                        onSave={handleUpdate}
                        onMarkReviewed={() => handleMarkReviewed(r.id)}
                        onDelete={() => handleDelete(r.id)}
                        onCancel={() => setEditing(null)}
                      />
                    ) : (
                      <>
                        <button type="button" onClick={() => setEditing(r)} className="text-[#1a5f3f] hover:underline mr-2">Edit</button>
                        {r.status !== 'CLOSED' && (
                          <button type="button" onClick={() => handleMarkReviewed(r.id)} className="text-gray-600 hover:underline mr-2">Mark reviewed</button>
                        )}
                        <button type="button" onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {risks.length === 0 && (
          <p className="p-4 text-sm text-gray-500">No risks match the filter. Log a risk to get started.</p>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Review cadence: monthly. Mark as reviewed when you re-assess. Close when risk is no longer relevant.
      </p>
    </div>
  )
}

function EditForm({
  risk,
  onSave,
  onMarkReviewed,
  onDelete,
  onCancel,
}: {
  risk: RiskRow
  onSave: (e: React.FormEvent<HTMLFormElement>) => void
  onMarkReviewed: () => void
  onDelete: () => void
  onCancel: () => void
}) {
  return (
    <div className="inline-block p-3 rounded border border-gray-200 bg-white shadow">
      <form onSubmit={onSave} className="space-y-2 text-xs min-w-[280px]">
        <label className="block">
          <span className="text-gray-600">Category</span>
          <select name="category" defaultValue={risk.category} className="w-full rounded border border-gray-300 py-1 px-2 mt-0.5">
            {RISK_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-gray-600">Risk</span>
          <input name="risk" defaultValue={risk.risk} className="w-full rounded border border-gray-300 py-1 px-2 mt-0.5" />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label>
            <span className="text-gray-600">Impact</span>
            <select name="impact" defaultValue={risk.impact} className="w-full rounded border border-gray-300 py-1 px-2 mt-0.5">
              {IMPACTS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-gray-600">Likelihood</span>
            <select name="likelihood" defaultValue={risk.likelihood} className="w-full rounded border border-gray-300 py-1 px-2 mt-0.5">
              {LIKELIHOODS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="text-gray-600">Mitigation</span>
          <textarea name="mitigation" defaultValue={risk.mitigation} rows={2} className="w-full rounded border border-gray-300 py-1 px-2 mt-0.5" />
        </label>
        <label className="block">
          <span className="text-gray-600">Owner</span>
          <input name="owner" defaultValue={risk.owner ?? ''} className="w-full rounded border border-gray-300 py-1 px-2 mt-0.5" />
        </label>
        <label className="block">
          <span className="text-gray-600">Status</span>
          <select name="status" defaultValue={risk.status} className="w-full rounded border border-gray-300 py-1 px-2 mt-0.5">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2 pt-1">
          <button type="submit" className="rounded bg-[#1a5f3f] text-white px-2 py-1">Save</button>
          <button type="button" onClick={onCancel} className="text-gray-600 hover:underline">Cancel</button>
          <button type="button" onClick={onMarkReviewed} className="text-gray-600 hover:underline">Mark reviewed</button>
          <button type="button" onClick={onDelete} className="text-red-600 hover:underline">Delete</button>
        </div>
      </form>
    </div>
  )
}
