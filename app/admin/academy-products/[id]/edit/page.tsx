import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { AcademyProductEditForm } from '@/components/admin/AcademyProductEditForm'

export const dynamic = 'force-dynamic'

export default async function AdminAcademyProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await db.academyProduct.findUnique({
    where: { id },
  })

  if (!product) notFound()

  const row = {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    type: product.type,
    priceCents: product.priceCents,
    stripePriceId: product.stripePriceId,
    active: product.active,
    featured: (product as { featured?: boolean }).featured ?? false,
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="border-b border-stone-200 bg-white/95 backdrop-blur-sm px-4 py-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <Link
              href="/admin"
              className="text-[#1A3C34] font-semibold tracking-[0.2em] uppercase text-sm"
            >
              Bornfidis
            </Link>
            <span className="text-stone-300 font-light">/</span>
            <Link
              href="/admin/academy-products"
              className="text-stone-600 font-medium hover:underline"
            >
              Academy products
            </Link>
            <span className="text-stone-300 font-light">/</span>
            <span className="text-stone-700">Edit</span>
          </div>
          <Link
            href="/admin/academy-products"
            className="text-sm font-medium text-[#1A3C34] hover:underline"
          >
            ← Back to list
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-stone-900 mb-2">Edit product</h1>
        <p className="text-sm text-stone-500 mb-6 font-mono">{product.slug}</p>
        <AcademyProductEditForm product={row} />
      </div>
    </div>
  )
}
