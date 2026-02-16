import Link from 'next/link'
import { SuccessAlert } from '@/components/ui/SuccessAlert'

export default function ThanksPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <div className="bg-white p-12 rounded-lg shadow-sm">
          <SuccessAlert
            title="Thank you"
            message="We've received your booking request. We'll be in touch within 48 hours."
            className="mb-6"
          />

          <div className="prose text-left max-w-none mb-8">
            <h2 className="text-2xl font-semibold text-navy mb-4">What Happens Next?</h2>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="font-semibold mr-2">1.</span>
                <span>We&apos;ll review your request and check availability</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">2.</span>
                <span>You&apos;ll receive a detailed quote within 48 hours</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">3.</span>
                <span>Once you approve, we&apos;ll send a deposit invoice to secure your date</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">4.</span>
                <span>When your chef is assigned, you&apos;ll see their profile and verified credentials in your booking portal.</span>
              </li>
            </ol>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-gray-600 mb-6">
              Questions? Reach us at{' '}
              <a href="mailto:brian@bornfidis.com" className="text-navy font-semibold hover:underline">
                brian@bornfidis.com
              </a>
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-navy text-white rounded-lg font-semibold hover:bg-opacity-90 transition"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

