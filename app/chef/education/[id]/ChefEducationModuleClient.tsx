'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { markModuleComplete } from '../actions'

type Props = { moduleId: string; completed: boolean }

export function ChefEducationModuleClient({ moduleId, completed: initialCompleted }: Props) {
  const router = useRouter()
  const [completed, setCompleted] = useState(initialCompleted)
  const [saving, setSaving] = useState(false)

  async function handleMarkComplete() {
    setSaving(true)
    const res = await markModuleComplete(moduleId)
    setSaving(false)
    if (res.success) {
      setCompleted(true)
      router.refresh()
    } else {
      alert(res.error ?? 'Failed to save')
    }
  }

  if (completed) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
        ✓ Marked complete
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <button
        onClick={handleMarkComplete}
        disabled={saving}
        className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Mark Complete'}
      </button>
    </div>
  )
}
