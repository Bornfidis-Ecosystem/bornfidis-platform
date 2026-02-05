import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AdminEducationModuleForm } from './AdminEducationModuleForm'

export const dynamic = 'force-dynamic'

/**
 * Phase 2M — Admin: Edit education module.
 */
export default async function AdminEducationModulePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const module_ = await db.educationModule.findUnique({
    where: { id },
  })
  if (!module_) notFound()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Edit: {module_.title}</h1>
      <AdminEducationModuleForm
        moduleId={module_.id}
        initial={{ title: module_.title, content: module_.content, required: module_.required }}
      />
      <Link href="/admin/education" className="text-sm text-green-700 hover:underline">
        ← Back to education
      </Link>
    </div>
  )
}
