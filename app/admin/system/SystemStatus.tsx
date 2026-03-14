'use client'

import { useEffect, useState } from 'react'

type HealthData = {
  status?: string
  environment?: string
  services?: { database?: string; supabase?: string }
  error?: string
}

export default function SystemStatus() {
  const [data, setData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/health')
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch(() => {
        if (!cancelled) setData({ error: 'Failed to fetch health' })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <p className="text-sm text-gray-500">Loading…</p>
  }

  if (data?.error) {
    return (
      <p className="text-sm text-red-600">
        {data.error}
      </p>
    )
  }

  const statusLabel = (value: string | undefined) => {
    if (value === 'connected' || value === 'ok') return { text: 'OK', className: 'text-green-600' }
    if (value === 'error') return { text: 'Error', className: 'text-red-600' }
    return { text: value || '—', className: 'text-gray-600' }
  }

  const op = statusLabel(data?.status)
  const db = statusLabel(data?.services?.database)
  const auth = statusLabel(data?.services?.supabase)

  return (
    <ul className="space-y-2 text-sm">
      <li>
        <span className="font-medium text-gray-700">Operational status:</span>{' '}
        <span className={op.className}>{op.text}</span>
      </li>
      <li>
        <span className="font-medium text-gray-700">Database:</span>{' '}
        <span className={db.className}>{db.text}</span>
      </li>
      <li>
        <span className="font-medium text-gray-700">Auth (Supabase):</span>{' '}
        <span className={auth.className}>{auth.text}</span>
      </li>
    </ul>
  )
}
