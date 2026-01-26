import Link from 'next/link'

export default function LeaderThankYouPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-[#1a5f3f] text-white py-12 rounded-lg shadow-lg">
          <div className="h-1 w-24 bg-[#FFBC00] mx-auto mb-6"></div>
          <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
          <p className="text-green-100 text-lg mb-6">
            Your region leader application has been submitted successfully.
          </p>
          <p className="text-green-200 text-sm mb-8">
            We'll review your application and get back to you soon. 
            Thank you for your interest in replicating the regenerative movement!
          </p>
          <Link
            href="/replicate"
            className="inline-block px-6 py-3 bg-[#FFBC00] text-[#1a5f3f] rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            Return to Replication
          </Link>
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
