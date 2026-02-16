import Link from 'next/link'

export default function FarmerThankYouPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-[#1a5f3f] text-white py-12 rounded-lg shadow-lg">
          <div className="h-1 w-24 bg-[#FFBC00] mx-auto mb-6"></div>
          <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
          <p className="text-green-100 text-lg mb-6">
            Your application has been submitted successfully.
          </p>
          <p className="text-green-200 text-sm mb-8">
            We'll review your application and get back to you soon. 
            In the meantime, feel free to reach out if you have any questions.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#FFBC00] text-[#1a5f3f] rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            Return to Home
          </Link>
        </div>

        <div className="mt-8 text-gray-500 text-sm">
          <p className="italic">
            "The Lord will open the heavens, the storehouse of his bounty, to send rain on your land in season and to bless all the work of your hands."
          </p>
          <p className="mt-2 font-semibold">— Deuteronomy 28:12</p>
        </div>
      </div>
    </div>
  )
}

