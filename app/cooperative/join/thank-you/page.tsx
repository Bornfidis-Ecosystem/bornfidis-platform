import Link from 'next/link'

export default function CooperativeThankYouPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-[#1a5f3f] text-white py-12 rounded-lg shadow-lg">
          <div className="h-1 w-24 bg-[#FFBC00] mx-auto mb-6"></div>
          <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
          <p className="text-green-100 text-lg mb-6">
            Your cooperative application has been submitted successfully.
          </p>
          <p className="text-green-200 text-sm mb-8">
            We'll review your application and get back to you soon. 
            Welcome to the regenerative movement!
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/cooperative"
              className="inline-block px-6 py-3 bg-[#FFBC00] text-[#1a5f3f] rounded-lg font-semibold hover:bg-opacity-90 transition"
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
            "Two are better than one, because they have a good return for their labor."
          </p>
          <p className="mt-2 font-semibold">— Ecclesiastes 4:9</p>
        </div>
      </div>
    </div>
  )
}
