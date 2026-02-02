import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-800 to-green-900 text-white py-6 shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">⚓</div>
            <div>
              <h1 className="text-3xl font-bold">Bornfidis Provisions</h1>
              <p className="text-green-100">Agriculture + Food Logistics Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
          Welcome to Bornfidis Platform
        </h2>
        <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto">
          Connecting Portland farmers with premium markets through technology and trust.
        </p>

        {/* Quick Links Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          
          {/* Farmer Registration */}
          <Link 
            href="/farmer-intake"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition border-2 border-green-200 hover:border-green-500 group"
          >
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Farmer Registration
            </h3>
            <p className="text-gray-600 mb-4">
              Become a supplier for quality ground provisions and vegetables
            </p>
            <span className="text-green-700 font-bold group-hover:underline">
              Register Now →
            </span>
          </Link>

          {/* Villa Chef Booking */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
            <div className="text-5xl mb-4">👨‍🍳</div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Villa Chef Service
            </h3>
            <p className="text-gray-600 mb-4">
              Book a Royal Caribbean trained chef for your villa
            </p>
            <span className="text-gray-400 font-bold">
              Coming Soon
            </span>
          </div>

          {/* Booking Dashboard */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Booking Dashboard
            </h3>
            <p className="text-gray-600 mb-4">
              Manage bookings, quotes, and customer relationships
            </p>
            <span className="text-gray-400 font-bold">
              Coming Soon
            </span>
          </div>

        </div>

        {/* Business Info */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 max-w-2xl mx-auto">
          <h4 className="text-xl font-bold text-yellow-900 mb-2">
            📞 Contact Us
          </h4>
          <p className="text-gray-700">
            <strong>Chef Brian Maylor</strong><br />
            Phone/WhatsApp: <span className="font-bold text-green-800">876-448-8446</span><br />
            Location: Lighthouse Road, Port Antonio, Portland
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-green-100 mb-2">
            <strong>Bornfidis Provisions</strong> • Registration #9007/2025
          </p>
          <p className="text-green-300 text-sm">
            Agriculture + Food Logistics • Portland Parish, Jamaica
          </p>
          <p className="text-green-400 text-xs mt-4">
            &quot;Real Jamaican Flavors, International Standards&quot;
          </p>
        </div>
      </footer>
    </div>
  );
}
