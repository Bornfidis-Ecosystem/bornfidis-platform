import Link from 'next/link'
import { AdminNewEducationModuleForm } from './AdminNewEducationModuleForm'

export const dynamic = 'force-dynamic'

/**
 * Phase 2M — Admin: Create new chef education module.
 */
export default function AdminNewEducationPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Add education module</h1>
      <AdminNewEducationModuleForm />
      <Link href="/admin/education" className="text-sm text-green-700 hover:underline">
        ← Back to education
      </Link>
    </div>
  )
}
