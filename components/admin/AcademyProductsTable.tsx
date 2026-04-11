'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import type { AcademyProductRow } from '@/app/admin/academy-products/actions'
import { setAcademyProductActive, setAcademyProductFeatured } from '@/app/admin/academy-products/actions'

export interface AcademyProductTableRow extends AcademyProductRow {
  priceFormatted: string
  createdAtFormatted: string
  updatedAtFormatted: string
}

export function AcademyProductsTable({
  products,
}: {
  products: AcademyProductTableRow[]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-stone-50 border-b border-stone-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
              Title / Slug
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
              Active
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
              Featured
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
              Purchases / Enrollments
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
              Updated
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="font-medium text-stone-900">{p.title}</div>
                <div className="text-xs text-stone-500 font-mono">{p.slug}</div>
              </td>
              <td className="px-4 py-3 text-stone-600">{p.type}</td>
              <td className="px-4 py-3 tabular-nums text-stone-700">{p.priceFormatted}</td>
              <td className="px-4 py-3">
                <ActiveToggle id={p.id} active={p.active} />
              </td>
              <td className="px-4 py-3">
                <FeaturedToggle id={p.id} featured={p.featured} />
              </td>
              <td className="px-4 py-3 text-stone-600 tabular-nums">
                {p.purchaseCount} / {p.enrollmentCount}
              </td>
              <td className="px-4 py-3 text-stone-500 text-xs">{p.updatedAtFormatted}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/academy-products/${p.id}/edit`}
                  className="text-[#1A3C34] font-medium hover:underline text-xs"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(() => setAcademyProductActive(id, !active))
      }
      className={`px-2 py-1 rounded text-xs font-medium ${
        active
          ? 'bg-green-100 text-green-800'
          : 'bg-stone-200 text-stone-600'
      } disabled:opacity-60`}
    >
      {active ? 'Active' : 'Inactive'}
    </button>
  )
}

function FeaturedToggle({ id, featured }: { id: string; featured: boolean }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(() => setAcademyProductFeatured(id, !featured))
      }
      className={`px-2 py-1 rounded text-xs font-medium ${
        featured
          ? 'bg-amber-100 text-amber-800'
          : 'bg-stone-100 text-stone-500'
      } disabled:opacity-60`}
    >
      {featured ? 'Featured' : '—'}
    </button>
  )
}
