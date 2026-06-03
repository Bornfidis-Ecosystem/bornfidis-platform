import { Button } from '@/components/ui/Button'

export default function PassiveSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-card px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md border border-goldAccent/30">
        <h1 className="text-2xl font-bold text-forest">
          Thank you for your purchase!
        </h1>
        <p className="mt-4 text-gray-600">
          You will receive access details shortly.
        </p>
        <Button href="/passive" variant="primary" className="mt-6">
          Back to Passive Income Tools
        </Button>
      </div>
    </div>
  )
}

