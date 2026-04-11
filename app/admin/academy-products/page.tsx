import Link from 'next/link'
import { getAcademyProducts } from './actions'
import { AcademyProductsTable } from '@/components/admin/AcademyProductsTable'
import { AcademyProductCreateForm } from '@/components/admin/AcademyProductCreateForm'

export const dynamic = 'force-dynamic'

function formatDollars(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function AdminAcademyProductsPage() {
  const result = await getAcademyProducts()

  if (!result.success) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
            <p className="font-semibold">Error loading Academy products</p>
            <p className="text-sm mt-1">{result.error}</p>
            <Link href="/admin" className="text-sm underline mt-2 inline-block">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const products = result.products ?? []

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
            <span className="text-stone-600 font-medium">Academy products</span>
          </div>
          <Link
            href="/admin/academy"
            className="text-sm font-medium text-[#1A3C34] hover:underline"
          >
            Academy analytics
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <section>
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-[0.2em] mb-4 pb-2 border-b border-stone-200">
            Create product
          </h2>
          <AcademyProductCreateForm />
        </section>

        <section>
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-[0.2em] mb-4 pb-2 border-b border-stone-200">
            All products
          </h2>
          <div className="bg-white border border-stone-200/80 rounded-xl overflow-hidden">
            {products.length === 0 ? (
              <div className="p-12 text-center text-stone-500 text-sm">
                No Academy products yet. Create one above.
              </div>
            ) : (
              <AcademyProductsTable
                products={products.map((p) => ({
                  ...p,
                  priceFormatted: formatDollars(p.priceCents),
                  createdAtFormatted: formatDate(p.createdAt),
                  updatedAtFormatted: formatDate(p.updatedAt),
                }))}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
