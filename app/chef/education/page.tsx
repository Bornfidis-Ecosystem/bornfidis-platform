import { getPartnerProfileForCurrentUser } from '@/lib/partner'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { getCurrentPrismaUser } from '@/lib/partner'
import { requireRole } from '@/lib/require-role'
import { CHEF_ROLES } from '@/lib/require-role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { ChefEducationListClient } from './ChefEducationListClient'

export const dynamic = 'force-dynamic'

/**
 * Phase 2M — Chef Education list. CHEF sees only CHEF modules; ADMIN/STAFF same.
 */
export default async function ChefEducationPage() {
  const role = await getCurrentUserRole()
  if (!role) redirect('/admin/login')
  requireRole(role, CHEF_ROLES)

  const profile = await getPartnerProfileForCurrentUser()
  if (!profile?.completed) redirect('/partner/setup')

  const user = await getCurrentPrismaUser()
  if (!user?.id) redirect('/admin/login')

  const modules = await db.educationModule.findMany({
    where: { role: UserRole.CHEF },
    orderBy: { createdAt: 'asc' },
    select: { id: true, title: true, required: true, createdAt: true },
  })

  const progress = await db.educationProgress.findMany({
    where: { userId: user.id, moduleId: { in: modules.map((m) => m.id) } },
    select: { moduleId: true, completed: true, completedAt: true },
  })
  const progressByModule = Object.fromEntries(
    progress.map((p) => [p.moduleId, { completed: p.completed, completedAt: p.completedAt }])
  )

  const completedCount = progress.filter((p) => p.completed).length
  const requiredModules = modules.filter((m) => m.required)
  const requiredCompleted = requiredModules.filter(
    (m) => progressByModule[m.id]?.completed === true
  ).length

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Education</h1>
      <p className="text-sm text-gray-500">
        Standards and training. Complete required modules to stay in good standing; optional modules help with booking flow and payouts.
      </p>

      {/* Phase 2O — Optional progress summary */}
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 space-y-1">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="font-medium">Progress:</span>
          <span>{completedCount}/{modules.length} complete</span>
        </div>
        {requiredModules.length > 0 && (
          <div className="text-sm text-gray-600">
            Required: {requiredCompleted}/{requiredModules.length} complete
            {requiredCompleted >= requiredModules.length && (
              <span className="ml-2 text-green-700 font-medium">✓ In good standing</span>
            )}
          </div>
        )}
      </div>

      <ChefEducationListClient
        modules={modules.map((m) => ({
          id: m.id,
          title: m.title,
          required: m.required,
          completed: progressByModule[m.id]?.completed ?? false,
          completedAt: progressByModule[m.id]?.completedAt ?? null,
        }))}
      />

      <Link href="/chef" className="text-sm text-green-700 hover:underline">
        ← Back to dashboard
      </Link>
    </div>
  )
}
