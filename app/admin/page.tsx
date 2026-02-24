import { redirect } from 'next/navigation'
import Link from 'next/link'

function isNextRedirect(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'digest' in err &&
    String((err as { digest?: string }).digest).startsWith('NEXT_')
}

function AdminPageFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8">
      <p className="text-gray-600">Something went wrong loading the admin dashboard.</p>
      <Link href="/admin/bookings" className="text-green-800 font-medium underline">Go to Bookings</Link>
      <Link href="/admin/login" className="text-gray-600 text-sm underline">Log in</Link>
    </div>
  )
}

export default function AdminPage() {
  try {
    redirect('/admin/bookings')
  } catch (err) {
    if (isNextRedirect(err)) throw err
    console.error('ADMIN_LOAD_ERROR', err)
    return <AdminPageFallback />
  }
}
