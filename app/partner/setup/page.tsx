import PartnerSetupForm from './PartnerSetupForm'

/**
 * Phase 2C — Partner setup wizard (PARTNER only, gate in layout).
 */
export default function PartnerSetupPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Partner profile setup</h1>
        <p className="text-gray-600 text-sm mb-8">
          Complete your profile so we can connect you with the right opportunities. Takes under 3 minutes.
        </p>
        <PartnerSetupForm />
      </div>
    </div>
  )
}
