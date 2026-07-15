import type { Metadata } from 'next'

import ContactPageContent from '@/components/contact/ContactPageContent'
import { PHASE1_CONTACT_SERVICE_PARAM } from '@/lib/phase1-marketing'

export const metadata: Metadata = {
  title: 'Contact — Bornfidis',
  description:
    'Contact Bornfidis for private dining, cooking classes, and small-batch provisions. Caribbean-inspired. Vermont-crafted.',
}

type ContactPageProps = {
  searchParams: Promise<{ service?: string; product?: string }>
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams
  const key = params.service?.toLowerCase() ?? ''
  const presetService = PHASE1_CONTACT_SERVICE_PARAM[key] ?? ''
  const productSlug = params.product?.trim() ?? ''

  return <ContactPageContent presetService={presetService} productSlug={productSlug} />
}
