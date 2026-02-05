import { getPartnerProfileForCurrentUser } from '@/lib/partner'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { getCurrentPrismaUser } from '@/lib/partner'
import { requireRole } from '@/lib/require-role'
import { CHEF_ROLES } from '@/lib/require-role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { UserRole } from '@prisma/client'
import { ChefEducationModuleClient } from './ChefEducationModuleClient'
import { simpleMarkdownToHtml } from '../simple-markdown'

export const dynamic = 'force-dynamic'

/**
 * Phase 2M — Single education module. CHEF, ADMIN, STAFF. Content = markdown or HTML.
 */
export default async function ChefEducationModulePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: moduleId } = await params
  const role = await getCurrentUserRole()
  if (!role) redirect('/admin/login')
  requireRole(role, CHEF_ROLES)

  const profile = await getPartnerProfileForCurrentUser()
  if (!profile?.completed) redirect('/partner/setup')

  const user = await getCurrentPrismaUser()
  if (!user?.id) redirect('/admin/login')

  const module_ = await db.educationModule.findFirst({
    where: { id: moduleId, role: UserRole.CHEF },
  })
  if (!module_) notFound()

  const progress = await db.educationProgress.findUnique({
    where: { userId_moduleId: { userId: user.id, moduleId } },
  })

  // Content: if it looks like HTML (starts with <), use as-is (sanitization would be ideal); else treat as markdown
  const contentHtml =
    module_.content.trimStart().startsWith('<') ? module_.content : simpleMarkdownToHtml(module_.content)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        {module_.required ? (
          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            Required
          </span>
        ) : (
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            Optional
          </span>
        )}
      </div>
      <h1 className="text-xl font-semibold text-gray-900">{module_.title}</h1>

      <div
        className="rounded-lg border border-gray-200 bg-white p-6 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      <ChefEducationModuleClient
        moduleId={module_.id}
        completed={progress?.completed ?? false}
      />

      <Link href="/chef/education" className="text-sm text-green-700 hover:underline">
        ← Back to education
      </Link>
    </div>
  )
}
