import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/auth'
import { getCurrentUserRole } from '@/lib/get-user-role'
import WelcomePageContent from '@/components/invite/WelcomePageContent'
import { UserRole } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function EducatorWelcomePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login?next=/educator/welcome')

  const role = await getCurrentUserRole()
  const allowed = [UserRole.EDUCATOR, UserRole.ADMIN, UserRole.STAFF]
  if (!role || !allowed.includes(role as UserRole)) {
    redirect('/admin/login?next=/educator/welcome')
  }

  return <WelcomePageContent role="EDUCATOR" />
}
