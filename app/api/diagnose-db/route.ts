import { NextResponse } from 'next/server'
import { checkAdminAccess } from '@/lib/requireAdmin'
import { isFounderAdminRole } from '@/lib/admin-rbac'

/**
 * Diagnostic endpoint — founder admin only.
 * Never public: previously unauthenticated and could use the service-role key.
 */
export async function GET() {
  const access = await checkAdminAccess()
  if (!access.isAdmin || !isFounderAdminRole(access.platformRole)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(
    {
      ok: true,
      message:
        'Diagnostics locked. Use server logs, Prisma Studio, or Supabase Dashboard. Do not expose schema probes publicly.',
      environment: process.env.NODE_ENV,
      hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL || process.env.DIRECT_URL),
    },
    { status: 200 },
  )
}
