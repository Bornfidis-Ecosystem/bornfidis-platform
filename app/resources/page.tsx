import Link from 'next/link'
import { colors } from '@/lib/design-tokens'

export const dynamic = 'force-dynamic'

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="text-white px-6 py-10 text-center bg-forestDark"
        style={{ backgroundColor: colors.forestDark }}
      >
        <h1 className="text-2xl font-bold">Resources</h1>
        <div
          className="mt-3 h-0.5 w-16 mx-auto rounded-full bg-gold"
          style={{ backgroundColor: colors.gold }}
        />
        <p className="text-lg mt-4 max-w-md mx-auto leading-relaxed">
          Tools, templates, and short lessons to help farmers, chefs, and
          community builders move faster.
        </p>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-5">
        <Link
          href="/resources/templates"
          className="block rounded-2xl bg-white p-5 shadow-sm border border-gray-100 hover:border-gray-200 transition"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Templates
          </h2>
          <p className="text-sm text-gray-600">
            Ready-to-use documents
          </p>
        </Link>

        <Link
          href="/resources/lessons"
          className="block rounded-2xl bg-white p-5 shadow-sm border border-gray-100 hover:border-gray-200 transition"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Mini Lessons
          </h2>
          <p className="text-sm text-gray-600">
            Short voice/video guidance
          </p>
        </Link>

        <Link
          href="/resources/services"
          className="block rounded-2xl bg-white p-5 shadow-sm border border-gray-100 hover:border-gray-200 transition"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Services
          </h2>
          <p className="text-sm text-gray-600">
            Paperwork & setup help
          </p>
        </Link>

        <p className="text-center text-sm text-gray-500 pt-2">
          Built from real field experience in Jamaica & beyond.
        </p>

        <div className="text-center pt-4">
          <Link
            href="/resources/templates"
            className="inline-block rounded-lg px-6 py-3 text-white font-semibold hover:opacity-95 transition"
            style={{ backgroundColor: FOREST }}
          >
            Explore Resources
          </Link>
        </div>

        <p className="text-center pt-4">
          <Link href="/" className="text-sm text-gray-600 hover:underline">
            Back to Home
          </Link>
        </p>
      </main>
    </div>
  )
}

