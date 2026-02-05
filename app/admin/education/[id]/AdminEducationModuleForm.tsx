'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateEducationModule } from '../actions'

type Props = {
  moduleId: string
  initial: { title: string; content: string; required: boolean }
}

export function AdminEducationModuleForm({ moduleId, initial }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(initial.title)
  const [content, setContent] = useState(initial.content)
  const [required, setRequired] = useState(initial.required)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await updateEducationModule(moduleId, { title, content, required })
    setSaving(false)
    if (res.success) {
      router.refresh()
      router.push('/admin/education')
    } else {
      alert(res.error ?? 'Failed to save')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Content (markdown or HTML)
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="required"
          type="checkbox"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-green-600"
        />
        <label htmlFor="required" className="text-sm text-gray-700">
          Required (chef must complete before payouts gate)
        </label>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
