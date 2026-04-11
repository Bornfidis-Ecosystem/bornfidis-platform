import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getCurrentSupabaseUser } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { SuccessAlert } from '@/components/ui/SuccessAlert'
import { db } from '@/lib/db'
import { getAcademyProductBySlugPublic } from '@/lib/academy-products-public'
import { ACADEMY_UPSELL_SUGGESTION } from '@/lib/academy-products'
import { isBundleSlug, getIncludedSlugs } from '@/lib/academy-bundles'
import { TrackedDownloadLink } from '@/components/academy/TrackedDownloadLink'

export const dynamic = 'force-dynamic'

const LIBRARY_LOAD_ERROR = 'LIBRARY_LOAD_ERROR'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function LibraryErrorUI({ message }: { message: string }) {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h1>
        <p className="text-red-700 mb-6">{message}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button href="/admin/login?next=%2Fdashboard%2Flibrary" variant="primary">
            Log in again
          </Button>
          <Link
            href="/academy"
            className="inline-flex items-center justify-center font-semibold rounded-xl px-6 py-2.5 border-2 border-forest text-forest hover:bg-forest/10 transition"
          >
            Back to Academy
          </Link>
        </div>
      </div>
    </main>
  )
}

export default async function LibraryPage({ searchParams }: PageProps) {
  try {
    let user: Awaited<ReturnType<typeof getCurrentSupabaseUser>>
    try {
      user = await getCurrentSupabaseUser()
    } catch (err) {
      console.error(LIBRARY_LOAD_ERROR, err)
      return <LibraryErrorUI message="We couldn’t verify your session. Please log in again." />
    }

    if (!user) {
      redirect(`/admin/login?next=${encodeURIComponent('/dashboard/library')}`)
    }

    let sp: { [key: string]: string | string[] | undefined }
    try {
      sp = await searchParams
    } catch (err) {
      console.error(LIBRARY_LOAD_ERROR, err)
      return <LibraryErrorUI message="We couldn’t load this page. Please try again." />
    }

    const claimed = sp?.claimed === '1' || sp?.claimed === 'true'

    let purchases: Awaited<ReturnType<typeof db.academyPurchase.findMany>>
    try {
      purchases = await db.academyPurchase.findMany({
        where: { authUserId: user.id },
        orderBy: { purchasedAt: 'desc' },
      })
    } catch (err) {
      console.error(LIBRARY_LOAD_ERROR, err)
      return (
        <LibraryErrorUI message="We couldn’t load your library. Please try again or log in again." />
      )
    }

    const slugsToResolve = new Set<string>()
    for (const p of purchases) {
      slugsToResolve.add(p.productSlug)
      if (isBundleSlug(p.productSlug)) {
        for (const s of getIncludedSlugs(p.productSlug)) slugsToResolve.add(s)
      }
    }
    const productBySlug: Record<string, Awaited<ReturnType<typeof getAcademyProductBySlugPublic>> | null> = {}
    await Promise.all(
      [...slugsToResolve].map(async (slug) => {
        productBySlug[slug] = await getAcademyProductBySlugPublic(slug)
      })
    )

    const firstPurchase = purchases[0]
    const wasFree = firstPurchase?.productPrice === 0
    const suggestedSlug =
      purchases.length === 1
        ? ACADEMY_UPSELL_SUGGESTION[firstPurchase.productSlug] ?? (wasFree ? 'llc-starter-kit' : undefined)
        : undefined
    const suggestedProduct = suggestedSlug ? await getAcademyProductBySlugPublic(suggestedSlug) : null

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
          Your purchased Academy products. Download your PDFs or open course links below.
        </p>
      </header>

      {purchases.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-card p-10 text-center">
          <p className="text-gray-600 mb-6">No purchases yet. Your purchased manuals and courses will appear here after you buy.</p>
          <Button href="/academy" variant="primary">
            Browse Academy
          </Button>
        </div>
      ) : (
        <ul className="space-y-6">
          {purchases.map((p) => {
            const isBundle = isBundleSlug(p.productSlug)
            const includedSlugs = isBundle ? getIncludedSlugs(p.productSlug) : []
            const product = productBySlug[p.productSlug] ?? null
            const priceDisplay =
              p.productPrice === 0 ? 'FREE' : `$${(p.productPrice / 100).toFixed(2)}`

            if (isBundle && includedSlugs.length > 0) {
              return (
                <li
                  key={p.id}
                  className="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm"
                >
                  <div className="p-4 border-b border-gray-100">
                    <h2 className="font-bold text-forest">{p.productTitle}</h2>
                    <p className="text-sm text-gray-500">
                      Purchased {new Date(p.purchasedAt).toLocaleDateString()}
                      {priceDisplay !== 'FREE' && ` · ${priceDisplay}`}
                      {' · '}
                      <span className="text-forest/80">Bundle ({includedSlugs.length} manuals)</span>
                    </p>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {includedSlugs.map((slug) => {
                      const includedProduct = productBySlug[slug] ?? null
                      const isCourse = includedProduct?.type === 'COURSE'
                      const href = isCourse && includedProduct
                        ? `/academy/course/${includedProduct.slug}`
                        : `/api/academy/download/${slug}`
                      const label = isCourse && includedProduct ? 'Open course' : 'Download'
                      const title = includedProduct?.title ?? slug
                      return (
                        <li key={slug} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                          <span className="font-medium text-forest">{title}</span>
                          {isCourse && includedProduct ? (
                            <Link
                              href={href}
                              className="text-sm font-semibold text-forest hover:underline"
                            >
                              {label} →
                            </Link>
                          ) : (
                            <TrackedDownloadLink
                              href={href}
                              productSlug={slug}
                              productTitle={title}
                              source="library"
                              className="text-sm font-semibold text-forest hover:underline"
                            >
                              {label} →
                            </TrackedDownloadLink>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </li>
              )
            }

            const isCourse = product?.type === 'COURSE'
            const href = isCourse && product
              ? `/academy/course/${product.slug}`
              : `/api/academy/download/${p.productSlug}`
            const label = isCourse && product ? 'Open course' : 'Download guide'
            const fileAvailable = !isCourse || !!product
            return (
              <li
                key={p.id}
                className="flex flex-col sm:flex-row gap-4 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm"
              >
                {product?.image && (
                  <div className="sm:w-40 flex-shrink-0 relative aspect-video sm:aspect-square bg-card">
                    <Image
                      src={product.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>
                )}
                <div className="flex-1 p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-forest">{p.productTitle}</h2>
                    <p className="text-sm text-gray-500">
                      Purchased {new Date(p.purchasedAt).toLocaleDateString()}
                      {priceDisplay !== 'FREE' && ` · ${priceDisplay}`}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    {!fileAvailable ? (
                      <span className="text-sm text-gray-500" title="Download not available for this product. Contact support if you need help.">
                        Download not available
                      </span>
                    ) : isCourse ? (
                      <Link
                        href={href}
                        className="inline-block bg-forest text-goldAccent font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition text-sm"
                      >
                        {label} →
                      </Link>
                    ) : (
                      <TrackedDownloadLink
                        href={href}
                        productSlug={p.productSlug}
                        productTitle={p.productTitle}
                        source="library"
                        className="inline-block bg-forest text-goldAccent font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition text-sm"
                      >
                        {label} →
                      </TrackedDownloadLink>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {/* Soft upsell when user has exactly 1 purchase: map or free → paid entry */}
      {purchases.length === 1 && suggestedProduct && (
        <div className="mt-8 rounded-2xl border-2 border-goldAccent bg-card p-6">
          <h2 className="text-lg font-bold text-forest mb-2">
            Complete Your Foundation — Add {suggestedProduct.title}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {suggestedProduct.description}
          </p>
          <Link
            href={`/academy/${suggestedProduct.slug}`}
            className="inline-block bg-forest text-goldAccent font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition"
          >
            View {suggestedProduct.title} ({suggestedProduct.priceDisplay}) →
          </Link>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-gray-500">
        <Link href="/academy" className="text-forest hover:underline">
          Back to Academy
        </Link>
      </p>
    </main>
    )
  } catch (err) {
    console.error(LIBRARY_LOAD_ERROR, err)
    return <LibraryErrorUI message="Something went wrong loading your library. Please try again or log in." />
  }
}

