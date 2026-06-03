'use client'

import { useState } from 'react'
import {
  updateCoachingCaseAction,
  reEvaluateChefAction,
  getCoachOptions,
} from './actions'
import type { CoachingCaseWithNames } from '@/lib/coaching'

type Props = {
  cases: CoachingCaseWithNames[]
  coachOptions: Array<{ id: string; name: string | null }>
}

export default function CoachingListClient({ cases: initialCases, coachOptions }: Props) {
  const [cases, setCases] = useState(initialCases)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [coachId, setCoachId] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSave(caseId: string) {
    setSaving(true)
    setMessage(null)
    const result = await updateCoachingCaseAction(caseId, {
      actionPlanNote: note || undefined,
      assignedCoachId: coachId || null,
      dueAt: dueAt || null,
      status: undefined,
    })
    setSaving(false)
    if (result.success) {
      setEditingId(null)
      setMessage('Saved.')
      window.location.reload()
    } else {
      setMessage(result.error ?? 'Failed')
    }
  }

  async function handleStatus(caseId: string, status: 'IN_PROGRESS' | 'CLEARED') {
    setSaving(true)
    setMessage(null)
    const result = await updateCoachingCaseAction(caseId, { status })
    setSaving(false)
    if (result.success) {
      setMessage(status === 'CLEARED' ? 'Case cleared.' : 'Marked in progress.')
      window.location.reload()
    } else {
      setMessage(result.error ?? 'Failed')
    }
  }

  async function handleReEvaluate(chefId: string) {
    setSaving(true)
    setMessage(null)
    const result = await reEvaluateChefAction(chefId)
    if (result.cleared.length > 0) {
      setMessage(`Cleared ${result.cleared.length} case(s) — metrics improved.`)
      window.location.reload()
    } else {
      setMessage('No cases cleared; triggers still active.')
    }
    setSaving(false)
  }

  if (cases.length === 0) {
    return (
      <p className="text-gray-500 p-4">
        No coaching cases. Cases are created automatically when triggers fire (low rating, on-time, prep missed). Run &quot;Evaluate all chefs&quot; to create cases.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      {message && <p className="text-sm text-green-700 mb-2">{message}</p>}
      <table className="w-full text-sm">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Chef</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Reason</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Coach</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Due</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {cases.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-medium text-gray-900">{c.chefName}</td>
              <td className="px-4 py-2 text-gray-700">{c.reason}</td>
              <td className="px-4 py-2">
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                    c.status === 'CLEARED'
                      ? 'bg-green-100 text-green-800'
                      : c.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {c.status}
                </span>
              </td>
              <td className="px-4 py-2 text-gray-600">{c.coachName ?? '—'}</td>
              <td className="px-4 py-2 text-gray-600">
                {c.dueAt ? new Date(c.dueAt).toLocaleDateString() : '—'}
              </td>
              <td className="px-4 py-2">
                {editingId === c.id ? (
                  <div className="space-y-2">
                    <select
                      value={coachId || ''}
                      onChange={(e) => setCoachId(e.target.value)}
                      className="border rounded px-2 py-1 text-xs"
                    >
                      <option value="">No coach</option>
                      {coachOptions.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name ?? o.id}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={dueAt}
                      onChange={(e) => setDueAt(e.target.value)}
                      className="border rounded px-2 py-1 text-xs"
                    />
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Action plan (education + note)"
                      rows={2}
                      className="w-full border rounded px-2 py-1 text-xs"
                    />
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleSave(c.id)}
                        disabled={saving}
                        className="text-xs px-2 py-1 bg-forestDark text-white rounded"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingId(null); setNote(''); setCoachId(''); setDueAt(''); }}
                        className="text-xs px-2 py-1 border rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(c.id)
                        setNote(c.actionPlanNote ?? '')
                        setCoachId(c.assignedCoachId ?? '')
                        setDueAt(c.dueAt ? new Date(c.dueAt).toISOString().slice(0, 10) : '')
                      }}
                      className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      Assign / Plan
                    </button>
                    {c.status !== 'IN_PROGRESS' && c.status !== 'CLEARED' && (
                      <button
                        type="button"
                        onClick={() => handleStatus(c.id, 'IN_PROGRESS')}
                        disabled={saving}
                        className="text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
                      >
                        In progress
                      </button>
                    )}
                    {c.status !== 'CLEARED' && (
                      <button
                        type="button"
                        onClick={() => handleStatus(c.id, 'CLEARED')}
                        disabled={saving}
                        className="text-xs px-2 py-1 border border-green-300 rounded hover:bg-green-50"
                      >
                        Clear
                      </button>
                    )}
                    {c.status !== 'CLEARED' && (
                      <button
                        type="button"
                        onClick={() => handleReEvaluate(c.chefId)}
                        disabled={saving}
                        className="text-xs px-2 py-1 border border-amber-300 rounded hover:bg-amber-50"
                        title="Re-check triggers; clear if improved"
                      >
                        Re-evaluate
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

