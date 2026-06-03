'use client'

import Link from 'next/link'
import { ReactNode, useState } from 'react'

type RoleTag =
  | 'FARMER'
  | 'CHEF'
  | 'COORDINATOR'
  | 'EDUCATOR'
  | 'PARTNER'
  | 'ALL ROLES'

interface PassiveIncomeCardProps {
  icon: ReactNode
  title: string
  description: string
  price: string
  roles: RoleTag[]
  href: string
  highlight?: boolean
  /** When set, card shows Purchase button and redirects to Stripe Checkout */
  priceId?: string
}

export default function PassiveIncomeCard({
  icon,
  title,
  description,
  price,
  roles,
  href,
  highlight = false,
  priceId,
}: PassiveIncomeCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    if (!priceId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
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

  const ctaClass =
    'inline-block w-full text-center bg-forest text-goldAccent font-semibold py-2 rounded-xl hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed'

  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm transition hover:shadow-lg ${
        highlight
          ? 'border-goldAccent bg-white'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* Role Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {roles.map((role) => (
          <span
            key={role}
            className="text-xs font-semibold px-3 py-1 rounded-full bg-forest text-goldAccent"
          >
            {role}
          </span>
        ))}
      </div>

      {/* Icon */}
      <div className="text-goldAccent text-3xl mb-4">{icon}</div>

      {/* Title */}
      <h3 className="text-lg font-bold text-forest mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-4">{description}</p>

      {/* Price */}
      <div className="text-base font-semibold text-forest mb-4">
        {price}
      </div>

      {/* CTA */}
      {priceId ? (
        <>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className={ctaClass}
          >
            {loading ? 'Redirecting…' : 'Purchase'}
          </button>
          {error && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </>
      ) : (
        <Link href={href} className={ctaClass}>
          Learn More →
        </Link>
      )}
    </div>
  )
}
