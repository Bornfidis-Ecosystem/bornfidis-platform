import { NextResponse } from 'next/server'
import { z } from 'zod'
import { readLeadMagnetFile, getLeadMagnetFilename } from '@/lib/lead-magnet-storage'
import { sendLeadMagnetDeliveryEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

const BODY_SCHEMA = z.object({
  email: z.string().email('Invalid email address'),
})

const SLUG = '5-caribbean-sauces'
const GUIDE_TITLE = '5 Caribbean Sauces Every Home Cook Should Know'

/**
 * POST /api/lead-magnet/5-caribbean-sauces
 * Body: { email: string }
 * Sends the guide PDF as an email attachment. No auth required.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = BODY_SCHEMA.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.flatten().formErrors?.[0] ?? 'Invalid request'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const pdfBuffer = await readLeadMagnetFile(SLUG)
  if (!pdfBuffer) {
    console.warn('Lead magnet PDF not found', { slug: SLUG })
    return NextResponse.json(
      { error: 'Guide is temporarily unavailable. Please try again later.' },
      { status: 503 }
    )
  }

  const filename = getLeadMagnetFilename(SLUG) ?? '5-caribbean-sauces.pdf'
  const result = await sendLeadMagnetDeliveryEmail({
    to: parsed.data.email,
    guideTitle: GUIDE_TITLE,
    pdfBuffer,
    filename,
  })

  if (!result.success) {
    console.error('Lead magnet email failed', { email: parsed.data.email, error: result.error })
    return NextResponse.json(
      { error: 'We couldn’t send the guide. Please check your email and try again.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
