'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import type { ProvisionsProduct } from '@/lib/provisions-products'

interface ProvisionsProductGridProps {
  products: ProvisionsProduct[]
}

export function ProvisionsProductGrid({ products }: ProvisionsProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProvisionsProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProvisionsProductCard({ product }: { product: ProvisionsProduct }) {
  const [loading, setLoading] = useState(false)

  const handleNotify = () => {
    setLoading(true)
    toast.success("We'll notify you when this product is available.")
    setLoading(false)
  }

  const statusClass =
    product.status === 'Small Batch'
      ? 'bg-gold/20 text-forest border border-gold/40'
      : 'bg-gray-100 text-gray-700'

  return (
    <article className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="aspect-[4/3] bg-navyLight/10 flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl text-forest/30 font-bold" aria-hidden>
            {product.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="p-6">
        <span
          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${statusClass}`}
        >
          {product.status}
        </span>
        <h3 className="text-xl font-bold text-navy mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {product.description}
        </p>
        <button
          type="button"
          onClick={handleNotify}
          disabled={loading}
          className="w-full inline-flex justify-center items-center bg-forest text-goldAccent font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-60"
        >
          {loading ? 'Sending…' : 'Notify Me'}
        </button>
      </div>
    </article>
  )
}
