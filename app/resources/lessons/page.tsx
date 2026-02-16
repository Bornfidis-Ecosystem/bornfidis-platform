import Link from 'next/link'
import { LESSONS } from '@/lib/resources-data'

export const dynamic = 'force-dynamic'

import { colors } from '@/lib/design-tokens'

export default function LessonsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="text-white px-6 py-8 text-center bg-forestDark"
        style={{ backgroundColor: colors.forestDark }}
      >
        <h1 className="text-2xl font-bold">Mini Lessons</h1>
        <p className="text-sm mt-2 opacity-90">
          5–10 minute audio or video · Clear outcome · Minimal reading
        </p>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {LESSONS.map((l) => (
          <Link
            key={l.slug}
            href={`/resources/lessons/${l.slug}`}
            className="block rounded-2xl bg-white p-5 shadow-sm border border-gray-100 hover:border-gray-200 transition"
          >
            <h2 className="text-lg font-semibold text-gray-900">{l.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{l.outcome}</p>
            <p className="text-xs text-gray-500 mt-2">
              {l.duration} · ${l.price}
            </p>
          </Link>
        ))}

        <p className="text-center pt-4">
          <Link href="/resources" className="text-sm text-gray-600 hover:underline">
            ← Back to Resources
          </Link>
        </p>
      </main>
    </div>
  )
}

