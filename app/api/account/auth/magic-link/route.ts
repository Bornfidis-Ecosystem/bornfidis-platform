export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { buildAuthCallbackUrl, generateCustomerMagicLink } from '@/lib/auth-magic-link'
import { sendCustomerMagicLinkEmail } from '@/lib/email'
import { defaultCustomerNext, safeNextPath } from '@/lib/safe-next-path'

/**
 * Customer magic link for Academy / My Library.
 * No admin allowlist — any valid email may request a link.
 * Does not grant admin access; /admin/** remains on admin RBAC.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const nextRaw = typeof body.next === 'string' ? body.next : defaultCustomerNext()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const nextPath = safeNextPath(nextRaw, defaultCustomerNext())
    const redirectTo = buildAuthCallbackUrl(nextPath, {
      requestOrigin: request.nextUrl.origin,
    })

    const generated = await generateCustomerMagicLink(email, redirectTo)
    if ('error' in generated) {
      console.error('[customer-magic-link] generateLink failed:', generated.error, { email })
      return NextResponse.json({ error: generated.error }, { status: 400 })
    }

    const sent = await sendCustomerMagicLinkEmail({
      to: email,
      magicLink: generated.link,
    })

    if (!sent.success) {
      console.error('[customer-magic-link] Resend failed:', sent.error, { email })
      return NextResponse.json(
        { error: sent.error ?? 'Failed to send magic link email' },
        { status: 500 },
      )
    }

    console.log('[customer-magic-link] Sent customer magic link to:', email)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[customer-magic-link] Unhandled error:', err)
    const message = err instanceof Error ? err.message : 'Failed to send email'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
