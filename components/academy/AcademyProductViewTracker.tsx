'use client'

import { useEffect } from 'react'
import { trackAcademyProductView } from '@/lib/academy-analytics'

interface Props {
  slug: string
  title: string
  priceDisplay?: string
  category?: string
}

/** Fires academy_product_view when mounted (e.g. on /academy/[slug] page). */
export function AcademyProductViewTracker({ slug, title, priceDisplay, category }: Props) {
  useEffect(() => {
    trackAcademyProductView(slug, title, priceDisplay, category)
  }, [slug, title, priceDisplay, category])
  return null
}
