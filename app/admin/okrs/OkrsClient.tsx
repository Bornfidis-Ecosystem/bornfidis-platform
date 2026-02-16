'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  getOKRsByPeriod,
  createOKRAction,
  updateOKRAction,
  deleteOKRAction,
  createKeyResultAction,
  updateKeyResultAction,
  deleteKeyResultAction,
  refreshOKRsAction,
} from './actions'
import {
  getKrStatus,
  getKrProgressPct,
  OKR_METRIC_KEYS,
  type OkrWithKrs,
  type KrStatus,
} from '@/lib/okrs'

type Props = {
  initialPeriod: string
  initialPeriods: string[]
  initialOKRs: OkrWithKrs[]
}

const STATUS_LABEL: Record<KrStatus, string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  off_track: 'Off Track',
}

const STATUS_CLASS: Record<KrStatus, string> = {
  on_track: 'bg-green-100 text-green-800',
  at_risk: 'bg-amber-100 text-amber-800',
  off_track: 'bg-red-100 text-red-800',
}

function formatMetricValue(metric: string, value: number): string {
  if (metric.includes('cents') || metric.includes('revenue')) return `$${Math.round(value / 100).toLocaleString()}`
  if (metric === 'avg_rating') return value.toFixed(1)
  if (metric.includes('pct') || metric === 'completion_rate_pct' || metric === 'sla_adherence_pct') return `${value}%`
  return String(Math.round(value))
}

