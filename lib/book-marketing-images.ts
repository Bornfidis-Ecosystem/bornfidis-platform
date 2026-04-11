import { cdnImages } from '@/lib/bornfidis-cdn-images'

/** Story ChefBio — kitchen line (jerk-style chicken, sides, sauces). File: `public/images/story/chef-bio-kitchen.png`. */
export const chefBioPortrait = '/images/story/chef-bio-kitchen.png'

/** One image per testimonial card (food & atmosphere). */
export const testimonialCardImages: readonly [string, string, string] = [
  cdnImages.heroPlating,
  cdnImages.tableAtmosphere,
  cdnImages.sauceProduct,
]
