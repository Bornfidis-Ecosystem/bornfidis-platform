'use client'

type AdminBookingNotesCardProps = {
  value: string
  onChange: (value: string) => void
}

export function AdminBookingNotesCard({ value, onChange }: AdminBookingNotesCardProps) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span aria-hidden>📝</span>
        Internal notes
      </h2>
      <p className="mb-3 text-xs text-gray-500">Only admins see this field. Pair with Save changes below.</p>
      <label htmlFor="admin_notes" className="sr-only">
        Internal notes
      </label>
      <textarea
        id="admin_notes"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder="Call notes, follow-ups, special arrangements, issues…"
        className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-green-500 focus:ring-2 focus:ring-green-500"
      />
    </div>
  )
}
