'use client'

import toast from 'react-hot-toast'

export default function CopyTextButton({
  text,
  label = 'Copy',
  className = 'text-xs px-2.5 py-1 border border-navy/20 rounded-md font-semibold text-navy hover:bg-navy hover:text-white transition',
}: {
  text: string
  label?: string
  className?: string
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          toast.success(`Copied (${time})`)
        } catch {
          toast.error('Copy failed')
        }
      }}
    >
      {label}
    </button>
  )
}
