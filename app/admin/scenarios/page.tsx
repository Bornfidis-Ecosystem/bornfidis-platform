import Link from 'next/link'
import { getScenarioInputs } from '@/lib/scenarios'
import ScenariosClient from './ScenariosClient'

export const dynamic = 'force-dynamic'

/** Phase 2AR — Scenario Planning. Admin/Staff only. */
export default async function AdminScenariosPage() {
  const inputs = await getScenarioInputs()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/admin" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Scenario planning</h1>
        <p className="text-sm text-gray-600 mb-6">
          Model Best / Base / Worst outcomes for staffing, cash, and growth. Outputs align with forecast assumptions. Not guarantees.
        </p>
        <ScenariosClient initialInputs={inputs} />
      </div>
    </div>
  )
}
