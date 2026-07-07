/**
 * Provisions catalog — customer test-batch lineup + request → produce → deliver.
 * Product photos live in public/images/provisions/.
 */

export type ProvisionsProductStatus = 'Request Batch' | 'Pre-Order' | 'Waitlist' | 'In Testing'

export interface ProvisionsProduct {
  id: string
  name: string
  tagline: string
  description: string
  status: ProvisionsProductStatus
  categoryLabel: string
  priceFrom: string
  size: string
  /** Primary card / default image */
  imageHero: string
  /** Secondary image on hover (group or pair shot) */
  imageHover?: string
}

export const PROVISIONS_HEADER_IMAGE = '/images/provisions/provisions-lineup.jpg'

export const PROVISIONS_GIFT_BUNDLE = {
  id: 'guest-welcome-package',
  title: 'Guest Welcome Package',
  body:
    'All four provisions in one curated basket — Maple Jerk Rub, Maple Escovitch, Green Seasoning, and Sorrel Gastrique. Built for guest houses, retreat hosts, and private dining clients who want the full Bornfidis pantry on arrival.',
  image: '/images/provisions/provisions-gift-basket.jpg',
  priceFrom: 'From $85',
} as const

/** Active test-batch products from customer test runs. */
export const PROVISIONS_FLAGSHIP_PRODUCTS: ProvisionsProduct[] = [
  {
    id: 'maple-jerk-rub',
    name: 'Maple Jerk Rub',
    categoryLabel: 'Dry Spice Rub',
    tagline: 'Allspice and scotch bonnet balanced with Vermont maple.',
    description:
      'Hand-mixed dry rub — allspice, scotch bonnet, thyme, maple sugar, garlic, and ginger. Built for lamb, chicken, and the grill.',
    status: 'Request Batch',
    priceFrom: '$18',
    size: '4 oz',
    imageHero: '/images/provisions/maple-jerk-rub-hero.jpg',
    imageHover: '/images/provisions/maple-jerk-rub-group.jpg',
  },
  {
    id: 'maple-escovitch',
    name: 'Maple Escovitch Finishing Sauce',
    categoryLabel: 'Finishing Sauce',
    tagline: 'Caribbean heat. Vermont maple.',
    description:
      'Scotch bonnet, onion, thyme, maple syrup, vinegar, and allspice — island pickle tradition finished with Vermont maple.',
    status: 'Request Batch',
    priceFrom: '$22',
    size: '8 oz',
    imageHero: '/images/provisions/maple-escovitch-hero.jpg',
    imageHover: '/images/provisions/maple-escovitch-group.jpg',
  },
  {
    id: 'green-seasoning',
    name: 'Green Seasoning',
    categoryLabel: 'Fresh Seasoning',
    tagline: 'The base of every Bornfidis dish.',
    description:
      'Scallion, thyme, scotch bonnet, garlic, parsley, lime, and ginger — the Caribbean base that starts every Bornfidis table. Keep refrigerated.',
    status: 'Request Batch',
    priceFrom: '$20',
    size: '6 oz',
    imageHero: '/images/provisions/green-seasoning-hero.jpg',
    imageHover: '/images/provisions/green-seasoning-pair.jpg',
  },
  {
    id: 'sorrel-gastrique',
    name: 'Sorrel Gastrique',
    categoryLabel: 'Finishing Sauce',
    tagline: 'Caribbean soul, Vermont craft.',
    description:
      'Hibiscus sorrel reduced with maple syrup, lime, apple cider vinegar, and ginger — sweet-tart on proteins, cheese, and holiday plates.',
    status: 'Request Batch',
    priceFrom: '$24',
    size: '5 oz',
    imageHero: '/images/provisions/sorrel-gastrique-hero.jpg',
  },
]

export const PROVISIONS_BATCH_LINE =
  'Request a batch — we prepare small runs when orders align, so every jar stays fresh and intentional.' as const

export const PROVISIONS_HERO = {
  titleLine1: 'Small batch.',
  titleLine2: 'No shortcuts.',
  body:
    'Pantry provisions from our Vermont and Jamaica roots — hand-made in limited runs. Request a batch; we prepare when orders align, then deliver.',
  processLine: 'Request → Produce → Deliver',
} as const
