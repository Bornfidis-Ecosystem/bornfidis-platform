'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientSupabaseClient, getClientAuthUser } from '@/lib/auth-client'

/**
 * Admin Login Form Component
 * Phase 2B: Email magic link authentication
 * Located in (auth) route group to bypass admin layout protection
 * TODO: Phase 3 - Add role selection if multiple roles exist
 */
function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  
  // Safety: Force show login form after 3 seconds no matter what
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      console.log('Safety timeout - forcing login form')
      setIsCheckingAuth(false)
    }, 3000)
    
    return () => clearTimeout(safetyTimeout)
  }, [])

  // Check for error from callback
  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setMessage({ type: 'error', text: decodeURIComponent(error) })
    }
  }, [searchParams])

  // Handle hash tokens from Supabase redirect
  useEffect(() => {
    let isMounted = true
    let timeoutId: ReturnType<typeof setTimeout>
    
    // Always show login form after timeout - this is the safety net
    // This MUST fire to prevent infinite loading
    timeoutId = setTimeout(() => {
      console.log('Auth check timeout - forcing login form to show')
      setIsCheckingAuth(false)
    }, 1500) // 1.5 second timeout - shorter for faster UX
    
    async function handleAuthHash() {
      try {
        // Check for hash tokens first (Supabase redirects with tokens in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const error = hashParams.get('error')
        
        if (error) {
          clearTimeout(timeoutId)
          if (!isMounted) return
          setMessage({ type: 'error', text: decodeURIComponent(error) })
          setIsCheckingAuth(false)
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname)
          return
        }
        
        if (accessToken) {
          // Try to create client and exchange tokens
          try {
            const supabase = createClientSupabaseClient()
            
            // Exchange hash tokens for session
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || '',
            })
            
            clearTimeout(timeoutId)
            
            if (sessionError) {
              if (!isMounted) return
              setMessage({ type: 'error', text: sessionError.message })
              setIsCheckingAuth(false)
              window.history.replaceState({}, document.title, window.location.pathname)
              return
            }
            
            if (data.user) {
              // Clean up URL hash
              window.history.replaceState({}, document.title, window.location.pathname)
              const next = searchParams.get('next')
              const redirectTo =
                next && next.startsWith('/') && !next.startsWith('//')
                  ? next
                  : '/admin'
              window.location.href = redirectTo
              return
            }
          } catch (clientError: any) {
            console.error('Failed to create Supabase client:', clientError)
            clearTimeout(timeoutId)
            if (isMounted) {
              setIsCheckingAuth(false)
            }
            return
          }
        }
        
        // Check if already authenticated
        try {
          const user = await getClientAuthUser()
          
          clearTimeout(timeoutId)
          if (!isMounted) return
          
          if (user) {
            const next = searchParams.get('next')
            const redirectTo =
              next && next.startsWith('/') && !next.startsWith('//')
                ? next
                : '/admin'
            window.location.href = redirectTo
          } else {
            setIsCheckingAuth(false)
          }
        } catch (authError) {
          clearTimeout(timeoutId)
          console.error('Error checking auth:', authError)
          if (!isMounted) return
          setIsCheckingAuth(false)
        }
      } catch (error: any) {
        clearTimeout(timeoutId)
        console.error('Error in handleAuthHash:', error)
        if (!isMounted) return
        setIsCheckingAuth(false)
        // Don't show error message on initial load - just show login form
      }
    }
    
    handleAuthHash()
    
    // Cleanup function
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [router]) // Include router for navigation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const supabase = createClientSupabaseClient()
      
      // Send magic link email
      const next = searchParams.get('next')
      const redirectTo =
        next && next.startsWith('/') ? encodeURIComponent(next) : ''
      const emailRedirectTo =
        redirectTo
          ? `${window.location.origin}/admin/login?next=${redirectTo}`
          : `${window.location.origin}/admin/login`
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo,
        },
      })

      if (error) {
        const isRateLimit =
          error.message?.toLowerCase().includes('rate limit') ||
          error.message?.toLowerCase().includes('too many requests') ||
          error.code === 'over_email_send_limit'
        const friendlyMessage = isRateLimit
          ? 'Too many login attempts. Please wait a few minutes and try again, or check your email for an existing magic link.'
          : error.message
        setMessage({ type: 'error', text: friendlyMessage })
        setIsLoading(false)
        return
      }

      // Success - show message
      setMessage({
        type: 'success',
        text: 'Check your email for the magic link to sign in.',
      })
      setIsLoading(false)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' })
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600">Checking authentication...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-navy mb-2">Admin Login</h1>
          <p className="text-gray-600 text-sm">
            Enter your email to receive a magic link
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@bornfidis.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-navy text-white rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Only authorized email addresses can access the admin panel.
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Admin Login Page
 * Wrapped in Suspense for useSearchParams
 * Located in (auth) route group to bypass admin layout protection
 */
export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  )
}


