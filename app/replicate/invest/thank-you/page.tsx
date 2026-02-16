import Link from 'next/link'

export default function InvestThankYouPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-[#FFBC00] text-[#1a5f3f] py-12 rounded-lg shadow-lg">
          <div className="h-1 w-24 bg-[#1a5f3f] mx-auto mb-6"></div>
          <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
          <p className="text-[#1a5f3f] text-lg mb-6">
            Your impact investment inquiry has been submitted successfully.
          </p>
          <p className="text-[#154a32] text-sm mb-8">
            We'll review your inquiry and get back to you soon. 
            Thank you for investing in the regenerative movement!
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/replicate"
              className="inline-block px-6 py-3 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition"
            >
              Learn More
            </Link>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-white text-[#1a5f3f] rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Return to Home
            </Link>
          </div>
        </div>

        <div className="mt-8 text-gray-500 text-sm">
          <p className="italic">
            "Go into all the world and make disciples of all nations."
          </p>
          <p className="mt-2 font-semibold">— Matthew 28:19</p>
        </div>
      </div>
    </div>
  )
}

