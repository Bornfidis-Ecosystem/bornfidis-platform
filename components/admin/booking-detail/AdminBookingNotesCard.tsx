'use client'

import { CulinaryCard } from '@/components/culinary-os'

type AdminBookingNotesCardProps = {
  value: string
  onChange: (value: string) => void
}

export function AdminBookingNotesCard({ value, onChange }: AdminBookingNotesCardProps) {
  return (
    <CulinaryCard>
      <h2 className="mb-stack-sm flex items-center gap-2 font-culinary-display text-title-md text-culinary-navy">
        <span aria-hidden>📝</span>
        Internal notes
      </h2>
      <p className="mb-stack-md font-culinary-sans text-body-md text-culinary-text-muted">
        Only admins see this field. Pair with Save changes below.
      </p>
      <label htmlFor="admin_notes" className="sr-only">
        Internal notes
      </label>
      <textarea
        id="admin_notes"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder="Call notes, follow-ups, special arrangements, issues…"
        className="w-full resize-y rounded-none border border-culinary-outline bg-culinary-bone px-gutter py-3 font-culinary-sans text-body-md text-culinary-ink focus:border-culinary-forest focus:outline-none focus:ring-1 focus:ring-culinary-forest/40"
      />
    </CulinaryCard>
  )
}
