import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LESSONS } from '@/lib/resources-data'

export const dynamic = 'force-dynamic'

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const lesson = LESSONS.find((l) => l.slug === slug)
  if (!lesson) notFound()

  const previewNote = lesson.previewSeconds
    ? `Free preview: first ${lesson.previewSeconds} seconds`
    : 'Free preview available'

  return (
    <div className="min-h-screen bg-bone">
      <header className="text-white px-6 py-6 bg-navy">
        <Link
          href="/resources/lessons"
          className="text-sm opacity-90 hover:underline"
        >
          ← Mini Lessons
        </Link>
        <h1 className="text-xl font-bold mt-2">{lesson.title}</h1>
        <p className="text-xs mt-1 opacity-90">{lesson.duration}</p>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6">
        <div className="rounded-none bg-white p-5 shadow-sm border border-gray-100 mb-6">
          <p className="text-sm font-medium text-charcoal">You’ll learn:</p>
          <p className="text-charcoal mt-1">{lesson.outcome}</p>
          <p className="text-xs text-gray-500 mt-3">{previewNote}</p>
          <p className="text-lg font-semibold mt-4 text-charcoal">
            Full lesson: ${lesson.price}
          </p>
        </div>

        <div className="space-y-3">
          <a
            href={`mailto:hello@bornfidis.com?subject=Purchase lesson: ${encodeURIComponent(lesson.title)}`}
            className="block w-full text-center rounded-none py-3 text-white font-semibold hover:opacity-95 transition bg-navy"
          >
            Get full lesson (${lesson.price})
          </a>
          <p className="text-center text-xs text-gray-500">
            We’ll send access after payment. No account required.
          </p>
        </div>

        <p className="text-center pt-6">
          <Link href="/resources" className="text-sm text-gray-600 hover:underline">
            Back to Resources
          </Link>
        </p>
      </main>
    </div>
  )
}
