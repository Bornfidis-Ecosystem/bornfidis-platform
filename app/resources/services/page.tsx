import Link from 'next/link'
import { SERVICES_INTRO, SERVICE_ITEMS } from '@/lib/resources-data'

export const dynamic = 'force-dynamic'

import { colors } from '@/lib/design-tokens'

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="text-white px-6 py-8 text-center bg-forestDark"
        style={{ backgroundColor: colors.forestDark }}
      >
        <h1 className="text-2xl font-bold">Services</h1>
        <p className="text-sm mt-2 opacity-90">
          Paperwork & setup help
        </p>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        <p className="text-gray-700">{SERVICES_INTRO}</p>

        <div className="space-y-4">
          {SERVICE_ITEMS.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100"
            >
              <h2 className="text-lg font-semibold text-gray-900">{s.title}</h2>
              <p className="text-sm text-gray-600 mt-1">Who it’s for: {s.for}</p>
            </div>
          ))}
        </div>

        <a
          href="mailto:hello@bornfidis.com?subject=Request support - Resources"
          className="block w-full text-center rounded-lg py-3 text-white font-semibold hover:opacity-95 transition"
          style={{ backgroundColor: FOREST }}
        >
          Request support
        </a>
        <p className="text-center text-xs text-gray-500">
          We’ll follow up to understand what you need. No obligation.
        </p>

        <p className="text-center pt-4">
          <Link href="/resources" className="text-sm text-gray-600 hover:underline">
            ← Back to Resources
          </Link>
        </p>
      </main>
    </div>
  )
}

