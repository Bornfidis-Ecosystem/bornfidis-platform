'use client'

import { useState } from 'react'
import { regenerateCalendarTokenAction } from './actions'

type Props = {
  initialCalendarUrl: string
  chefId: string
}

export default function CalendarSyncSection({ initialCalendarUrl, chefId }: Props) {
  const [url, setUrl] = useState(initialCalendarUrl)
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select and show
      setCopied(false)
    }
  }

  async function handleRegenerate() {
    setRegenerating(true)
    try {
      const result = await regenerateCalendarTokenAction(chefId)
      if ('url' in result) {
        setUrl(result.url)
      }
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <section className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Add to Calendar</h2>
      <p className="text-sm text-gray-600 mb-3">
        Subscribe to your Bornfidis bookings in Google Calendar, Apple Calendar, or Outlook. Only confirmed bookings appear. Read-only—no edits from the calendar.
      </p>
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <input
          type="text"
          readOnly
          value={url}
          className="flex-1 min-w-0 text-sm border border-gray-300 rounded px-3 py-2 bg-white font-mono"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="px-3 py-2 border border-[#1a5f3f] text-[#1a5f3f] rounded font-medium text-sm hover:bg-[#1a5f3f] hover:text-white transition"
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={regenerating}
          className="text-sm text-amber-600 hover:underline disabled:opacity-50"
        >
          {regenerating ? 'Regenerating…' : 'Regenerate link (invalidates old link)'}
        </button>
      </div>
      <div className="text-sm text-gray-700 space-y-2">
        <p className="font-medium">Add to Google Calendar:</p>
        <ol className="list-decimal list-inside space-y-1 text-gray-600">
          <li>Open Google Calendar → Settings (gear) → Add calendar → From URL</li>
          <li>Paste the link above and click Add calendar</li>
          <li>New or cancelled bookings will update automatically</li>
        </ol>
        <p className="font-medium mt-2">Apple Calendar / Outlook:</p>
        <p className="text-gray-600">
          Use “Subscribe to calendar” or “Add calendar from URL” and paste the same link.
        </p>
      </div>
    </section>
  )
}
