'use client'

import { useEffect, useState } from 'react'

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

/**
 * Phase 2AK — Toggle to disable/re-enable push notifications (per device).
 */
export default function NotificationsToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      setEnabled(false)
      return
    }
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => setEnabled(!!sub))
    )
  }, [])

  const turnOff = async () => {
    if (enabled !== true || loading) return
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
        setEnabled(false)
      }
    } catch (e) {
      console.error('Push turnOff error:', e)
    } finally {
      setLoading(false)
    }
  }

  const turnOn = async () => {
    if (enabled !== false || loading) return
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return
      const res = await fetch('/api/push/vapid-public')
      if (!res.ok) throw new Error('VAPID not configured')
      const { publicKey } = await res.json()
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })
      const subscriptionJson = sub.toJSON ? sub.toJSON() : {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.getKey('p256dh'), auth: sub.getKey('auth') },
      }
      if (subscriptionJson.keys?.p256dh instanceof ArrayBuffer) {
        subscriptionJson.keys.p256dh = btoa(String.fromCharCode(...new Uint8Array(subscriptionJson.keys.p256dh)))
      }
      if (subscriptionJson.keys?.auth instanceof ArrayBuffer) {
        subscriptionJson.keys.auth = btoa(String.fromCharCode(...new Uint8Array(subscriptionJson.keys.auth)))
      }
      const subRes = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscriptionJson }),
      })
      if (!subRes.ok) throw new Error('Subscribe failed')
      setEnabled(true)
    } catch (e) {
      console.error('Push turnOn error:', e)
    } finally {
      setLoading(false)
    }
  }

  if (enabled === null) return <span className="text-sm text-gray-500">Checking…</span>

  return (
    <div className="flex flex-col gap-2 text-sm">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={() => (enabled ? turnOff() : turnOn())}
          disabled={loading}
          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <span>{enabled ? 'Browser notifications on' : 'Browser notifications off'}</span>
      </label>
      {!enabled && (
        <p className="text-gray-500 text-xs">
          Enable to get instant alerts for new bookings, reminders, and updates.
        </p>
      )}
    </div>
  )
}
