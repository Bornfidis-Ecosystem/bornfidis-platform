/**
 * Sportswear catalog — Printful-ready product data.
 * Used for the coming-soon / pre-order Sportswear page.
 */

export interface SportswearProduct {
  id: string
  title: string
  price: number
  cost: number
  profit: number
  description: string
  sizes: string[]
  colors: string[]
  mockupImage: string
  printfulProductId: string
}

export const sportswearProducts: SportswearProduct[] = [
  {
    id: 'anchor-compass-tshirt',
    title: 'Anchor & Compass T-Shirt',
    price: 25,
    cost: 12,
    profit: 13,
    description: 'Premium cotton tee featuring the Bornfidis anchor and compass logo',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: ['Navy', 'Gold', 'White'],
    mockupImage: '/sportswear/tshirt-mockup.jpg',
    printfulProductId: 'PLACEHOLDER',
  },
  {
    id: 'portland-parish-hat',
    title: 'Portland Parish Trucker Hat',
    price: 22,
    cost: 11,
    profit: 11,
    description: 'Embroidered trucker cap with Bornfidis logo',
    sizes: ['One Size'],
    colors: ['Navy/Gold', 'Black/Gold'],
    mockupImage: '/sportswear/hat-mockup.jpg',
    printfulProductId: 'PLACEHOLDER',
  },
  {
    id: 'bornfidis-hoodie',
    title: 'Bornfidis Hoodie',
    price: 45,
    cost: 25,
    profit: 20,
    description: 'Heavy blend hoodie with anchor logo and tagline',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: ['Navy', 'Black'],
    mockupImage: '/sportswear/hoodie-mockup.jpg',
    printfulProductId: 'PLACEHOLDER',
  },
  {
    id: 'regenerative-tank',
    title: 'Regenerative Tank Top',
    price: 20,
    cost: 10,
    profit: 10,
    description: 'Lightweight tank for Jamaica heat',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Navy', 'Gold', 'White'],
    mockupImage: '/sportswear/tank-mockup.jpg',
    printfulProductId: 'PLACEHOLDER',
  },
  {
    id: 'bornfidis-tote',
    title: 'Bornfidis Tote Bag',
    price: 18,
    cost: 9,
    profit: 9,
    description: 'Canvas tote for market shopping',
    sizes: ['One Size'],
    colors: ['Natural/Navy'],
    mockupImage: '/sportswear/tote-mockup.jpg',
    printfulProductId: 'PLACEHOLDER',
  },
]

export function getSportswearProductById(id: string): SportswearProduct | undefined {
  return sportswearProducts.find((p) => p.id === id)
}
