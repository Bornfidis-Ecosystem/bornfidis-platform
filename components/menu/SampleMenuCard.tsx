import { BrandedCard } from '@/components/ui/BrandedCard'

export type SampleMenuCardProps = {
  title: string
  lines: string[]
  note: string
}

export function SampleMenuCard({ title, lines, note }: SampleMenuCardProps) {
  return (
    <BrandedCard className="h-full flex flex-col">
      <h2 className="font-display text-xl text-brass md:text-2xl">{title}</h2>
      <ul className="mt-4 flex-1 space-y-2 text-sm text-cream/85">
        {lines.map((line) => (
          <li key={line} className="flex gap-2">
            <span className="text-brass/70">—</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 border-t border-brass/15 pt-4 text-xs text-cream/50">{note}</p>
    </BrandedCard>
  )
}
