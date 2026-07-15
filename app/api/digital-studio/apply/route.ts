import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { db } from '@/lib/db'
import { sendDigitalStudioApplicationEmails } from '@/lib/email'
import { checkFormRateLimit, clientIpFromRequest } from '@/lib/form-rate-limit'
import { logActivity } from '@/lib/activity-log'
import { digitalStudioApplicationSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

/**
 * POST /api/digital-studio/apply
 * Pilot application — persist to CRM, then admin + applicant email.
 * Email failure after DB write still returns success (payment-style pattern).
 */
export async function POST(request: Request) {
  const ip = clientIpFromRequest(request)
  const rate = checkFormRateLimit(`digital-studio:${ip}`, { limit: 5, windowMs: 60_000 })
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many submissions. Please wait a minute and try again.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    const raw = body as Record<string, unknown>
    if (typeof raw.website_url === 'string' && raw.website_url.trim().length > 0) {
      return NextResponse.json({ ok: true })
    }

    const data = digitalStudioApplicationSchema.parse(body)

    const row = await db.digitalStudioApplication.create({
      data: {
        businessName: data.businessName,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        businessType: data.businessType,
        businessTypeOther: data.businessTypeOther?.trim() || null,
        biggestGap: data.biggestGap,
        websiteStatus: data.websiteStatus,
        timeline: data.timeline,
        notes: data.notes?.trim() || null,
        status: 'new',
        source: 'digital-studio-apply',
      },
    })

    logActivity({
      type: 'DIGITAL_STUDIO_APPLICATION',
      title: 'Digital Studio application',
      description: `${data.businessName} — ${data.contactName}`,
      division: 'SYSTEM',
      metadata: { applicationId: row.id, timeline: data.timeline },
    }).catch(() => {})

    const result = await sendDigitalStudioApplicationEmails(data)
    if (!result.success) {
      console.error('Digital Studio emails failed after CRM save:', result.error)
      // CRM row exists — do not fail the applicant after persistence.
    }

    return NextResponse.json({ ok: true, id: row.id })
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.errors.map((e) => e.message).join('. ')
      return NextResponse.json({ ok: false, error: message }, { status: 400 })
    }
    console.error('Digital Studio application error:', error)
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
