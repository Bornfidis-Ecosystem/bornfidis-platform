import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/lib/requireAdmin'

/**
 * Force dynamic rendering to prevent caching issues
 * This ensures the auth check runs on every request
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Admin Layout - Protects all /admin/* routes
 * Checks authentication and admin role
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check admin access
  const result = await checkAdminAccess()

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 AdminLayout auth check:', {
      hasUser: !!result.user,
      isAdmin: result.isAdmin,
      email: result.user?.email,
      error: result.error,
    })
  }

  // Not authenticated - redirect to login
  if (!result.user) {
    redirect('/admin/login')
  }

  // Authenticated but not admin - show access denied with debug info
  if (!result.isAdmin) {
    const debugInfo = process.env.NODE_ENV === 'development' ? {
      email: result.user?.email,
      user_metadata_role: result.user?.user_metadata?.role,
      app_metadata_role: result.user?.app_metadata?.role,
      error: result.error,
    } : null

    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem'
      }}>
        <h1 style={{ fontSize: '2rem', color: '#dc2626' }}>Access Denied</h1>
        <p style={{ fontSize: '1.125rem', color: '#666' }}>
          You must have admin role to access this page.
        </p>
        {debugInfo && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            maxWidth: '600px',
            textAlign: 'left'
          }}>
            <strong>Debug Info (dev only):</strong>
            <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#666' }}>
              Check: <a href="/api/admin/debug-auth" target="_blank" style={{ color: '#1a5f3f' }}>/api/admin/debug-auth</a>
            </p>
          </div>
        )}
        <a 
          href="/admin/login" 
          style={{ 
            color: '#1a5f3f', 
            textDecoration: 'underline',
            marginTop: '1rem'
          }}
        >
          Back to Login
        </a>
      </div>
    )
  }

  return <>{children}</>
}
