import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentSupabaseUser } from '@/lib/auth'
import { getAcademyProductBySlug } from '@/lib/academy-products'
import { db } from '@/lib/db'
import { CoursePlayerClient } from './CoursePlayerClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * Protected course page. Only users with a purchase record for this product can access.
 * Renders video embed placeholder and client-only "Mark as Complete" toggle.
 */
export default async function AcademyCoursePage({ params }: PageProps) {
  const { slug } = await params
  const product = getAcademyProductBySlug(slug)
  if (!product || product.type !== 'COURSE') notFound()

  const user = await getCurrentSupabaseUser()
  if (!user) {
    redirect(
      `/admin/login?next=${encodeURIComponent(`/academy/course/${slug}`)}`
    )
  }

  const purchase = await db.academyPurchase.findFirst({
    where: { authUserId: user.id, productSlug: slug },
  })
  if (!purchase) {
    redirect('/dashboard/library')
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/dashboard/library"
        className="text-sm text-forest hover:underline mb-6 inline-block transition-all duration-200 ease-in-out"
      >
        ← Back to Library
      </Link>

      <h1 className="text-2xl font-bold text-forest mb-2">{product.title}</h1>
      <p className="text-gray-600 mb-6">{product.description}</p>

      {/* Video embed placeholder — replace with real embed (e.g. Vimeo) when courseUrl is set */}
      <div className="aspect-video rounded-xl border border-gray-200 bg-card flex items-center justify-center text-gray-500">
        <div className="text-center p-6">
          <p className="font-medium text-forest mb-1">Course video</p>
          <p className="text-sm">
            Video embed will appear here. Use product.courseUrl or a future CMS
            for the source.
          </p>
        </div>
      </div>

      <CoursePlayerClient />
    </main>
  )
}
