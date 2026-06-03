'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { academyBtnPrimary } from '@/components/academy/academy-culinary-classes'
import { Spinner } from '@/components/ui/Spinner'
import { trackAcademyBuyClick } from '@/lib/academy-analytics'
import type { AcademyProduct } from '@/lib/academy-products'

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
    trackAcademyBuyClick(product.slug, product.title, product.priceDisplay)
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
        if (res.status === 401) {
          const next = encodeURIComponent(window.location.pathname)
          window.location.href = `/admin/login?next=${next}`
          return
        }
        const msg = data.error ?? 'Checkout failed'
        setError(msg)
        toast.error('Failed to start checkout. Please try again.')
        return
      }
      if (data.url) {
        window.location.href = data.url
        return
      }
      setError('No checkout URL returned')
      toast.error('Failed to start checkout. Please try again.')
    } catch {
      setError('Unable to start checkout')
      toast.error('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const sizeClass =
    size === 'sm' ? 'min-h-[40px] px-4 py-2 text-[11px]' : size === 'lg' ? 'min-h-[52px] px-10' : ''

  const buttonLabel = loading
    ? 'Processing…'
    : isFree
      ? 'Get for free'
      : product.type === 'COURSE'
        ? `Start learning — ${product.priceDisplay}`
        : `Get access — ${product.priceDisplay}`

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleBuy}
        disabled={loading}
        className={`${academyBtnPrimary} inline-flex items-center gap-2 ${sizeClass}`}
      >
        {loading ? <Spinner size="sm" className="flex-shrink-0" /> : null}
        {buttonLabel}
      </button>
      {error ? (
        <p className="mt-2 font-sans text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
