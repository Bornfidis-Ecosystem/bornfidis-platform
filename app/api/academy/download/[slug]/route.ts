import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { checkAcademyEntitlement } from '@/lib/academy-entitlement'
import { getAcademyStorageFilename } from '@/lib/academy-storage'
import {
  createSignedDownloadUrl,
  isObjectStorageSlug,
  isUnavailableBbosAsset,
  resolveObjectStorageDownload,
} from '@/lib/academy-object-storage'

export const dynamic = 'force-dynamic'

/**
 * Secure download: only if the user has an AcademyPurchase for this product.
 * Object-storage products (e.g. BBOS) use short-lived signed URLs.
 * Optional ?asset= for BBOS tools / tools-bundle (allowlisted).
 */
const LOG_LABEL = 'ACADEMY_DOWNLOAD'

const FULL_PACKAGE_UNAVAILABLE = {
  error: 'The complete offline BBOS package is not currently available',
  code: 'full_package_unavailable',
} as const

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const assetParam = new URL(request.url).searchParams.get('asset')

  const entitlement = await checkAcademyEntitlement(slug)

  if (!entitlement.ok) {
    if (entitlement.reason === 'unauthenticated') {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('next', '/dashboard/library')
      return NextResponse.redirect(loginUrl, 302)
    }
    if (entitlement.reason === 'error') {
      return NextResponse.json({ error: 'Unable to verify purchase' }, { status: 500 })
    }
    return NextResponse.json({ error: 'Forbidden: purchase required' }, { status: 403 })
  }

  // Object-storage products (e.g., BBOS) — entitlement already verified.
  if (isObjectStorageSlug(slug)) {
    const assetId = assetParam?.trim() || ''

    // No asset / unavailable full-package: fail closed — never serve the reserved path.
    if (!assetId || isUnavailableBbosAsset(assetId)) {
      return NextResponse.json(FULL_PACKAGE_UNAVAILABLE, { status: 409 })
    }

    const resolved = resolveObjectStorageDownload(slug, assetId)
    if (!resolved) {
      return NextResponse.json({ error: 'File not available for this product' }, { status: 404 })
    }

    const signed = await createSignedDownloadUrl(slug, assetId)
    if (!signed.ok) {
      if (signed.error === 'asset_unavailable') {
        return NextResponse.json(FULL_PACKAGE_UNAVAILABLE, { status: 409 })
      }
      if (signed.error === 'unknown_asset') {
        return NextResponse.json({ error: 'File not available for this product' }, { status: 404 })
      }
      console.error(LOG_LABEL, 'object-storage signing failed', {
        slug,
        asset: assetId || '(none)',
      })
      return NextResponse.json({ error: 'File temporarily unavailable' }, { status: 502 })
    }
    return NextResponse.redirect(signed.url, 302)
  }

  // Asset query is only valid for object-storage (BBOS) products.
  if (assetParam?.trim()) {
    return NextResponse.json({ error: 'File not available for this product' }, { status: 404 })
  }

  const filename = getAcademyStorageFilename(slug)
  if (!filename) {
    console.warn(LOG_LABEL, 'no storage filename for slug', { slug })
    return NextResponse.json({ error: 'File not available for this product' }, { status: 404 })
  }

  const storageDir = path.join(process.cwd(), 'storage', 'academy-products')
  const filePath = path.join(storageDir, filename)
  if (!path.resolve(filePath).startsWith(path.resolve(storageDir))) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  if (!fs.existsSync(filePath)) {
    console.warn(LOG_LABEL, 'file not found on disk', { slug, filename })
    return NextResponse.json({ error: 'File not available' }, { status: 404 })
  }

  if (process.env.NODE_ENV === 'development') {
    console.info(LOG_LABEL, 'serving file', { slug, userId: entitlement.userId })
  }

  let buffer: Buffer
  try {
    buffer = fs.readFileSync(filePath)
  } catch (err) {
    console.error(LOG_LABEL, 'readFileSync failed', {
      slug,
      filePath,
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: 'File not available' }, { status: 404 })
  }

  const safeName = filename.replace(/^.*[\\/]/, '')
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeName}"`,
      'Cache-Control': 'private, no-cache',
    },
  })
}
