'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { updateIncidentAction, closeIncidentAction } from '../actions'
import type { IncidentRow, ActionItem } from '@/lib/incidents'
import { INCIDENT_TYPES, INCIDENT_SEVERITIES } from '@/lib/incidents'

export default function IncidentDetailClient({ incident: initial }: { incident: IncidentRow }) {
  const router = useRouter()
  const [incident, setIncident] = useState(initial)
  const [editing, setEditing] = useState(false)
  const isClosed = !!incident.closedAt
  const severityColor =
    incident.severity === 'HIGH'
      ? 'bg-red-100 text-red-800'
      : incident.severity === 'MED'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-gray-100 text-gray-800'

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const actionsRaw = (form.querySelector('[name="actionsJson"]') as HTMLTextAreaElement).value.trim()
    let actions: ActionItem[] = []
    if (actionsRaw) {
      try {
        const parsed = JSON.parse(actionsRaw)
        actions = Array.isArray(parsed) ? parsed : []
      } catch {
        toast.error('Action items must be valid JSON array')
        return
      }
    }
    const res = await updateIncidentAction(incident.id, {
      type: (form.querySelector('[name="type"]') as HTMLSelectElement).value,
      severity: (form.querySelector('[name="severity"]') as HTMLSelectElement).value,
      summary: (form.querySelector('[name="summary"]') as HTMLTextAreaElement).value.trim(),
      impact: (form.querySelector('[name="impact"]') as HTMLTextAreaElement).value.trim() || null,
      rootCause: (form.querySelector('[name="rootCause"]') as HTMLTextAreaElement).value.trim() || null,
      whatWentWell: (form.querySelector('[name="whatWentWell"]') as HTMLTextAreaElement).value.trim() || null,
      whatToImprove: (form.querySelector('[name="whatToImprove"]') as HTMLTextAreaElement).value.trim() || null,
      actions: actions.length ? actions : null,
    })
    if (res.success) {
      toast.success('Updated')
      setIncident({
        ...incident,
        type: (form.querySelector('[name="type"]') as HTMLSelectElement).value,
        severity: (form.querySelector('[name="severity"]') as HTMLSelectElement).value,
        summary: (form.querySelector('[name="summary"]') as HTMLTextAreaElement).value.trim(),
        impact: (form.querySelector('[name="impact"]') as HTMLTextAreaElement).value.trim() || null,
        rootCause: (form.querySelector('[name="rootCause"]') as HTMLTextAreaElement).value.trim() || null,
        whatWentWell: (form.querySelector('[name="whatWentWell"]') as HTMLTextAreaElement).value.trim() || null,
        whatToImprove: (form.querySelector('[name="whatToImprove"]') as HTMLTextAreaElement).value.trim() || null,
        actions: actions.length ? actions : null,
      })
      setEditing(false)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const handleClose = async () => {
    if (!confirm('Close this incident? It will become read-only.')) return
    const res = await closeIncidentAction(incident.id)
    if (res.success) {
      setIncident({ ...incident, closedAt: new Date() })
      toast.success('Incident closed')
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const section = (title: string, body: string | null) => (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">{title}</h3>
      <p className="text-gray-900 whitespace-pre-wrap">{body || '—'}</p>
    </div>
  )

  if (editing && !isClosed) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Edit incident</h1>
          <span className={`px-2 py-1 rounded text-sm font-medium ${severityColor}`}>{incident.severity}</span>
        </div>
        <form onSubmit={handleSave} className="space-y-4 text-sm">
          <label className="block">
            Type
            <select name="type" defaultValue={incident.type} className="border rounded px-2 py-1 w-full mt-1">
              {INCIDENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            Severity
            <select name="severity" defaultValue={incident.severity} className="border rounded px-2 py-1 w-full mt-1">
              {INCIDENT_SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            What happened (summary) *
            <textarea name="summary" required defaultValue={incident.summary} rows={3} className="border rounded px-2 py-1 w-full mt-1" />
          </label>
          <label className="block">
            Impact (who/what/when)
            <textarea name="impact" defaultValue={incident.impact ?? ''} rows={2} className="border rounded px-2 py-1 w-full mt-1" />
          </label>
          <label className="block">
            Root cause
            <textarea name="rootCause" defaultValue={incident.rootCause ?? ''} rows={2} className="border rounded px-2 py-1 w-full mt-1" />
          </label>
          <label className="block">
            What went well
            <textarea name="whatWentWell" defaultValue={incident.whatWentWell ?? ''} rows={2} className="border rounded px-2 py-1 w-full mt-1" />
          </label>
          <label className="block">
            What to improve
            <textarea name="whatToImprove" defaultValue={incident.whatToImprove ?? ''} rows={2} className="border rounded px-2 py-1 w-full mt-1" />
          </label>
          <label className="block">
            Action items (JSON)
            <textarea
              name="actionsJson"
              rows={4}
              className="border rounded px-2 py-1 w-full mt-1 font-mono text-xs"
              defaultValue={JSON.stringify(incident.actions ?? [], null, 2)}
            />
          </label>
          <div className="flex gap-2">
            <button type="submit" className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700">
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900">{incident.type.replace(/_/g, ' ')}</h1>
          <span className={`px-2 py-1 rounded text-sm font-medium ${severityColor}`}>{incident.severity}</span>
          {incident.closedAt && (
            <span className="px-2 py-1 rounded text-sm bg-gray-200 text-gray-700">Closed</span>
          )}
        </div>
        <div className="flex gap-2">
          {incident.bookingId && (
            <Link
              href={`/admin/bookings/${incident.bookingId}`}
              className="text-sm text-green-700 hover:underline"
            >
              View booking
            </Link>
          )}
          {incident.chefId && (
            <Link href={`/admin/chefs/${incident.chefId}`} className="text-sm text-green-700 hover:underline">
              View chef
            </Link>
          )}
          <Link
            href={`/admin/improvements?source=Incident&title=${encodeURIComponent(incident.summary.slice(0, 200))}`}
            className="text-sm text-green-700 hover:underline"
          >
            Add to backlog
          </Link>
          {!isClosed && (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-sm text-green-700 hover:underline"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 text-sm"
              >
                Close incident
              </button>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Created {new Date(incident.createdAt).toLocaleString()}
        {incident.closedAt && ` · Closed ${new Date(incident.closedAt).toLocaleString()}`}
      </p>

      {section('What happened', incident.summary)}
      {section('Impact (who/what/when)', incident.impact)}
      {section('Root cause', incident.rootCause)}
      {section('What went well', incident.whatWentWell)}
      {section('What to improve', incident.whatToImprove)}

      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Action items</h3>
        {!incident.actions?.length ? (
          <p className="text-gray-500">None</p>
        ) : (
          <ul className="space-y-2">
            {(incident.actions as ActionItem[]).map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={!!a.done} readOnly className="mt-1" />
                <span className={a.done ? 'text-gray-500 line-through' : 'text-gray-900'}>{a.description}</span>
                <span className="text-gray-500">— {a.owner}</span>
                <span className="text-gray-500">{a.dueDate}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
