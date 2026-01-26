export default function ChefApplicationThankYouPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-[#1a5f3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#1a5f3f] mb-4">Application Received!</h1>
          <div className="h-1 w-24 bg-[#FFBC00] mx-auto mb-6"></div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-8">
          <p className="text-gray-700 text-lg mb-4">
            Thank you for your interest in joining the Bornfidis Chef Network!
          </p>
          <p className="text-gray-600 mb-6">
            We've received your application and will review it carefully. Our team will get back to you within 3-5 business days.
          </p>
          <div className="bg-green-50 border-l-4 border-[#1a5f3f] p-4 text-left">
            <p className="text-sm text-gray-700">
              <strong>What's Next?</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
              <li>We'll review your application and experience</li>
              <li>If approved, you'll receive an email with next steps</li>
              <li>You'll complete Stripe Connect onboarding for payments</li>
              <li>Once onboarded, you can start accepting bookings!</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition"
          >
            Return to Home
          </a>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm italic">
          <p>"May the Lord bless you and keep you; the Lord make his face shine on you and be gracious to you."</p>
          <p className="mt-2 font-semibold">— Numbers 6:24-25</p>
        </div>
      </div>
    </div>
  )
}
