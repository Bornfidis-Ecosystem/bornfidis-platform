'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY_ASKED = 'bornfidis_push_asked'

/**
 * Phase 2AK — One-time prompt to enable notifications; subscribes and saves to API.
 */
export default function PushOptIn() {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) return
    if (Notification.permission !== 'default') return
    try {
      if (localStorage.getItem(STORAGE_KEY_ASKED) === '1') return
    } catch {
      return
    }
    // Small delay so we don't prompt immediately on load
    const t = setTimeout(() => setShow(true), 2000)
    return () => clearTimeout(t)
  }, [])

  const enable = async () => {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setShow(false)
        try { localStorage.setItem(STORAGE_KEY_ASKED, '1') } catch {}
        return
      }
      const res = await fetch('/api/push/vapid-public')
      if (!res.ok) throw new Error('VAPID not configured')
      const { publicKey } = await res.json()
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })
      const body = {
        subscription: {
          endpoint: sub.endpoint,
          keys: { p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))), auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!))) },
        },
      }
      const subRes = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscriptionJson }),
      })
      if (!subRes.ok) throw new Error('Subscribe failed')
      try { localStorage.setItem(STORAGE_KEY_ASKED, '1') } catch {}
      setShow(false)
    } catch (e) {
      console.error('Push enable error:', e)
    } finally {
      setLoading(false)
    }
  }

  const dismiss = () => {
    setShow(false)
    try { localStorage.setItem(STORAGE_KEY_ASKED, '1') } catch {}
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:bottom-4 md:left-auto md:right-4 md:max-w-sm rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="text-sm font-medium text-gray-900">Enable notifications?</p>
      <p className="text-xs text-gray-500 mt-0.5">Get instant alerts for new bookings and reminders.</p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={enable}
          disabled={loading}
          className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Enabling…' : 'Enable'}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Not now
        </button>
      </div>
    </div>
  )
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}
