/**
 * Homepage images — drop files into `public/images/homepage/` using the filenames below,
 * then set each slot to `homepageImagePath('slotName')` (or paste the full `/images/homepage/...` path).
 *
 * | Slot in code (`homepageImages.*`) | Expected file (under `public/images/homepage/`) | Used in `app/page.tsx` |
 * |-----------------------------------|-------------------------------------------------|-------------------------|
 * | `hero` | `hero.png` (or `.jpg`) | Hero — right column (replaces glass cards when set) |
 * | `serviceIntimate` | `service-intimate.png` | Service Packages — card 1 “Intimate Dining” |
 * | `serviceGathering` | `service-gathering.png` | Service Packages — card 2 “Gathering Experience” |
 * | `serviceRetreat` | `service-retreat.png` | Service Packages — card 3 “Retreat & Events” |
 * | `experienceBoard` | `experience-board.png` | The Experience — left tile (grazing / boards) |
 * | `experienceFresh` | `experience-fresh.png` | The Experience — right tile (fresh / crudité) |
 * | `provisionsSpice` | `provisions-spice.png` | Optional — legacy file; homepage uses `ProvisionsComingSoonGrid` mockups |
 * | `provisionsPrep` | `provisions-prep.png` | Optional — legacy file |
 * | `provisionsGourmet` | `provisions-gourmet.png` | Optional — legacy file |
 *
 * Use PNG or JPG; if you use a different extension, set the path manually instead of `homepageImagePath()`.
 */

import { cdnImages } from '@/lib/bornfidis-cdn-images'

export const HOMEPAGE_IMAGE_DIR = '/images/homepage' as const

/** Canonical filenames — rename your exports to match, or change these strings once. */
export const HOMEPAGE_IMAGE_FILES = {
  hero: 'hero.png',
  serviceIntimate: 'service-intimate.png',
  serviceGathering: 'service-gathering.png',
  serviceRetreat: 'service-retreat.png',
  experienceBoard: 'experience-board.png',
  experienceFresh: 'experience-fresh.png',
  provisionsSpice: 'provisions-spice.png',
  provisionsPrep: 'provisions-prep.png',
  provisionsGourmet: 'provisions-gourmet.png',
} as const

export type HomepageImageSlot = keyof typeof HOMEPAGE_IMAGE_FILES

export function homepageImagePath(slot: HomepageImageSlot): string {
  return `${HOMEPAGE_IMAGE_DIR}/${HOMEPAGE_IMAGE_FILES[slot]}`
}

/**
 * Prefer CDN for slots used on /book and marketing so Vercel builds show photography
 * without committing large binaries. Optional: swap back to `homepageImagePath` per slot.
 */
export const homepageImages: Record<HomepageImageSlot, string | null> = {
  hero: homepageImagePath('hero'),
  serviceIntimate: cdnImages.servicePrivateDinner,
  serviceGathering: cdnImages.serviceRetreat,
  /** Matches homepage “Wedding & Events” — local grill shot (not CDN stove-flame still). */
  serviceRetreat: '/images/story/service-wedding-grill.png',
  experienceBoard: cdnImages.tableAtmosphere,
  experienceFresh: cdnImages.chefAction,
  provisionsSpice: homepageImagePath('provisionsSpice'),
  provisionsPrep: homepageImagePath('provisionsPrep'),
  provisionsGourmet: homepageImagePath('provisionsGourmet'),
}
