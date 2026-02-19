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
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const user = await getCurrentSupabaseUser()
  if (!user) {
    // Redirect to login; after login user can open My Library to download
    const loginUrl = new URL('/admin/login', _request.url)
    loginUrl.searchParams.set('next', '/dashboard/library')
    return NextResponse.redirect(loginUrl, 302)
  }

  const purchase = await db.academyPurchase.findFirst({
    where: { authUserId: user.id, productSlug: slug },
  })
  if (!purchase) {
    return NextResponse.json({ error: 'Forbidden: purchase required' }, { status: 403 })
  }

  const filename = getAcademyStorageFilename(slug)
  if (!filename) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const storageDir = path.join(process.cwd(), 'storage', 'academy-products')
  const filePath = path.join(storageDir, filename)
  if (!path.resolve(filePath).startsWith(path.resolve(storageDir))) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  // Optional: log download for analytics (productSlug, authUserId, timestamp)
  if (process.env.NODE_ENV === 'development') {
    console.info('[Academy download]', { slug, userId: user.id })
  }

  const buffer = fs.readFileSync(filePath)
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
