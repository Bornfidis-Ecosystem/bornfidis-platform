/**
 * Academy bundle mapping: bundle slug → list of included product slugs.
 * When a user purchases a bundle slug, they get access to each included product
 * (library display + download access).
 */

export const ACADEMY_BUNDLES: Record<string, string[]> = {
  'bornfidis-complete-system': [
    'caribbean-culinary-foundations',
    'regenerative-enterprise-foundations',
    'regenerative-farmer-blueprint',
    'vermont-contractor-foundations',
  ],
}

/** Slugs that represent bundles (keys of ACADEMY_BUNDLES). */
const BUNDLE_SLUGS = Object.keys(ACADEMY_BUNDLES)

export function isBundleSlug(slug: string): boolean {
  return BUNDLE_SLUGS.includes((slug || '').trim())
}

/** Returns the list of product slugs included in a bundle, or empty array if not a bundle. */
export function getIncludedSlugs(bundleSlug: string): string[] {
  return ACADEMY_BUNDLES[(bundleSlug || '').trim()] ?? []
}

/** Returns all bundle slugs (for DB queries). */
export function getBundleSlugs(): string[] {
  return [...BUNDLE_SLUGS]
}
