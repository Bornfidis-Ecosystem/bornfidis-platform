import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/**
 * Convenience alias — there is no projects index under this path.
 * The Digital Studio list (applications + projects) lives at /admin/digital-studio.
 * Without this, /projects is captured by [id] and errors/404s.
 */
export default function DigitalStudioProjectsAliasPage() {
  redirect('/admin/digital-studio')
}
