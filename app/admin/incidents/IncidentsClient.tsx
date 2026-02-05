'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createIncidentAction } from './actions'
import type { IncidentRow } from '@/lib/incidents'
import { INCIDENT_TYPES, INCIDENT_SEVERITIES } from '@/lib/incidents'

type Trend = { severity: string; count: number }

export default function IncidentsClient({
  initialIncidents,
  initialTrends,
}: {
  initialIncidents: IncidentRow[]
  initialTrends: Trend[]
}) {
  const router = useRouter()
  const [incidents, setIncidents] = useState(initialIncidents)
  const [trends, setTrends] = useState(initialTrends)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    setIncidents(initialIncidents)
    setTrends(initialTrends)
  }, [initialIncidents, initialTrends])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const summary = (form.querySelector('[name="summary"]') as HTMLTextAreaElement).value.trim()
    if (!summary) {
      toast.error('Summary (what happened) is required')
      return
    }
    const actionsRaw = (form.querySelector('[name="actionsJson"]') as HTMLTextAreaElement).value.trim()
    let actions: { description: string; owner: string; dueDate: string; done?: boolean }[] = []
    if (actionsRaw) {
      try {
        actions = JSON.parse(actionsRaw) as typeof actions
        if (!Array.isArray(actions)) actions = []
      } catch {
        toast.error('Action items must be valid JSON array')
        return
      }
    }
    const res = await createIncidentAction({
      type: (form.querySelector('[name="type"]') as HTMLSelectElement).value,
      severity: (form.querySelector('[name="severity"]') as HTMLSelectElement).value,
      summary,
      impact: (form.querySelector('[name="impact"]') as HTMLTextAreaElement).value.trim() || null,
      rootCause: (form.querySelector('[name="rootCause"]') as HTMLTextAreaElement).value.trim() || null,
      whatWentWell: (form.querySelector('[name="whatWentWell"]') as HTMLTextAreaElement).value.trim() || null,
      whatToImprove: (form.querySelector('[name="whatToImprove"]') as HTMLTextAreaElement).value.trim() || null,
      actions: actions.length ? actions : null,
      bookingId: (form.querySelector('[name="bookingId"]') as HTMLInputElement).value.trim() || null,
      chefId: (form.querySelector('[name="chefId"]') as HTMLInputElement).value.trim() || null,
    })
    if (res.success && res.incident) {
      toast.success('Incident logged')
      setIncidents([res.incident, ...incidents])
      setShowForm(false)
      router.refresh()
    } else {
      toast.error(res.error ?? 'Failed to create')
    }
  }

  const severityColor = (s: string) =>
    s === 'HIGH' ? 'bg-red-100 text-red-800' : s === 'MED' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'

  return (
    <div className="space-y-6">
      {/* Trends */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Trends (last 90 days)</h2>
        <div className="flex flex-wrap gap-3">
          {trends.length === 0 ? (
            <span className="text-gray-500 text-sm">No incidents yet</span>
          ) : (
            trends.map((t) => (
              <span key={t.severity} className={`px-2 py-1 rounded text-sm font-medium ${severityColor(t.severity)}`}>
                {t.severity}: {t.count}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Log new */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
          {showForm ? 'Log new incident' : 'Incidents'}
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Use blameless language. Focus on what happened and what we can improve. Action items: owner + due date.
        </p>
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
          >
            Log incident
          </button>
        ) : (
          <form onSubmit={handleCreate} className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label>
                Type *
                <select name="type" required className="ml-2 border rounded px-2 py-1 w-full mt-0.5">
                  {INCIDENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Severity *
                <select name="severity" required className="ml-2 border rounded px-2 py-1 w-full mt-0.5">
                  {INCIDENT_SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              What happened (summary) *
              <textarea name="summary" required rows={3} className="border rounded px-2 py-1 w-full mt-0.5" placeholder="Blameless description of what occurred" />
            </label>
            <label className="block">
              Impact (who/what/when)
              <textarea name="impact" rows={2} className="border rounded px-2 py-1 w-full mt-0.5" placeholder="Who was affected, what was impacted, when" />
            </label>
            <label className="block">
              Root cause
              <textarea name="rootCause" rows={2} className="border rounded px-2 py-1 w-full mt-0.5" />
            </label>
            <label className="block">
              What went well
              <textarea name="whatWentWell" rows={2} className="border rounded px-2 py-1 w-full mt-0.5" />
            </label>
            <label className="block">
              What to improve
              <textarea name="whatToImprove" rows={2} className="border rounded px-2 py-1 w-full mt-0.5" />
            </label>
            <label className="block">
              Action items (JSON: [{'"'}description{'"'}, {'"'}owner{'"'}, {'"'}dueDate{'"'}])
              <textarea name="actionsJson" rows={3} className="border rounded px-2 py-1 w-full mt-0.5 font-mono text-xs" placeholder='[{"description":"...","owner":"...","dueDate":"YYYY-MM-DD"}]' />
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label>
                Booking ID (optional)
                <input name="bookingId" type="text" className="border rounded px-2 py-1 w-full mt-0.5" placeholder="UUID" defaultValue={prefilledBookingId ?? ''} />
              </label>
              <label>
                Chef user ID (optional)
                <input name="chefId" type="text" className="border rounded px-2 py-1 w-full mt-0.5" placeholder="UUID" defaultValue={prefilledChefId ?? ''} />
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700">
                Save incident
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* List */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Severity</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Summary</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No incidents. Log one to start a postmortem.
                </td>
              </tr>
            ) : (
              incidents.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(i.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{i.type.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${severityColor(i.severity)}`}>
                      {i.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900 max-w-xs truncate">{i.summary}</td>
                  <td className="px-4 py-3">{i.closedAt ? 'Closed' : 'Open'}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/incidents/${i.id}`} className="text-green-700 hover:underline">
                      View
                    </Link>
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
