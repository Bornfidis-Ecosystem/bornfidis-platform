/**
 * Phase 1 provisions catalog — request → produce → deliver.
 * No checkout; inquiries route to /contact until ecommerce is ready.
 */

export type ProvisionsProductStatus = 'Request Batch' | 'Pre-Order' | 'Waitlist'

export interface ProvisionsProduct {
  id: string
  name: string
  description: string
  status: ProvisionsProductStatus
  categoryLabel: string
  /** Optional image path (public/). */
  image?: string
}

export const PROVISIONS_FLAGSHIP_PRODUCTS: ProvisionsProduct[] = [
  {
    id: 'maple-jerk-rub',
    name: 'Maple Jerk Rub',
    categoryLabel: 'Dry Spice Rub',
    description:
      'Jamaican allspice and scotch bonnet balanced with Vermont maple sugar. Built for lamb, chicken, and the grill.',
    status: 'Request Batch',
    image: '/images/provisions/maple-jerk-rub.png',
  },
  {
    id: 'jerk-marinade',
    name: 'Jerk Marinade',
    categoryLabel: 'Wet Marinade',
    description:
      'The 48-hour marinade philosophy in a bottle. Scotch bonnet, thyme, and maple — ready for your next table.',
    status: 'Pre-Order',
  },
  {
    id: 'sorrel-gastrique',
    name: 'Sorrel Gastrique',
    categoryLabel: 'Finishing Sauce',
    description:
      'Caribbean sorrel meets Vermont technique. A sweet-tart glaze for proteins, vegetables, and the holiday table.',
    status: 'Request Batch',
  },
  {
    id: 'green-seasoning',
    name: 'Green Seasoning',
    categoryLabel: 'Fresh Seasoning',
    description:
      'Scallion, thyme, scotch bonnet, and herbs — the Caribbean base that starts every Bornfidis dish.',
    status: 'Waitlist',
  },
]
