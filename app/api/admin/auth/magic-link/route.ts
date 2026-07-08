export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { canReceiveAdminMagicLink } from '@/lib/admin-magic-link-access'
import { buildAuthCallbackUrl, generateAdminMagicLink } from '@/lib/auth-magic-link'
import { sendAdminMagicLinkEmail } from '@/lib/email'

/**
 * Server-side admin magic link.
 * Uses Supabase admin generateLink + Resend so redirects always target bornfidis.com.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const nextRaw = typeof body.next === 'string' ? body.next : '/admin'

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const allowed = await canReceiveAdminMagicLink(email)
    if (!allowed) {
      // Do not reveal allowlist — same response as success.
      console.warn('[magic-link] Request for non-allowlisted email (no email sent):', email)
      return NextResponse.json({ success: true })
    }

    const nextPath =
      nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : '/admin'
    const redirectTo = buildAuthCallbackUrl(nextPath)

    const generated = await generateAdminMagicLink(email, redirectTo)
    if ('error' in generated) {
      console.error('[magic-link] generateLink failed:', generated.error, { email })
      return NextResponse.json({ error: generated.error }, { status: 400 })
    }

    const sent = await sendAdminMagicLinkEmail({
      to: email,
      magicLink: generated.link,
    })

    if (!sent.success) {
      console.error('[magic-link] Resend failed:', sent.error, { email })
      return NextResponse.json(
        { error: sent.error ?? 'Failed to send magic link email' },
        { status: 500 }
      )
    }

    console.log('[magic-link] Sent admin magic link to:', email)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[magic-link] Unhandled error:', err)
    const message = err instanceof Error ? err.message : 'Failed to send magic link'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
