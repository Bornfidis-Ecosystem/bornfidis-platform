import ChefApplicationForm from './ChefApplicationForm'

export default function ChefApplyPage() {
  return (
    <div className="min-h-screen bg-white w-full overflow-x-hidden">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white py-8 md:py-12 w-full">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-4xl font-bold mb-4">Join the Bornfidis Chef Network</h1>
            <div className="h-1 w-32 bg-[#FFBC00] mb-4"></div>
            <p className="text-green-100 text-base md:text-lg">
              Partner with us to bring faith-anchored, regenerative cuisine to communities across the region.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl w-full">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1a5f3f] mb-4">Chef Application</h2>
            <p className="text-gray-600 mb-4">
              We're looking for passionate chefs who share our values of faith, community, and regenerative practices.
            </p>
            <div className="bg-green-50 border-l-4 border-[#1a5f3f] p-4 mb-6">
              <h3 className="font-semibold text-[#1a5f3f] mb-2">What to Expect:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                <li>70% payout on all bookings you complete</li>
                <li>Flexible scheduling - set your own availability</li>
                <li>Support from our team for bookings and logistics</li>
                <li>Access to our network of clients and events</li>
                <li>Stripe Connect for seamless payment processing</li>
              </ul>
            </div>
          </div>

            <ChefApplicationForm />
          </div>

          {/* Footer Note */}
          <div className="mt-6 md:mt-8 text-center text-gray-500 text-sm px-4">
            <p className="italic">
              "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters."
            </p>
            <p className="mt-2 font-semibold">— Colossians 3:23</p>
          </div>
        </div>
      </main>
    </div>
  )
}
