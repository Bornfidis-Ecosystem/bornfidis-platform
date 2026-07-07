/**
 * Printable QR code for farmer intake registration.
 * Operational URL: https://bornfidis.com/farmer-intake
 */
import { absoluteSiteUrl } from '@/lib/site-url'

const FARMER_INTAKE_URL = absoluteSiteUrl('/farmer-intake')

// Public QR image API (no API key)
const QR_IMAGE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(FARMER_INTAKE_URL)}`

export default function FarmerIntakeQRPage() {
  return (
    <div className="min-h-screen bg-white p-8 print:p-4">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold text-green-800 mb-2">
          Farmer Registration
        </h1>
        <p className="text-gray-600 mb-6">
          Scan to register as a supplier
        </p>
        <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block print:border-gray-400">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={QR_IMAGE_URL}
            alt={`QR code for ${FARMER_INTAKE_URL}`}
            width={300}
            height={300}
            className="mx-auto"
          />
        </div>
        <p className="mt-6 text-sm font-mono text-gray-700 break-all">
          {FARMER_INTAKE_URL}
        </p>
        <p className="mt-4 text-xs text-gray-500">
          Bornfidis Provisions · 876-448-8446
        </p>
        <p className="mt-8 text-xs text-gray-400 print:mt-4">
          Use https://www.qr-code-generator.com/ for a printable version with logo.
        </p>
      </div>
    </div>
  )
}

