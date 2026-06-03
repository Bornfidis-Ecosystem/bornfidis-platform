import { NextResponse } from 'next/server'
import { z } from 'zod'
import { readLeadMagnetFile, getLeadMagnetFilename } from '@/lib/lead-magnet-storage'
import { sendLeadMagnetDeliveryEmail } from '@/lib/email'
import { db } from '@/lib/db'
import { logActivity } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'

const BODY_SCHEMA = z.object({
  email: z.string().email('Invalid email address'),
})

const SLUG = '5-caribbean-sauces'
const GUIDE_TITLE = '5 Caribbean Sauces Every Home Cook Should Know'

/**
 * POST /api/lead-magnet/5-caribbean-sauces
 * Body: { email: string }
 * Creates EmailSubscriber if new, logs activity, sends the guide PDF. No auth required.
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

  const email = parsed.data.email.trim().toLowerCase()

  const pdfBuffer = await readLeadMagnetFile(SLUG)
  if (!pdfBuffer) {
    console.warn('Lead magnet PDF not found', { slug: SLUG })
    return NextResponse.json(
      { error: 'Guide is temporarily unavailable. Please try again later.' },
      { status: 503 }
    )
  }

  // Create subscriber only if email not already in list (avoid duplicates and duplicate activity)
  const existing = await db.emailSubscriber.findUnique({ where: { email } })
  if (!existing) {
    try {
      await db.emailSubscriber.create({ data: { email } })
      logActivity({
        type: 'EMAIL_SUBSCRIBER',
        title: 'New subscriber',
        description: email,
        division: 'ACADEMY',
      }).catch(() => {})
    } catch (e: unknown) {
      const code = e && typeof e === 'object' && 'code' in e ? (e as { code: string }).code : ''
      if (code !== 'P2002') {
        console.error('Lead magnet: EmailSubscriber create failed', { email, error: e })
      }
    }
  }

  const filename = getLeadMagnetFilename(SLUG) ?? '5-caribbean-sauces.pdf'
  const result = await sendLeadMagnetDeliveryEmail({
    to: email,
    guideTitle: GUIDE_TITLE,
    pdfBuffer,
    filename,
  })

  if (!result.success) {
    console.error('Lead magnet email failed', { email, error: result.error })
    return NextResponse.json(
      { error: 'We couldn’t send the guide. Please check your email and try again.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
