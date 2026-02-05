'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { setSmsFallbackEnabled } from './actions'

export default function SmsFallbackToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const router = useRouter()
  const [enabled, setEnabled] = useState(initialEnabled)
  const [loading, setLoading] = useState(false)

  const handleChange = async () => {
    setLoading(true)
    try {
      const next = !enabled
      const res = await setSmsFallbackEnabled(next)
      if (res.success) {
        setEnabled(next)
        toast.success(next ? 'SMS fallback enabled' : 'SMS fallback disabled')
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to update')
      }
    } catch {
      toast.error('Failed to update')
    } finally {
      setLoading(false)
    }
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={enabled}
        onChange={handleChange}
        disabled={loading}
        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
      />
      <span>Send critical alerts by SMS when possible</span>
    </label>
  )
}
