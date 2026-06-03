'use client'

import { useState } from 'react'
import Image from 'next/image'
import { sportswearProducts } from '@/lib/sportswear-products'
import toast from 'react-hot-toast'

export function SportswearGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {sportswearProducts.map((product) => (
        <SportswearCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function SportswearCard({
  product,
}: {
  product: (typeof sportswearProducts)[number]
}) {
  const [imageError, setImageError] = useState(false)

  return (
    <article className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="aspect-square bg-card relative">
        {!imageError ? (
          <Image
            src={product.mockupImage}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-navyLight/10 p-4">
            <span className="text-4xl text-navy/60" aria-hidden>◆</span>
            <span className="text-sm font-medium text-navy text-center line-clamp-2">
              {product.title}
            </span>
          </div>
        )}
        <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-navy text-gold">
          Coming Soon
        </span>
      </div>
      <div className="p-5">
        <h2 className="text-lg font-bold text-navy mb-1">{product.title}</h2>
        <p className="text-navy font-semibold mb-2">${product.price}</p>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        <button
          type="button"
          onClick={() => toast.success("We'll notify you when Sportswear is available.")}
          className="w-full inline-flex justify-center items-center bg-gold text-navy font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition"
        >
          Notify Me
        </button>
      </div>
    </article>
  )
}
