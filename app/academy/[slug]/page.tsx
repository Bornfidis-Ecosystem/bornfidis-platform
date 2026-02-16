import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getAcademyProductBySlug } from '@/lib/academy-products'
import AcademyBuyButton from '@/components/academy/AcademyBuyButton'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function AcademyProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = getAcademyProductBySlug(slug)
  if (!product) notFound()

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/academy"
        className="text-sm text-forest hover:underline mb-6 inline-block"
      >
        ← Back to Academy
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="aspect-video bg-card relative">
          {product.image ? (
            <Image
              src={product.image}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-forest text-6xl font-bold opacity-30">
              {product.title.charAt(0)}
            </div>
          )}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-forest text-goldAccent">
              {product.category}
            </span>
            {product.type !== 'DOWNLOAD' && (
              <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-goldAccent/20 text-forest border border-forest/20">
                {product.type === 'COURSE' ? 'Course' : 'Bundle'}
              </span>
            )}
          </div>
        </div>

        <div className="p-8">
          <h1 className="text-2xl font-bold text-forest mb-2">{product.title}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xl font-semibold text-forest">
              {product.priceDisplay}
            </span>
            <AcademyBuyButton product={product} size="lg" />
          </div>
          <p className="mt-4 text-sm text-gray-500">
            One-time purchase. No subscription. Access in your library after purchase.
          </p>
        </div>
      </div>
    </main>
  )
}

