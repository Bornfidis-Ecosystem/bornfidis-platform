'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  upsertAssignmentAction,
  updateAssignmentAction,
  deleteAssignmentAction,
} from './actions'
import type { RoleWithAssignments, SuccessionAssignmentRow } from '@/lib/succession'
import type { SuccessionReadiness } from '@prisma/client'

const READINESS_LABELS: Record<SuccessionReadiness, string> = {
  READY: 'Ready',
  NEAR_READY: 'Near-ready',
  DEVELOPING: 'Developing',
}

const READINESS_CLASS: Record<SuccessionReadiness, string> = {
  READY: 'bg-green-100 text-green-800',
  NEAR_READY: 'bg-amber-100 text-amber-800',
  DEVELOPING: 'bg-gray-100 text-gray-700',
}

type Props = {
  initialRoles: RoleWithAssignments[]
  eligibleUsers: { id: string; name: string | null; email: string | null }[]
}

export default function SuccessionClient({ initialRoles, eligibleUsers }: Props) {
  const router = useRouter()
  const [roles, setRoles] = useState<RoleWithAssignments[]>(initialRoles)
  const [editing, setEditing] = useState<{ assignmentId: string; roleName: string } | null>(null)
  const [adding, setAdding] = useState<{ roleId: string; roleName: string; type: 'PRIMARY' | 'BACKUP' } | null>(null)

  useEffect(() => {
    setRoles(initialRoles)
  }, [initialRoles])

  const handleSetPrimary = async (roleId: string, userId: string) => {
    const res = await upsertAssignmentAction({
      successionRoleId: roleId,
      userId,
      assignmentType: 'PRIMARY',
    })
    if (res.success) {
      toast.success('Primary set')
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const handleAddBackup = async (roleId: string, userId: string, readiness?: SuccessionReadiness) => {
    const res = await upsertAssignmentAction({
      successionRoleId: roleId,
      userId,
      assignmentType: 'BACKUP',
      readiness: readiness ?? 'DEVELOPING',
    })
    if (res.success) {
      toast.success('Backup added')
      setAdding(null)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const handleUpdateAssignment = async (
    assignmentId: string,
    updates: { readiness?: SuccessionReadiness; trainingPathNotes?: string | null; lastReviewAt?: Date | null }
  ) => {
    const res = await updateAssignmentAction(assignmentId, updates)
    if (res.success) {
      toast.success('Updated')
      setEditing(null)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const handleRemove = async (assignmentId: string) => {
    if (!confirm('Remove this assignment?')) return
    const res = await deleteAssignmentAction(assignmentId)
    if (res.success) {
      toast.success('Removed')
      setEditing(null)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const formatDate = (d: Date | null) => (d ? new Date(d).toLocaleDateString() : '—')

  const personLabel = (a: SuccessionAssignmentRow) =>
    a.userName?.trim() || a.userEmail?.trim() || a.userId.slice(0, 8)

  const gaps = roles.filter((r) => r.backups.length === 0)
  const allCovered = gaps.length === 0

  return (
    <div className="space-y-6">
      {!allCovered && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-semibold text-amber-800">Gaps — add backups</h2>
          <p className="text-sm text-amber-700 mt-1">
            Every critical role should have at least one backup. Roles without backup: {gaps.map((r) => r.name).join(', ')}.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Primary</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Backups</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last review</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {roles.map((role) => (
                <tr key={role.id} className={role.backups.length === 0 ? 'bg-amber-50/50' : ''}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{role.name}</td>
                  <td className="px-4 py-3 text-sm">
                    {role.primary ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{personLabel(role.primary)}</span>
                        <span
                          className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium ${READINESS_CLASS[role.primary.readiness]}`}
                        >
                          {READINESS_LABELS[role.primary.readiness]}
                        </span>
                        {editing?.assignmentId === role.primary.id ? (
                          <EditForm
                            assignment={role.primary}
                            roleName={role.name}
                            onSave={(u) => handleUpdateAssignment(role.primary!.id, u)}
                            onRemove={() => handleRemove(role.primary!.id)}
                            onCancel={() => setEditing(null)}
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditing({ assignmentId: role.primary!.id, roleName: role.name })}
                            className="text-forestDark hover:underline text-xs"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    ) : (
                      <AddPrimarySelect
                        roleId={role.id}
                        roleName={role.name}
                        eligibleUsers={eligibleUsers}
                        existingUserIds={[role.primary?.userId, ...role.backups.map((b) => b.userId)].filter(Boolean) as string[]}
                        onSelect={(userId) => handleSetPrimary(role.id, userId)}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <ul className="space-y-1">
                      {role.backups.map((b) => (
                        <li key={b.id} className="flex flex-wrap items-center gap-2">
                          <span>{personLabel(b)}</span>
                          <span
                            className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium ${READINESS_CLASS[b.readiness]}`}
                          >
                            {READINESS_LABELS[b.readiness]}
                          </span>
                          {editing?.assignmentId === b.id ? (
                            <EditForm
                              assignment={b}
                              roleName={role.name}
                              onSave={(u) => handleUpdateAssignment(b.id, u)}
                              onRemove={() => handleRemove(b.id)}
                              onCancel={() => setEditing(null)}
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEditing({ assignmentId: b.id, roleName: role.name })}
                              className="text-forestDark hover:underline text-xs"
                            >
                              Edit
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                    {adding?.roleId === role.id ? (
                      <AddBackupSelect
                        roleId={role.id}
                        roleName={role.name}
                        eligibleUsers={eligibleUsers}
                        existingUserIds={[role.primary?.userId, ...role.backups.map((b) => b.userId)].filter(Boolean) as string[]}
                        onSelect={(userId, readiness) => handleAddBackup(role.id, userId, readiness)}
                        onCancel={() => setAdding(null)}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAdding({ roleId: role.id, roleName: role.name, type: 'BACKUP' })}
                        className="mt-1 text-forestDark hover:underline text-xs"
                      >
                        + Add backup
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(role.lastReviewAt)}</td>
                  <td className="px-4 py-3 text-sm">
                    {!role.primary ? (
                      <AddPrimarySelect
                        roleId={role.id}
                        roleName={role.name}
                        eligibleUsers={eligibleUsers}
                        existingUserIds={role.backups.map((b) => b.userId)}
                        onSelect={(userId) => handleSetPrimary(role.id, userId)}
                        label="Set primary"
                      />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AddPrimarySelect({
  roleId,
  roleName,
  eligibleUsers,
  existingUserIds,
  onSelect,
  label = 'Set primary',
}: {
  roleId: string
  roleName: string
  eligibleUsers: { id: string; name: string | null; email: string | null }[]
  existingUserIds: string[]
  onSelect: (userId: string) => void
  label?: string
}) {
  const available = eligibleUsers.filter((u) => !existingUserIds.includes(u.id))
  const [userId, setUserId] = useState('')
  if (available.length === 0) return <span className="text-gray-400 text-xs">No eligible users left</span>
  return (
    <form
      className="inline-flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (userId) onSelect(userId)
      }}
    >
      <select
        name="userId"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="rounded border border-gray-300 text-sm py-1 px-2"
      >
        <option value="">Select user</option>
        {available.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name || u.email || u.id.slice(0, 8)}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={!userId}
        className="rounded bg-forestDark text-white text-xs px-2 py-1 disabled:opacity-50"
      >
        {label}
      </button>
    </form>
  )
}

function AddBackupSelect({
  roleId,
  roleName,
  eligibleUsers,
  existingUserIds,
  onSelect,
  onCancel,
}: {
  roleId: string
  roleName: string
  eligibleUsers: { id: string; name: string | null; email: string | null }[]
  existingUserIds: string[]
  onSelect: (userId: string, readiness: SuccessionReadiness) => void
  onCancel: () => void
}) {
  const available = eligibleUsers.filter((u) => !existingUserIds.includes(u.id))
  const [userId, setUserId] = useState('')
  const [readiness, setReadiness] = useState<SuccessionReadiness>('DEVELOPING')
  if (available.length === 0) {
    return (
      <span className="text-gray-400 text-xs">
        No eligible users left <button type="button" onClick={onCancel} className="text-forestDark hover:underline ml-1">Cancel</button>
      </span>
    )
  }
  return (
    <form
      className="inline-flex flex-wrap items-center gap-2 mt-1"
      onSubmit={(e) => {
        e.preventDefault()
        if (userId) onSelect(userId, readiness)
      }}
    >
      <select
        name="userId"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="rounded border border-gray-300 text-sm py-1 px-2"
      >
        <option value="">Select user</option>
        {available.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name || u.email || u.id.slice(0, 8)}
          </option>
        ))}
      </select>
      <select
        name="readiness"
        value={readiness}
        onChange={(e) => setReadiness(e.target.value as SuccessionReadiness)}
        className="rounded border border-gray-300 text-sm py-1 px-2"
      >
        <option value="DEVELOPING">Developing</option>
        <option value="NEAR_READY">Near-ready</option>
        <option value="READY">Ready</option>
      </select>
      <button type="submit" disabled={!userId} className="rounded bg-forestDark text-white text-xs px-2 py-1 disabled:opacity-50">
        Add
      </button>
      <button type="button" onClick={onCancel} className="text-gray-500 hover:underline text-xs">
        Cancel
      </button>
    </form>
  )
}

function EditForm({
  assignment,
  roleName,
  onSave,
  onRemove,
  onCancel,
}: {
  assignment: SuccessionAssignmentRow
  roleName: string
  onSave: (u: { readiness?: SuccessionReadiness; trainingPathNotes?: string | null; lastReviewAt?: Date | null }) => void
  onRemove: () => void
  onCancel: () => void
}) {
  const [readiness, setReadiness] = useState<SuccessionReadiness>(assignment.readiness)
  const [trainingPathNotes, setTrainingPathNotes] = useState(assignment.trainingPathNotes ?? '')
  const [lastReviewAt, setLastReviewAt] = useState(
    assignment.lastReviewAt ? new Date(assignment.lastReviewAt).toISOString().slice(0, 10) : ''
  )

  return (
    <div className="inline-block mt-1 p-2 rounded border border-gray-200 bg-white shadow">
      <div className="flex flex-col gap-2 text-xs">
        <label className="flex items-center gap-2">
          Readiness:
          <select
            value={readiness}
            onChange={(e) => setReadiness(e.target.value as SuccessionReadiness)}
            className="rounded border border-gray-300 py-0.5 px-1"
          >
            <option value="DEVELOPING">Developing</option>
            <option value="NEAR_READY">Near-ready</option>
            <option value="READY">Ready</option>
          </select>
        </label>
        <label className="flex flex-col gap-0.5">
          Training path notes:
          <textarea
            value={trainingPathNotes}
            onChange={(e) => setTrainingPathNotes(e.target.value)}
            rows={2}
            className="rounded border border-gray-300 p-1 w-64"
            placeholder="Education modules + shadowing"
          />
        </label>
        <label className="flex items-center gap-2">
          Last review:
          <input
            type="date"
            value={lastReviewAt}
            onChange={(e) => setLastReviewAt(e.target.value)}
            className="rounded border border-gray-300 py-0.5 px-1"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              onSave({
                readiness,
                trainingPathNotes: trainingPathNotes.trim() || null,
                lastReviewAt: lastReviewAt ? new Date(lastReviewAt) : null,
              })
            }
            className="rounded bg-forestDark text-white px-2 py-0.5"
          >
            Save
          </button>
          <button type="button" onClick={onCancel} className="text-gray-600 hover:underline">
            Cancel
          </button>
          <button type="button" onClick={onRemove} className="text-red-600 hover:underline">
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

