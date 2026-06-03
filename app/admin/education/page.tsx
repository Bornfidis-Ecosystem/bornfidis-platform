import Link from 'next/link'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * Phase 2M — Admin: List chef education modules.
 */
export default async function AdminEducationPage() {
  const modules = await db.educationModule.findMany({
    where: { role: UserRole.CHEF },
    orderBy: { createdAt: 'asc' },
    select: { id: true, title: true, required: true, createdAt: true },
  })

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-semibold text-gray-900">Chef Education Modules</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/education/analytics"
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Analytics
          </Link>
          <Link
            href="/admin/education/new"
            className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Add module
          </Link>
        </div>
      </div>
      <p className="text-sm text-gray-500">
        Modules appear on /chef/education. Required modules must be completed before payouts (optional gate).
      </p>

      {modules.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          No modules yet. Add one to get started.
        </div>
      ) : (
        <ul className="space-y-2">
          {modules.map((m) => (
            <li key={m.id}>
              <Link
                href={`/admin/education/${m.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{m.title}</span>
                <div className="flex items-center gap-2">
                  {m.required ? (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Required
                    </span>
                  ) : (
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      Optional
                    </span>
                  )}
                  <span className="text-gray-400">→ Edit</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link href="/admin" className="text-sm text-green-700 hover:underline">
        ← Dashboard
      </Link>
    </div>
  )
}

