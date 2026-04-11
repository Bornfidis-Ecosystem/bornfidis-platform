/**
 * Provisions product line — Caribbean-inspired, regenerative.
 * Used for the Provisions landing. No checkout; use Notify Me / Join Waitlist until ecommerce is ready.
 */

export type ProvisionsProductStatus = 'Coming Soon' | 'Small Batch' | 'Available'

export interface ProvisionsProduct {
  id: string
  name: string
  description: string
  status: ProvisionsProductStatus
  /** Optional image path (public/). */
  image?: string
}

export const PROVISIONS_FLAGSHIP_PRODUCTS: ProvisionsProduct[] = [
  {
    id: 'maple-jerk-rub',
    name: 'Maple Jerk Rub',
    description: 'Sweet heat from Vermont maple and Jamaican jerk spices. Perfect for ribs, chicken, and roasted vegetables.',
    status: 'Coming Soon',
    image: '/images/provisions/maple-jerk-rub.png',
  },
  {
    id: 'island-fire-hot-sauce',
    name: 'Island Fire Hot Sauce',
    description: 'Scotch bonnet–driven Caribbean hot sauce. Bold, fruity, and regenerative-farm sourced.',
    status: 'Coming Soon',
    image: '/images/provisions/island-fire-hot-sauce.png',
  },
  {
    id: 'smoked-tamarind-bbq-sauce',
    name: 'Smoked Tamarind BBQ Sauce',
    description: 'Tangy tamarind and smoke over a low fire. A versatile glaze for grilling and finishing.',
    status: 'Small Batch',
    image: '/images/provisions/smoked-tamarind-bbq.png',
  },
]
