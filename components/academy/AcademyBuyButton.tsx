'use client'

import { useState } from 'react'
import type { AcademyProduct } from '@/lib/academy-products'
import { Spinner } from '@/components/ui/Spinner'

interface AcademyBuyButtonProps {
  product: AcademyProduct
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function AcademyBuyButton({
  product,
  className = '',
  size = 'md',
}: AcademyBuyButtonProps) {
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

  const sizeClass =
    size === 'sm'
      ? 'px-3 py-1.5 text-sm'
      : size === 'lg'
        ? 'px-8 py-3 text-lg'
        : 'px-6 py-2.5'

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleBuy}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 bg-forest text-goldAccent font-semibold rounded-xl hover:opacity-90 transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed ${sizeClass}`}
      >
        {loading && <Spinner size="sm" className="flex-shrink-0" />}
        {loading ? 'Redirecting…' : isFree ? 'Get for free' : 'Buy now'}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
