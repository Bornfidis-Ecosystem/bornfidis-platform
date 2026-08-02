/**
 * Server-controlled BBOS Library manifest.
 * Filesystem paths are never derived from request parameters — only from this allowlist.
 */

export const BBOS_PRODUCT_SLUG = 'bornfidis-business-operating-system'

export const BBOS_UPDATE_POLICY =
  'Your BBOS purchase includes access to all updates released within Version 1.x.'

export type BbosModuleKey = 'module-01' | 'module-02' | 'module-03' | 'module-04'

export type BbosAssetId = 'calculator' | 'weekly-rhythm-workbook' | 'zip'

export interface BbosModuleEntry {
  key: BbosModuleKey
  number: number
  title: string
  /** Path relative to process.cwd() — never accept client path input. */
  relativePath: string
  shortDescription: string
}

export interface BbosDownloadAsset {
  id: BbosAssetId
  label: string
  description: string
  /** Query value for ?asset= — omit for default ZIP. */
  queryAssetId: string | null
  customerFilename: string
  storageObjectPath: string
}

export interface BbosLibraryManifest {
  productSlug: string
  title: string
  description: string
  version: string
  releaseLabel: string
  lastUpdated: string
  updatePolicy: string
  modules: BbosModuleEntry[]
  assets: BbosDownloadAsset[]
  releaseNotes: string[]
}

export const BBOS_LIBRARY_MANIFEST: BbosLibraryManifest = {
  productSlug: BBOS_PRODUCT_SLUG,
  title: 'Bornfidis Business Operating System (BBOS)',
  description:
    'A practical operating system for service-business owners: foundation, offers, pricing with dignity, and a weekly operating rhythm — with tools you can use immediately.',
  version: '1.0.0',
  releaseLabel: 'Phase One',
  lastUpdated: '2026-08-02',
  updatePolicy: BBOS_UPDATE_POLICY,
  modules: [
    {
      key: 'module-01',
      number: 1,
      title: 'Business Foundation',
      relativePath: 'content/bbos/module-01-business-foundation.md',
      shortDescription: 'See the business clearly. Snapshot, time map, and first weakness.',
    },
    {
      key: 'module-02',
      number: 2,
      title: 'Offer and Sales System',
      relativePath: 'content/bbos/module-02-offer-and-sales-system.md',
      shortDescription: 'Package the offer, ladder, pipeline, and follow-up cadence.',
    },
    {
      key: 'module-03',
      number: 3,
      title: 'Pricing With Dignity',
      relativePath: 'content/bbos/module-03-pricing-with-dignity.md',
      shortDescription: 'Cost Stack, Target Margin, Guardrails, and defensible prices.',
    },
    {
      key: 'module-04',
      number: 4,
      title: 'Weekly Operating Rhythm',
      relativePath: 'content/bbos/module-04-weekly-operating-rhythm.md',
      shortDescription: 'Plan, deliver, sell, review, and close the week.',
    },
  ],
  assets: [
    {
      id: 'calculator',
      label: 'Pricing & Margin Calculator',
      description: 'Turn a Cost Stack and Target Margin into a defensible price (Module 3 tool).',
      queryAssetId: 'calculator',
      customerFilename: 'BBOS-Pricing-Margin-Calculator-v1.xlsx',
      storageObjectPath:
        'bornfidis-business-operating-system/v1/bbos-pricing-margin-calculator-v1.xlsx',
    },
    {
      id: 'weekly-rhythm-workbook',
      label: 'Weekly Operating Rhythm Workbook',
      description: 'Worksheets for Modules 1, 2, and 4 — plan, run, and close your week.',
      queryAssetId: 'weekly-rhythm-workbook',
      customerFilename: 'BBOS-Weekly-Operating-Rhythm-Workbook-v1.xlsx',
      storageObjectPath:
        'bornfidis-business-operating-system/v1/bbos-weekly-operating-rhythm-workbook-v1.xlsx',
    },
    {
      id: 'zip',
      label: 'Full package (ZIP)',
      description: 'Complete BBOS package download for offline use.',
      queryAssetId: null,
      customerFilename: 'Bornfidis-Business-Operating-System-v1.zip',
      storageObjectPath:
        'bornfidis-business-operating-system/v1/bornfidis-business-operating-system-v1.zip',
    },
  ],
  releaseNotes: [
    'Phase One operational foundation locked (tag bbos-v1-phase1).',
    'Modules 1–4: Business Foundation, Offer and Sales System, Pricing With Dignity, Weekly Operating Rhythm.',
    'Companion tools: Pricing & Margin Calculator V1.0 and Weekly Operating Rhythm Workbook V1.0.',
    'Library experience: read modules online and download individual tools (entitlement required).',
    'BBOS remains inactive for public checkout until Stripe Price alignment and E2E testing pass.',
  ],
}

const MODULE_BY_KEY: Record<string, BbosModuleEntry> = Object.fromEntries(
  BBOS_LIBRARY_MANIFEST.modules.map((m) => [m.key, m]),
)

const ASSET_BY_QUERY: Record<string, BbosDownloadAsset> = Object.fromEntries(
  BBOS_LIBRARY_MANIFEST.assets
    .filter((a) => a.queryAssetId)
    .map((a) => [a.queryAssetId as string, a]),
)

export function getBbosManifest(): BbosLibraryManifest {
  return BBOS_LIBRARY_MANIFEST
}

export function isBbosProductSlug(slug: string): boolean {
  return (slug || '').trim() === BBOS_PRODUCT_SLUG
}

/** Resolve a module from an allowlisted key only. */
export function getBbosModuleByKey(moduleKey: string): BbosModuleEntry | null {
  const key = (moduleKey || '').trim()
  return MODULE_BY_KEY[key] ?? null
}

export function getBbosModuleOrder(): BbosModuleKey[] {
  return BBOS_LIBRARY_MANIFEST.modules.map((m) => m.key)
}

export function getAdjacentBbosModules(moduleKey: string): {
  prev: BbosModuleEntry | null
  next: BbosModuleEntry | null
} {
  const order = getBbosModuleOrder()
  const idx = order.indexOf(moduleKey as BbosModuleKey)
  if (idx < 0) return { prev: null, next: null }
  const prevKey = idx > 0 ? order[idx - 1] : null
  const nextKey = idx < order.length - 1 ? order[idx + 1] : null
  return {
    prev: prevKey ? getBbosModuleByKey(prevKey) : null,
    next: nextKey ? getBbosModuleByKey(nextKey) : null,
  }
}

/** Resolve a downloadable asset by query id (calculator | weekly-rhythm-workbook). */
export function getBbosAssetByQueryId(assetQueryId: string): BbosDownloadAsset | null {
  const id = (assetQueryId || '').trim()
  if (!id) return null
  return ASSET_BY_QUERY[id] ?? null
}

export function getBbosZipAsset(): BbosDownloadAsset {
  return BBOS_LIBRARY_MANIFEST.assets.find((a) => a.id === 'zip')!
}

export function bbosDownloadHref(asset: BbosDownloadAsset): string {
  if (!asset.queryAssetId) {
    return `/api/academy/download/${BBOS_PRODUCT_SLUG}`
  }
  return `/api/academy/download/${BBOS_PRODUCT_SLUG}?asset=${encodeURIComponent(asset.queryAssetId)}`
}
