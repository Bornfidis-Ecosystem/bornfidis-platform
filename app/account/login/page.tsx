'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClientSupabaseClient, getClientAuthUser } from '@/lib/auth-client'
import { defaultCustomerNext, safeNextPath } from '@/lib/safe-next-path'

function CustomerLoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  )
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [logoError, setLogoError] = useState(false)
  const [logoSrc, setLogoSrc] = useState('/brand/logos/logo-lockup-navy-on-white.png')

  const nextPath = safeNextPath(searchParams.get('next'), defaultCustomerNext())

  useEffect(() => {
    const safety = setTimeout(() => setIsCheckingAuth(false), 2000)
    return () => clearTimeout(safety)
  }, [])

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setMessage({ type: 'error', text: decodeURIComponent(error) })
    }
  }, [searchParams])

  useEffect(() => {
    let mounted = true
    const timeoutId = setTimeout(() => {
      if (mounted) setIsCheckingAuth(false)
    }, 1500)

    async function check() {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        if (accessToken) {
          const supabase = createClientSupabaseClient()
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          })
          clearTimeout(timeoutId)
          if (!mounted) return
          if (sessionError) {
            setMessage({ type: 'error', text: sessionError.message })
            setIsCheckingAuth(false)
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
            return
          }
          if (data.user) {
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
            window.location.href = nextPath
            return
          }
        }

        const user = await getClientAuthUser()
        clearTimeout(timeoutId)
        if (!mounted) return
        if (user) {
          window.location.href = nextPath
        } else {
          setIsCheckingAuth(false)
        }
      } catch {
        clearTimeout(timeoutId)
        if (mounted) setIsCheckingAuth(false)
      }
    }

    check()
    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
  }, [nextPath])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/account/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), next: nextPath }),
      })
      const data = (await res.json()) as { error?: string; success?: boolean }
      if (!res.ok || data.error) {
        setMessage({ type: 'error', text: data.error ?? 'Failed to send magic link' })
        setIsLoading(false)
        return
      }
      setMessage({
        type: 'success',
        text: 'Check your email for the magic link to sign in.',
      })
      setIsLoading(false)
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'An error occurred',
      })
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Checking authentication...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full">
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-4 min-h-[3.5rem] items-center">
            {logoError ? (
              <span className="text-xl font-bold text-navy">Bornfidis</span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoSrc}
                alt="Bornfidis"
                className="h-14 w-auto object-contain"
                onError={() => {
                  if (logoSrc.includes('logo-lockup')) setLogoSrc('/logo.png')
                  else setLogoError(true)
                }}
              />
            )}
          </div>
          <h1 className="text-3xl font-bold text-navy mb-2">Sign in</h1>
          <p className="text-gray-600 text-sm">
            Enter the email you use for Digital Studio purchases to open your library.
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
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-navy text-white rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send magic link'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          This signs you into your customer library — not the admin panel.
        </p>
      </div>
    </div>
  )
}

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <CustomerLoginForm />
    </Suspense>
  )
}
