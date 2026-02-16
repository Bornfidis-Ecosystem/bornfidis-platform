'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  createImprovementAction,
  updateImprovementAction,
} from './actions'
import type { ImprovementItemRow } from '@/lib/improvements'
import {
  IMPROVEMENT_SOURCES,
  IMPACT_LEVELS,
  EFFORT_LEVELS,
  URGENCY_LEVELS,
  IMPROVEMENT_STATUSES,
} from '@/lib/improvements'

type Props = {
  initialOpen: ImprovementItemRow[]
  initialBlocked: ImprovementItemRow[]
  initialShipped: ImprovementItemRow[]
  prefilledSource?: string
  prefilledTitle?: string
}

export default function ImprovementsClient({
  initialOpen,
  initialBlocked,
  initialShipped,
  prefilledSource,
  prefilledTitle,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(initialOpen)
  const [blocked, setBlocked] = useState(initialBlocked)
  const [shipped, setShipped] = useState(initialShipped)
  const [showForm, setShowForm] = useState(!!(prefilledSource || prefilledTitle))
  const [editing, setEditing] = useState<ImprovementItemRow | null>(null)

  useEffect(() => {
    setOpen(initialOpen)
    setBlocked(initialBlocked)
    setShipped(initialShipped)
  }, [initialOpen, initialBlocked, initialShipped])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const title = (form.querySelector('[name="title"]') as HTMLInputElement).value.trim()
    if (!title) {
      toast.error('Title is required')
      return
    }
    const res = await createImprovementAction({
      source: (form.querySelector('[name="source"]') as HTMLSelectElement).value,
      title,
      impact: (form.querySelector('[name="impact"]') as HTMLSelectElement).value,
      effort: (form.querySelector('[name="effort"]') as HTMLSelectElement).value,
      urgency: (form.querySelector('[name="urgency"]') as HTMLSelectElement).value,
      owner: (form.querySelector('[name="owner"]') as HTMLInputElement).value.trim() || null,
    })
    if (res.success && res.item) {
      toast.success('Item added to backlog')
      setOpen([res.item, ...open])
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
    const res = await updateImprovementAction(editing.id, {
      title: (form.querySelector('[name="title"]') as HTMLInputElement).value.trim(),
      impact: (form.querySelector('[name="impact"]') as HTMLSelectElement).value,
      effort: (form.querySelector('[name="effort"]') as HTMLSelectElement).value,
      urgency: (form.querySelector('[name="urgency"]') as HTMLSelectElement).value,
      owner: (form.querySelector('[name="owner"]') as HTMLInputElement).value.trim() || null,
      status: (form.querySelector('[name="status"]') as HTMLSelectElement).value,
      outcomeNote: (form.querySelector('[name="outcomeNote"]') as HTMLTextAreaElement).value.trim() || null,
    })
    if (res.success) {
      toast.success('Updated')
      setEditing(null)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const top3Ids = open.slice(0, 3).map((i) => i.id)

  const tableRow = (item: ImprovementItemRow, isTop3: boolean) => (
    <tr
      key={item.id}
      className={`hover:bg-gray-50 ${isTop3 ? 'bg-amber-50 border-l-4 border-l-amber-500' : ''}`}
    >
      <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.title}</td>
      <td className="px-4 py-2 text-sm text-gray-600">{item.source}</td>
      <td className="px-4 py-2 text-sm">{item.impact}</td>
      <td className="px-4 py-2 text-sm">{item.effort}</td>
      <td className="px-4 py-2 text-sm font-mono">{item.score}</td>
      <td className="px-4 py-2 text-sm text-gray-600">{item.owner ?? '—'}</td>
      <td className="px-4 py-2 text-sm">{item.status}</td>
      <td className="px-4 py-2">
        <button
          type="button"
          onClick={() => setEditing(item)}
          className="text-green-700 hover:underline text-sm"
        >
          Edit
        </button>
      </td>
    </tr>
  )

  return (
    <div className="space-y-6">
      {/* Create */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
          {showForm ? 'Add to backlog' : 'Improvement backlog'}
        </h2>
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
          >
            Add item
          </button>
        ) : (
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-2">
            <label className="md:col-span-2">
              Title *
              <input
                name="title"
                required
                defaultValue={prefilledTitle}
                className="border rounded px-2 py-1 w-full mt-0.5"
                placeholder="Short description"
              />
            </label>
            <label>
              Source *
              <select name="source" required defaultValue={prefilledSource ?? ''} className="border rounded px-2 py-1 w-full mt-0.5">
                {IMPROVEMENT_SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Impact *
              <select name="impact" required className="border rounded px-2 py-1 w-full mt-0.5">
                {IMPACT_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </label>
            <label>
              Effort *
              <select name="effort" required className="border rounded px-2 py-1 w-full mt-0.5">
                {EFFORT_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </label>
            <label>
              Urgency *
              <select name="urgency" required className="border rounded px-2 py-1 w-full mt-0.5">
                {URGENCY_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </label>
            <label>
              Owner
              <input name="owner" type="text" className="border rounded px-2 py-1 w-full mt-0.5" placeholder="Name or team" />
            </label>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700">
                Add to backlog
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit item</h3>
            <form onSubmit={handleUpdate} className="space-y-3 text-sm">
              <label className="block">
                Title *
                <input name="title" required defaultValue={editing.title} className="border rounded px-2 py-1 w-full mt-0.5" />
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label>
                  Impact
                  <select name="impact" defaultValue={editing.impact} className="border rounded px-2 py-1 w-full mt-0.5">
                    {IMPACT_LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Effort
                  <select name="effort" defaultValue={editing.effort} className="border rounded px-2 py-1 w-full mt-0.5">
                    {EFFORT_LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Urgency
                  <select name="urgency" defaultValue={editing.urgency} className="border rounded px-2 py-1 w-full mt-0.5">
                    {URGENCY_LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                Owner
                <input name="owner" type="text" defaultValue={editing.owner ?? ''} className="border rounded px-2 py-1 w-full mt-0.5" />
              </label>
              <label className="block">
                Status
                <select name="status" defaultValue={editing.status} className="border rounded px-2 py-1 w-full mt-0.5">
                  {IMPROVEMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                Outcome note (when Done)
                <textarea name="outcomeNote" rows={3} defaultValue={editing.outcomeNote ?? ''} className="border rounded px-2 py-1 w-full mt-0.5" />
              </label>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700">
                  Save
                </button>
                <button type="button" onClick={() => setEditing(null)} className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Open (priority order; top 3 highlighted) */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <h2 className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700">
          Open (Backlog + In Progress) — ship top 3
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-left font-medium text-gray-500">Title</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Source</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Impact</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Effort</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Score</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Owner</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {open.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    No open items. Add one from incidents, reviews, SLA, or ops.
                  </td>
                </tr>
              ) : (
                open.map((item) => tableRow(item, top3Ids.includes(item.id)))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blocked */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <h2 className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700">
          Blocked
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-left font-medium text-gray-500">Title</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Source</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Owner</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {blocked.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-500">None</td>
                </tr>
              ) : (
                blocked.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">{item.title}</td>
                    <td className="px-4 py-2 text-gray-600">{item.source}</td>
                    <td className="px-4 py-2 text-gray-600">{item.owner ?? '—'}</td>
                    <td className="px-4 py-2">
                      <button type="button" onClick={() => setEditing(item)} className="text-green-700 hover:underline text-sm">
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

      {/* Shipped this week */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <h2 className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700">
          Shipped this week
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-left font-medium text-gray-500">Title</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Source</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Completed</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {shipped.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-500">None yet this week</td>
                </tr>
              ) : (
                shipped.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">{item.title}</td>
                    <td className="px-4 py-2 text-gray-600">{item.source}</td>
                    <td className="px-4 py-2 text-gray-600">
                      {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-2 text-gray-600 max-w-xs truncate">{item.outcomeNote ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

