'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateAcademyProduct } from '@/app/admin/academy-products/actions'
import { CulinaryCard } from '@/components/culinary-os'

const TYPES = ['COURSE', 'DOWNLOAD', 'BUNDLE']

interface ProductRow {
  id: string
  slug: string
  title: string
  description: string
  type: string
  priceCents: number
  stripePriceId: string | null
  active: boolean
  featured: boolean
}

export function AcademyProductEditForm({ product }: { product: ProductRow }) {
  const router = useRouter()
  const [title, setTitle] = useState(product.title)
  const [description, setDescription] = useState(product.description)
  const [type, setType] = useState(product.type)
  const [priceCents, setPriceCents] = useState(String(product.priceCents))
  const [stripePriceId, setStripePriceId] = useState(product.stripePriceId ?? '')
  const [active, setActive] = useState(product.active)
  const [featured, setFeatured] = useState(product.featured)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await updateAcademyProduct(product.id, {
        title: title.trim(),
        description: description.trim(),
        type: type.trim(),
        priceCents: parseInt(priceCents, 10) ?? 0,
        stripePriceId: stripePriceId.trim() || null,
        active,
        featured,
      })
      if (result.success) {
        router.refresh()
        router.push('/admin/academy-products')
      } else {
        setError(result.error ?? 'Update failed')
      }
    })
  }

  return (
    <CulinaryCard
      as="form"
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>
      )}
      <div>
        <label htmlFor="edit-title" className="block text-xs font-medium text-stone-500 mb-1">
          Title *
        </label>
        <input
          id="edit-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border border-stone-300 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
          required
        />
      </div>
      <div>
        <label htmlFor="edit-desc" className="block text-xs font-medium text-stone-500 mb-1">
          Description
        </label>
        <textarea
          id="edit-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded border border-stone-300 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="edit-type" className="block text-xs font-medium text-stone-500 mb-1">
            Type
          </label>
          <select
            id="edit-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded border border-stone-300 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="edit-price" className="block text-xs font-medium text-stone-500 mb-1">
            Price (cents)
          </label>
          <input
            id="edit-price"
            type="number"
            min={0}
            value={priceCents}
            onChange={(e) => setPriceCents(e.target.value)}
            className="w-full rounded border border-stone-300 px-3 py-2 text-sm tabular-nums focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>
      </div>
      <div>
        <label htmlFor="edit-stripe" className="block text-xs font-medium text-stone-500 mb-1">
          Stripe Price ID
        </label>
        <input
          id="edit-stripe"
          type="text"
          value={stripePriceId}
          onChange={(e) => setStripePriceId(e.target.value)}
          className="w-full rounded border border-stone-300 px-3 py-2 text-sm font-mono focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
        />
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="rounded border-stone-300 text-navy focus:ring-navy"
          />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="rounded border-stone-300 text-navy focus:ring-navy"
          />
          Featured
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:opacity-90 disabled:opacity-60"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
        <Link
          href="/admin/academy-products"
          className="px-4 py-2 rounded-none border border-culinary-outline text-stone-700 text-sm font-medium hover:bg-culinary-surface-low shadow-none"
        >
          Cancel
        </Link>
      </div>
    </CulinaryCard>
  )
}
