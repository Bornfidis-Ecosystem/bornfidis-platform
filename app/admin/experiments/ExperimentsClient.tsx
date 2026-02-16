'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  getExperimentsList,
  getExperimentResults,
  createExperimentAction,
  startExperimentAction,
  stopExperimentAction,
  completeExperimentAction,
  promoteWinnerAction,
} from './actions'
import type { ExperimentRow } from '@/lib/experiments'
import type { ExperimentResultsSummary } from '@/lib/experiments'
import {
  EXPERIMENT_CATEGORIES,
  PRIMARY_METRICS,
  SECONDARY_METRICS,
} from '@/lib/experiments'

type Props = { initialExperiments: ExperimentRow[] }

export default function ExperimentsClient({ initialExperiments }: Props) {
  const router = useRouter()
  const [experiments, setExperiments] = useState<ExperimentRow[]>(initialExperiments)
  const [results, setResults] = useState<Record<string, ExperimentResultsSummary | null>>({})
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    setExperiments(initialExperiments)
  }, [initialExperiments])

  const loadResults = async (id: string) => {
    const r = await getExperimentResults(id)
    setResults((prev) => ({ ...prev, [id]: r ?? null }))
  }

  const loadList = () => {
    router.refresh()
  }

  const handleStart = async (id: string) => {
    const res = await startExperimentAction(id)
    if (res.success) {
      toast.success('Experiment started')
      loadList()
    } else toast.error(res.error)
  }

  const handleStop = async (id: string) => {
    const res = await stopExperimentAction(id)
    if (res.success) {
      toast.success('Experiment stopped')
      loadList()
    } else toast.error(res.error)
  }

  const handleComplete = async (id: string) => {
    const res = await completeExperimentAction(id)
    if (res.success) {
      toast.success('Experiment marked complete')
      loadList()
    } else toast.error(res.error)
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    let variantA: unknown
    let variantB: unknown
    try {
      variantA = JSON.parse((form.querySelector('[name="variantA"]') as HTMLTextAreaElement).value || '{}')
      variantB = JSON.parse((form.querySelector('[name="variantB"]') as HTMLTextAreaElement).value || '{}')
    } catch {
      toast.error('Variant A and B must be valid JSON')
      return
    }
    const res = await createExperimentAction({
      name: (form.querySelector('[name="name"]') as HTMLInputElement).value.trim(),
      category: (form.querySelector('[name="category"]') as HTMLSelectElement).value || null,
      variantA,
      variantB,
      metric: (form.querySelector('[name="metric"]') as HTMLSelectElement).value,
      secondaryMetric: (form.querySelector('[name="secondaryMetric"]') as HTMLSelectElement).value || null,
      startAt: new Date((form.querySelector('[name="startAt"]') as HTMLInputElement).value),
      endAt: new Date((form.querySelector('[name="endAt"]') as HTMLInputElement).value),
    })
    if (res.success) {
      toast.success('Experiment created')
      setShowForm(false)
      loadList()
    } else toast.error(res.error)
  }

  const statusBadge = (status: string) => {
    const c =
      status === 'RUNNING' ? 'bg-green-100 text-green-800' :
      status === 'COMPLETE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
    return <span className={`text-xs px-2 py-0.5 rounded ${c}`}>{status}</span>
  }

  return (
    <div className="space-y-6">
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded px-3 py-1.5 bg-[#1a5f3f] text-white text-sm hover:bg-[#144a30]"
        >
          New experiment
        </button>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Create experiment</h2>
          <form onSubmit={handleCreate} className="space-y-3 max-w-2xl">
            <label className="block text-sm">
              Name
              <input name="name" type="text" required className="ml-2 border rounded px-2 py-1 w-full max-w-md" />
            </label>
            <label className="block text-sm">
              Hypothesis (Phase 2BD)
              <input name="hypothesis" type="text" placeholder="e.g. Surge 1.2x increases revenue without hurting conversion" className="ml-2 border rounded px-2 py-1 w-full max-w-md" />
            </label>
            <label className="block text-sm">
              Surface (one RUNNING per category)
              <select name="category" className="ml-2 border rounded px-2 py-1">
                <option value="">—</option>
                {EXPERIMENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Variant A (JSON)
              <textarea name="variantA" rows={3} className="ml-2 border rounded px-2 py-1 w-full font-mono text-xs" defaultValue="{}" />
            </label>
            <label className="block text-sm">
              Variant B (JSON)
              <textarea name="variantB" rows={3} className="ml-2 border rounded px-2 py-1 w-full font-mono text-xs" defaultValue="{}" />
            </label>
            <label className="block text-sm">
              Primary metric
              <select name="metric" className="ml-2 border rounded px-2 py-1">
                {PRIMARY_METRICS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Secondary metric (optional)
              <select name="secondaryMetric" className="ml-2 border rounded px-2 py-1">
                <option value="">—</option>
                {SECONDARY_METRICS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Start <input name="startAt" type="datetime-local" required className="border rounded px-2 py-1 ml-2" />
            </label>
            <label className="block text-sm">
              End <input name="endAt" type="datetime-local" required className="border rounded px-2 py-1 ml-2" />
            </label>
            <div className="flex gap-2">
              <button type="submit" className="rounded px-3 py-1.5 bg-green-600 text-white text-sm">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded px-3 py-1.5 border text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hypothesis</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Surface</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Winner</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start / End</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {experiments.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-6 text-gray-500 text-sm">No experiments yet.</td></tr>
            ) : (
              experiments.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{exp.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 max-w-[200px] truncate" title={exp.hypothesis ?? ''}>{exp.hypothesis ?? '—'}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{exp.category ?? '—'}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{exp.metric}{exp.secondaryMetric ? `, ${exp.secondaryMetric}` : ''}</td>
                  <td className="px-4 py-2">{statusBadge(exp.status)}</td>
                  <td className="px-4 py-2 text-sm">
                    {exp.winnerVariant ? (
                      <span className="text-green-700 font-medium">Variant {exp.winnerVariant}{exp.promotedAt ? ' (promoted)' : ''}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {new Date(exp.startAt).toLocaleDateString()} – {new Date(exp.endAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 flex flex-wrap gap-1">
                    {exp.status === 'STOPPED' && (
                      <button type="button" onClick={() => handleStart(exp.id)} className="text-xs text-green-600 hover:underline">Start</button>
                    )}
                    {exp.status === 'RUNNING' && (
                      <>
                        <button type="button" onClick={() => handleStop(exp.id)} className="text-xs text-amber-600 hover:underline">Stop</button>
                        <button type="button" onClick={() => handleComplete(exp.id)} className="text-xs text-blue-600 hover:underline">Complete</button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => loadResults(exp.id)}
                      className="text-xs text-forestDark hover:underline"
                    >
                      Results
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Results summary (Phase 2BD)</h2>
          {Object.entries(results).map(([id, summary]) => {
            if (!summary) return <p key={id} className="text-sm text-gray-500">No data yet.</p>
            const exp = experiments.find((e) => e.id === id)
            const handleDeclareWinner = async (variant: 'A' | 'B') => {
              const res = await promoteWinnerAction(id, variant, false)
              if (res.success) { toast.success(`Winner: Variant ${variant}`); loadList() }
              else toast.error(res.error)
            }
            const handlePromote = async (variant: 'A' | 'B') => {
              const res = await promoteWinnerAction(id, variant, true)
              if (res.success) { toast.success(`Variant ${variant} promoted`); loadList() }
              else toast.error(res.error)
            }
            return (
              <div key={id} className="mb-4 last:mb-0 p-3 rounded border border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Experiment: {exp?.name ?? id}</p>
                <p className="text-xs text-gray-600 mb-2">Split (50/50): A={summary.variantA.assignmentCount}, B={summary.variantB.assignmentCount}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Variant A</span>
                    <p>n={summary.variantA.count}, {summary.primaryMetric} mean: {summary.variantA.primaryMean.toFixed(2)}</p>
                    {summary.variantA.secondaryMean != null && (
                      <p className="text-gray-500">{summary.secondaryMetric} mean: {summary.variantA.secondaryMean.toFixed(2)}</p>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Variant B</span>
                    <p>n={summary.variantB.count}, {summary.primaryMetric} mean: {summary.variantB.primaryMean.toFixed(2)}</p>
                    {summary.variantB.secondaryMean != null && (
                      <p className="text-gray-500">{summary.secondaryMetric} mean: {summary.variantB.secondaryMean.toFixed(2)}</p>
                    )}
                  </div>
                </div>
                <p className="mt-2">
                  <span className="font-medium">Winner: </span>
                  <span className={summary.winner === 'tie' ? 'text-gray-600' : 'text-green-700'}>
                    {summary.winner === 'tie' ? 'Tie' : `Variant ${summary.winner}`}
                  </span>
                </p>
                {(exp?.status === 'COMPLETE' || exp?.status === 'STOPPED') && summary.winner !== 'tie' && !exp?.winnerVariant && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" onClick={() => handleDeclareWinner('A')} className="text-xs rounded px-2 py-1 bg-gray-100 hover:bg-gray-200">Declare A winner</button>
                    <button type="button" onClick={() => handleDeclareWinner('B')} className="text-xs rounded px-2 py-1 bg-gray-100 hover:bg-gray-200">Declare B winner</button>
                  </div>
                )}
                {(exp?.status === 'COMPLETE' || exp?.status === 'STOPPED') && (exp?.winnerVariant || summary.winner !== 'tie') && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" onClick={() => handlePromote('A')} className="text-xs rounded px-2 py-1 bg-[#1a5f3f] text-white hover:bg-[#144a30]">Promote A</button>
                    <button type="button" onClick={() => handlePromote('B')} className="text-xs rounded px-2 py-1 bg-[#1a5f3f] text-white hover:bg-[#144a30]">Promote B</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

