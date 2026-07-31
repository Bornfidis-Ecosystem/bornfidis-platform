'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CulinaryCard } from '@/components/culinary-os'
import { changeProjectStatus, changeProjectPhase, toggleProjectTask } from '../actions'

type Task = {
  id: string
  title: string
  taskType: string | null
  order: number
  status: string
  completed: boolean
  completedAt: string | null
}

type Props = {
  project: { id: string; status: string; phase: string; projectNumber: string }
  tasks: Task[]
  statuses: string[]
  phases: string[]
}

export default function ProjectDetailClient({ project, tasks, statuses, phases }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async (action: () => Promise<{ success: boolean; error?: string }>) => {
    setSaving(true)
    setError(null)
    const result = await action()
    if (!result.success) {
      setError(result.error ?? 'Update failed')
    }
    router.refresh()
    setSaving(false)
  }

  const handleStatusChange = (newStatus: string) =>
    run(() => changeProjectStatus(project.id, newStatus))

  const handlePhaseChange = (newPhase: string) =>
    run(() => changeProjectPhase(project.id, newPhase))

  const handleToggleTask = (taskId: string) => run(() => toggleProjectTask(taskId))

  return (
    <div className="space-y-6">
      {error && (
        <p
          role="alert"
          className="border border-red-200 bg-red-50 px-3 py-2 font-culinary-sans text-sm text-red-800"
        >
          {error}
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CulinaryCard>
          <label className="font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">
            Status
          </label>
          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={saving}
            className="mt-1 w-full rounded-none border border-culinary-outline bg-white px-3 py-2 font-culinary-sans text-sm"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </CulinaryCard>
        <CulinaryCard>
          <label className="font-culinary-sans text-[10px] font-bold uppercase tracking-wider text-culinary-text-muted">
            Phase
          </label>
          <select
            value={project.phase}
            onChange={(e) => handlePhaseChange(e.target.value)}
            disabled={saving}
            className="mt-1 w-full rounded-none border border-culinary-outline bg-white px-3 py-2 font-culinary-sans text-sm"
          >
            {phases.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </CulinaryCard>
      </div>

      <CulinaryCard>
        <h3 className="mb-3 font-culinary-sans text-sm font-semibold text-culinary-navy">
          Milestones
        </h3>
        <div className="space-y-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-none border border-culinary-outline px-3 py-2"
            >
              <button
                type="button"
                onClick={() => !task.completed && handleToggleTask(task.id)}
                disabled={saving || task.completed}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-none border ${
                  task.completed
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-culinary-outline bg-white hover:border-culinary-gold-line'
                }`}
                aria-label={task.completed ? 'Completed' : 'Mark complete'}
              >
                {task.completed && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`font-culinary-sans text-sm ${task.completed ? 'text-culinary-text-muted line-through' : 'text-culinary-ink'}`}>
                  {task.title}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-none px-1.5 py-0.5 font-culinary-sans text-[9px] font-bold uppercase ${
                  task.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : task.status === 'blocked'
                      ? 'bg-red-100 text-red-800'
                      : task.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600'
                }`}
              >
                {task.status}
              </span>
            </div>
          ))}
        </div>
      </CulinaryCard>
    </div>
  )
}
