import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { sendDigitalStudioApplicationEmails } from '@/lib/email'
import { digitalStudioApplicationSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

/**
 * POST /api/digital-studio/apply
 * Pilot application — admin notification + applicant confirmation via Resend. No CRM.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    const data = digitalStudioApplicationSchema.parse(body)
    const result = await sendDigitalStudioApplicationEmails(data)

    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: result.error || 'Could not send application. Please email hello@bornfidis.com.' },
        { status: 503 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.errors.map((e) => e.message).join('. ')
      return NextResponse.json({ ok: false, error: message }, { status: 400 })
    }
    console.error('Digital Studio application error:', error)
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
