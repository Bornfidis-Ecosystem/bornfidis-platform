import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { getCurrentSupabaseUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { getAcademyStorageFilename } from '@/lib/academy-storage'

export const dynamic = 'force-dynamic'

/**
 * Secure download: only if the user has an AcademyPurchase for this product.
 * Reads from private storage (storage/academy-products/), not public.
 */
const LOG_LABEL = 'ACADEMY_DOWNLOAD'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  let user: Awaited<ReturnType<typeof getCurrentSupabaseUser>>
  try {
    user = await getCurrentSupabaseUser()
  } catch (err) {
    console.error(LOG_LABEL, 'getCurrentSupabaseUser threw', err)
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 })
  }

  if (!user) {
    const loginUrl = new URL('/admin/login', _request.url)
    loginUrl.searchParams.set('next', '/dashboard/library')
    return NextResponse.redirect(loginUrl, 302)
  }

  let purchase: Awaited<ReturnType<typeof db.academyPurchase.findFirst>>
  try {
    purchase = await db.academyPurchase.findFirst({
      where: { authUserId: user.id, productSlug: slug },
    })
  } catch (err) {
    console.error(LOG_LABEL, 'db.academyPurchase.findFirst failed', {
      slug,
      userId: user.id,
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: 'Unable to verify purchase' }, { status: 500 })
  }

  if (!purchase) {
    return NextResponse.json({ error: 'Forbidden: purchase required' }, { status: 403 })
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
    console.info(LOG_LABEL, 'serving file', { slug, userId: user.id })
  }

  let buffer: Buffer
  try {
    buffer = fs.readFileSync(filePath)
  } catch (err) {
    console.error(LOG_LABEL, 'readFileSync failed', { slug, filePath, error: err instanceof Error ? err.message : String(err) })
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
