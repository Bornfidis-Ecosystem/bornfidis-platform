'use client'

import Link from 'next/link'

type ModuleRow = {
  id: string
  title: string
  required: boolean
  completed: boolean
  completedAt: Date | string | null
}

type Props = { modules: ModuleRow[] }

export function ChefEducationListClient({ modules }: Props) {
  if (modules.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        No modules yet. Admin can add education modules for chefs.
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {modules.map((m) => (
        <li key={m.id}>
          <Link
            href={`/chef/education/${m.id}`}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-900">{m.title}</span>
              {m.required ? (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  Required
                </span>
              ) : (
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  Optional
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {m.completed ? (
                <span className="text-sm font-medium text-green-700">Complete</span>
              ) : (
                <span className="text-sm text-gray-500">Not complete</span>
              )}
              <span className="text-gray-400">→</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
