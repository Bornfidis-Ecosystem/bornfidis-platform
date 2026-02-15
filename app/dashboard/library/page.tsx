import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentSupabaseUser } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { SuccessAlert } from '@/components/ui/SuccessAlert'
import { db } from '@/lib/db'
import {
  getAcademyProductBySlug,
  ACADEMY_UPSELL_SUGGESTION,
} from '@/lib/academy-products'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LibraryPage({ searchParams }: PageProps) {
  const user = await getCurrentSupabaseUser()
  if (!user) {
    redirect(`/admin/login?next=${encodeURIComponent('/dashboard/library')}`)
  }

  const sp = await searchParams
  const claimed = sp?.claimed === '1' || sp?.claimed === 'true'

  const purchases = await db.academyPurchase.findMany({
    where: { authUserId: user.id },
    orderBy: { purchasedAt: 'desc' },
  })

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      {claimed && (
        <SuccessAlert
          title="Access ready"
          message="Request received. Your access is below."
          className="mb-6"
        />
      )}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-forest mb-4">My Library</h1>
        <p className="text-gray-600">
          Your purchased Academy products. Download or open course links below.
        </p>
      </header>

      {purchases.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-card p-6 text-center">
          <p className="text-gray-600 mb-4">You haven’t purchased any Academy products yet.</p>
          <Button href="/academy" variant="primary">
            Browse Academy
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {purchases.map((p) => {
            const product = getAcademyProductBySlug(p.productSlug)
            const isCourse = product?.type === 'COURSE'
            const href = isCourse
              ? `/academy/course/${product!.slug}`
              : (product?.downloadUrl ?? product?.courseUrl ?? '#')
            const label = isCourse ? 'Open course' : 'Download'
            const priceDisplay =
              p.productPrice === 0 ? 'FREE' : `$${(p.productPrice / 100).toFixed(2)}`
            return (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <h2 className="font-bold text-forest">{p.productTitle}</h2>
                  <p className="text-sm text-gray-500">
                    Purchased {new Date(p.purchasedAt).toLocaleDateString()}
                    {priceDisplay !== 'FREE' && ` · ${priceDisplay}`}
                  </p>
                </div>
                <div className="flex gap-3">
                  {href !== '#' && (
                    <Link
                      href={href}
                      className="inline-block bg-forest text-goldAccent font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition text-sm"
                    >
                      {label} →
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {/* Soft upsell when user has exactly 1 purchase: map or free → paid entry */}
      {purchases.length === 1 && (() => {
        const firstSlug = purchases[0].productSlug
        const wasFree = purchases[0].productPrice === 0
        const suggestedSlug =
          ACADEMY_UPSELL_SUGGESTION[firstSlug] ?? (wasFree ? 'llc-starter-kit' : undefined)
        const suggested = suggestedSlug ? getAcademyProductBySlug(suggestedSlug) : null
        if (!suggested) return null
        return (
          <div className="mt-8 rounded-2xl border-2 border-goldAccent bg-card p-6">
            <h2 className="text-lg font-bold text-forest mb-2">
              Complete Your Foundation — Add {suggested.title}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {suggested.description}
            </p>
            <Link
              href={`/academy/${suggested.slug}`}
              className="inline-block bg-forest text-goldAccent font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition"
            >
              View {suggested.title} ({suggested.priceDisplay}) →
            </Link>
          </div>
        )
      })()}

      <p className="mt-8 text-center text-sm text-gray-500">
        <Link href="/academy" className="text-forest hover:underline">
          Back to Academy
        </Link>
      </p>
    </main>
  )
}

