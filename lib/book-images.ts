import { cdnImages } from '@/lib/bornfidis-cdn-images'

/**
 * /book hero — CloudFront URL so images work on Vercel without `public/images/book/*`.
 */
export const bookImages: { hero: string } = {
  hero: cdnImages.heroPlating,
}

export const BOOK_HERO_PATH = cdnImages.heroPlating
