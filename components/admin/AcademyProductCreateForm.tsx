'use client'

import { useState } from 'react'
import { useTransition } from 'react'
import { createAcademyProduct } from '@/app/admin/academy-products/actions'

const TYPES = ['COURSE', 'DOWNLOAD', 'BUNDLE']

export function AcademyProductCreateForm() {
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('COURSE')
  const [priceCents, setPriceCents] = useState('0')
  const [stripePriceId, setStripePriceId] = useState('')
  const [active, setActive] = useState(true)
  const [featured, setFeatured] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await createAcademyProduct({
        slug: slug.trim() || title.trim().toLowerCase().replace(/\s+/g, '-'),
        title: title.trim(),
        description: description.trim(),
        type,
        priceCents: parseInt(priceCents, 10) || 0,
        stripePriceId: stripePriceId.trim() || undefined,
        active,
        featured,
      })
      if (result.success) {
        setSuccess(true)
        setSlug('')
        setTitle('')
        setDescription('')
        setPriceCents('0')
        setStripePriceId('')
        window.location.reload()
      } else {
        setError(result.error ?? 'Create failed')
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-stone-200/80 rounded-xl p-5 space-y-4 max-w-2xl"
    >
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
          Product created.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="create-title" className="block text-xs font-medium text-stone-500 mb-1">
            Title *
          </label>
          <input
            id="create-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-stone-300 px-3 py-2 text-sm focus:border-[#1A3C34] focus:outline-none focus:ring-1 focus:ring-[#1A3C34]"
            required
          />
        </div>
        <div>
          <label htmlFor="create-slug" className="block text-xs font-medium text-stone-500 mb-1">
            Slug (URL-safe, unique)
          </label>
          <input
            id="create-slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. my-course"
            className="w-full rounded border border-stone-300 px-3 py-2 text-sm font-mono focus:border-[#1A3C34] focus:outline-none focus:ring-1 focus:ring-[#1A3C34]"
          />
        </div>
      </div>
      <div>
        <label htmlFor="create-desc" className="block text-xs font-medium text-stone-500 mb-1">
          Description
        </label>
        <textarea
          id="create-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded border border-stone-300 px-3 py-2 text-sm focus:border-[#1A3C34] focus:outline-none focus:ring-1 focus:ring-[#1A3C34]"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="create-type" className="block text-xs font-medium text-stone-500 mb-1">
            Type
          </label>
          <select
            id="create-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded border border-stone-300 px-3 py-2 text-sm focus:border-[#1A3C34] focus:outline-none focus:ring-1 focus:ring-[#1A3C34]"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="create-price" className="block text-xs font-medium text-stone-500 mb-1">
            Price (cents)
          </label>
          <input
            id="create-price"
            type="number"
            min={0}
            value={priceCents}
            onChange={(e) => setPriceCents(e.target.value)}
            className="w-full rounded border border-stone-300 px-3 py-2 text-sm tabular-nums focus:border-[#1A3C34] focus:outline-none focus:ring-1 focus:ring-[#1A3C34]"
          />
        </div>
      </div>
      <div>
        <label htmlFor="create-stripe" className="block text-xs font-medium text-stone-500 mb-1">
          Stripe Price ID (optional)
        </label>
        <input
          id="create-stripe"
          type="text"
          value={stripePriceId}
          onChange={(e) => setStripePriceId(e.target.value)}
          placeholder="price_xxx"
          className="w-full rounded border border-stone-300 px-3 py-2 text-sm font-mono focus:border-[#1A3C34] focus:outline-none focus:ring-1 focus:ring-[#1A3C34]"
        />
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="rounded border-stone-300 text-[#1A3C34] focus:ring-[#1A3C34]"
          />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="rounded border-stone-300 text-[#1A3C34] focus:ring-[#1A3C34]"
          />
          Featured
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 rounded-lg bg-[#1A3C34] text-white text-sm font-medium hover:opacity-90 disabled:opacity-60"
      >
        {pending ? 'Creating…' : 'Create product'}
      </button>
    </form>
  )
}