export default function OkrsClient({ initialPeriod, initialPeriods, initialOKRs }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [period, setPeriod] = useState(initialPeriod)
  const [periods, setPeriods] = useState(initialPeriods)
  const [okrs, setOkrs] = useState<OkrWithKrs[]>(initialOKRs)
  const [editingOkrId, setEditingOkrId] = useState<string | null>(null)
  const [addingKrOkrId, setAddingKrOkrId] = useState<string | null>(null)
  const [editingKrId, setEditingKrId] = useState<string | null>(null)

  useEffect(() => {
    setPeriod(initialPeriod)
    setPeriods(initialPeriods)
    setOkrs(initialOKRs)
  }, [initialPeriod, initialPeriods, initialOKRs])

  const changePeriod = (p: string) => {
    setPeriod(p)
    const next = new URLSearchParams(searchParams.toString())
    next.set('period', p)
    router.push(`/admin/okrs?${next.toString()}`)
  }

  const loadPeriod = async () => {
    const list = await getOKRsByPeriod(period)
    setOkrs(list)
    router.refresh()
  }

  const handleRefresh = async () => {
    const res = await refreshOKRsAction(period)
    if (res.error) toast.error(res.error)
    else toast.success(`Updated ${res.updated} key result(s) from live data`)
    loadPeriod()
  }

  const handleCreateOKR = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const periodVal = (form.querySelector('[name="new_okr_period"]') as HTMLInputElement)?.value?.trim()
    const objective = (form.querySelector('[name="new_okr_objective"]') as HTMLInputElement)?.value?.trim()
    if (!periodVal || !objective) return
    const created = await createOKRAction({ period: periodVal, objective })
    if (created) {
      toast.success('OKR created')
      if (!periods.includes(periodVal)) setPeriods((p) => [...p, periodVal].sort().reverse())
      setPeriod(periodVal)
      changePeriod(periodVal)
    } else toast.error('Failed to create OKR')
  }

  const handleUpdateOKR = async (id: string, objective: string) => {
    const updated = await updateOKRAction(id, { objective })
    if (updated) {
      toast.success('OKR updated')
      setOkrs((prev) => prev.map((o) => (o.id === id ? { ...o, objective } : o)))
      setEditingOkrId(null)
    } else toast.error('Failed to update')
  }

  const handleDeleteOKR = async (id: string) => {
    if (!confirm('Delete this OKR and all its key results?')) return
    await deleteOKRAction(id)
    toast.success('OKR deleted')
    loadPeriod()
  }

  const handleCreateKR = async (
    e: React.FormEvent<HTMLFormElement>,
    okrId: string
  ) => {
    e.preventDefault()
    const form = e.currentTarget
    const metric = (form.querySelector('[name="kr_metric"]') as HTMLSelectElement)?.value
    const target = parseFloat((form.querySelector('[name="kr_target"]') as HTMLInputElement)?.value || '0')
    if (!metric) return
    const created = await createKeyResultAction({ okrId, metric, target })
    if (created) {
      toast.success('Key result added')
      setAddingKrOkrId(null)
      loadPeriod()
    } else toast.error('Failed to add key result')
  }

  const handleUpdateKRNotes = async (id: string, notes: string) => {
    const updated = await updateKeyResultAction(id, { notes: notes || null })
    if (updated) {
      setOkrs((prev) =>
        prev.map((o) => ({
          ...o,
          keyResults: o.keyResults.map((kr) => (kr.id === id ? { ...kr, notes } : kr)),
        }))
      )
      setEditingKrId(null)
    }
  }

  const handleDeleteKR = async (id: string) => {
    if (!confirm('Remove this key result?')) return
    await deleteKeyResultAction(id)
    toast.success('Key result removed')
    loadPeriod()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Period:</label>
        <select
          value={period}
          onChange={(e) => changePeriod(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          {periods.length === 0 && <option value="">Add an OKR to create a period</option>}
          {periods.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleRefresh}
          className="rounded px-3 py-1.5 bg-forestDark text-white text-sm hover:bg-[#144a30]"
        >
          Refresh from live data
        </button>
      </div>

      {/* Add OKR */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Add OKR</h2>
        <form onSubmit={handleCreateOKR} className="flex flex-wrap gap-3 items-end">
          <label className="text-sm">
            Period
            <input
              name="new_okr_period"
              type="text"
              placeholder="Q1-2026 or 2026-01"
              className="ml-2 border rounded px-2 py-1 w-28"
              required
            />
          </label>
          <label className="text-sm flex-1 min-w-[200px]">
            Objective
            <input
              name="new_okr_objective"
              type="text"
              placeholder="Qualitative goal"
              className="ml-2 border rounded px-2 py-1 w-full max-w-md"
              required
            />
          </label>
          <button type="submit" className="rounded px-3 py-1.5 bg-gray-800 text-white text-sm hover:bg-gray-900">
            Add
          </button>
        </form>
      </div>

      {/* OKR list for selected period */}
      <div className="space-y-4">
        {okrs.length === 0 && period && (
          <p className="text-gray-500 text-sm">No OKRs for this period. Add one above.</p>
        )}
        {okrs.map((okr) => (
          <div key={okr.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              {editingOkrId === okr.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const v = (e.currentTarget.querySelector('input') as HTMLInputElement).value
                    handleUpdateOKR(okr.id, v)
                  }}
                  className="flex-1 flex gap-2"
                >
                  <input
                    type="text"
                    defaultValue={okr.objective}
                    className="border rounded px-2 py-1 flex-1"
                  />
                  <button type="submit" className="text-sm text-forestDark">Save</button>
                  <button type="button" onClick={() => setEditingOkrId(null)} className="text-sm text-gray-500">Cancel</button>
                </form>
              ) : (
                <h3 className="font-medium text-gray-900">{okr.objective}</h3>
              )}
              {editingOkrId !== okr.id && (
                <div className="flex gap-1">
                  <button type="button" onClick={() => setEditingOkrId(okr.id)} className="text-sm text-forestDark hover:underline">Edit</button>
                  <button type="button" onClick={() => handleDeleteOKR(okr.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-3">{okr.period}</p>

            {/* Key results */}
            <ul className="space-y-3">
              {okr.keyResults.map((kr) => {
                const progress = getKrProgressPct(kr.current, kr.target)
                const status = getKrStatus(kr.current, kr.target)
                return (
                  <li key={kr.id} className="border-l-2 border-gray-200 pl-3 py-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-700">{kr.metric.replace(/_/g, ' ')}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${STATUS_CLASS[status]}`}>
                        {STATUS_LABEL[status]}
                      </span>
                      {editingKrId === kr.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            const v = (e.currentTarget.querySelector('textarea') as HTMLTextAreaElement).value
                            handleUpdateKRNotes(kr.id, v)
                          }}
                          className="flex gap-2 flex-1"
                        >
                          <textarea
                            defaultValue={kr.notes ?? ''}
                            placeholder="Notes"
                            rows={1}
                            className="border rounded px-2 py-1 text-sm flex-1"
                          />
                          <button type="submit" className="text-sm text-forestDark">Save</button>
                          <button type="button" onClick={() => setEditingKrId(null)} className="text-sm text-gray-500">Cancel</button>
                        </form>
                      ) : (
                        <>
                          <span className="text-sm text-gray-600">
                            {formatMetricValue(kr.metric, kr.current)} / {formatMetricValue(kr.metric, kr.target)}
                          </span>
                          <button type="button" onClick={() => setEditingKrId(kr.id)} className="text-xs text-gray-500 hover:underline">
                            {kr.notes ? 'Edit notes' : 'Add notes'}
                          </button>
                          <button type="button" onClick={() => handleDeleteKR(kr.id)} className="text-xs text-red-600 hover:underline">Remove</button>
                        </>
                      )}
                    </div>
                    <div className="h-2 bg-gray-100 rounded overflow-hidden">
                      <div
                        className={`h-full rounded ${
                          status === 'on_track' ? 'bg-green-500' : status === 'at_risk' ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                    {kr.notes && editingKrId !== kr.id && <p className="text-xs text-gray-500 mt-1">{kr.notes}</p>}
                  </li>
                )
              })}
            </ul>

            {/* Add KR */}
            {addingKrOkrId === okr.id ? (
              <form onSubmit={(e) => handleCreateKR(e, okr.id)} className="mt-3 flex flex-wrap gap-2 items-end">
                <select name="kr_metric" className="border rounded px-2 py-1 text-sm" required>
                  {OKR_METRIC_KEYS.map((m) => (
                    <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <input name="kr_target" type="number" step="any" placeholder="Target" className="border rounded px-2 py-1 w-24" required />
                <button type="submit" className="text-sm text-forestDark">Add</button>
                <button type="button" onClick={() => setAddingKrOkrId(null)} className="text-sm text-gray-500">Cancel</button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setAddingKrOkrId(okr.id)}
                className="mt-3 text-sm text-forestDark hover:underline"
              >
                + Add key result
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

