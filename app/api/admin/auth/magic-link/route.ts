export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { buildAuthCallbackUrl, generateAdminMagicLink } from '@/lib/auth-magic-link'
import { isAllowedAdminEmail } from '@/lib/auth'
import { sendAdminMagicLinkEmail } from '@/lib/email'

/**
 * Server-side admin magic link.
 * Uses Supabase admin generateLink + Resend so redirects always target bornfidis.com,
 * regardless of Supabase Site URL still pointing at platform.bornfidis.com.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const nextRaw = typeof body.next === 'string' ? body.next : '/admin'

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!isAllowedAdminEmail(email)) {
      return NextResponse.json({ success: true })
    }

    const nextPath =
      nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : '/admin'
    const redirectTo = buildAuthCallbackUrl(nextPath)

    const generated = await generateAdminMagicLink(email, redirectTo)
    if ('error' in generated) {
      return NextResponse.json({ error: generated.error }, { status: 400 })
    }

    const sent = await sendAdminMagicLinkEmail({
      to: email,
      magicLink: generated.link,
    })

    if (!sent.success) {
      return NextResponse.json(
        { error: sent.error ?? 'Failed to send magic link email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 })
  }
}
