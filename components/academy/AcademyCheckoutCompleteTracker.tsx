'use client'

import { useEffect } from 'react'
import { trackAcademyCheckoutComplete } from '@/lib/academy-analytics'

interface Props {
  productSlug: string
  productTitle: string
}

/** Fires academy_checkout_complete when mounted (e.g. on /academy/success). */
export function AcademyCheckoutCompleteTracker({ productSlug, productTitle }: Props) {
  useEffect(() => {
    trackAcademyCheckoutComplete(productSlug, productTitle)
  }, [productSlug, productTitle])
  return null
}
