'use client'

import { useState } from 'react'

export function CopyTextButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="rounded-none border border-culinary-outline bg-white px-3 py-1.5 font-culinary-sans text-xs font-semibold text-culinary-navy"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
