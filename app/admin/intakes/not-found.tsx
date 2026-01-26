import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">404 - Page Not Found</h2>
        <p className="text-gray-600 mb-4">The intakes page could not be found.</p>
        <Link
          href="/admin/farmers"
          className="px-4 py-2 bg-[#1a5f3f] text-white rounded-lg hover:bg-[#154a32] transition inline-block"
        >
          Back to Farmers
        </Link>
      </div>
    </div>
  )
}
