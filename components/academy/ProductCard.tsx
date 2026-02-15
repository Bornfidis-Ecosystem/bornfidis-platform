'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { AcademyProduct } from '@/lib/academy-products'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

interface ProductCardProps {
  product: AcademyProduct
  /** When true, show "View in Library" instead of Buy */
  purchased?: boolean
}

export default function ProductCard({ product, purchased = false }: ProductCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isFree = !product.stripePriceId || product.priceDisplay === 'FREE'

  const handleBuy = async () => {
    if (isFree) {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/academy/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.slug }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? 'Claim failed')
          return
        }
        if (data.url) {
          window.location.href = data.url
          return
        }
        setError('No redirect URL returned')
      } catch {
        setError('Unable to claim')
      } finally {
        setLoading(false)
      }
      return
    }
    if (!product.stripePriceId) {
      setError('Product not available for purchase')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/academy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.slug }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Checkout failed')
        return
      }
      if (data.url) {
        window.location.href = data.url
        return
      }
      setError('No checkout URL returned')
    } catch {
      setError('Unable to start checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card as="article" className="p-0 overflow-hidden">
      {/* Image */}
      <div className="aspect-video bg-card relative">
        {product.image ? (
          <Image
            src={product.image}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-forest text-4xl font-bold opacity-30">
            {product.title.charAt(0)}
          </div>
        )}
        <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full bg-forest text-goldAccent">
          {product.category}
        </span>
      </div>

      <div className="p-6">
        <h2 className="text-lg font-bold text-forest mb-1">{product.title}</h2>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between gap-3">
          <span className="text-base font-semibold text-forest">{product.priceDisplay}</span>
          {purchased ? (
            <Link
              href="/dashboard/library"
              className="inline-block text-center bg-forest text-goldAccent font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition text-sm"
            >
              View in Library →
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleBuy}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-forest text-goldAccent font-semibold px-4 py-2 rounded-xl hover:opacity-90 hover:-translate-y-px transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading && <Spinner size="sm" className="flex-shrink-0" />}
              {loading ? 'Redirecting…' : isFree ? 'Get for free' : 'Buy'}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </Card>
  )
}
