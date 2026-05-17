import { BrandedCard } from '@/components/ui/BrandedCard'
import { bookBody } from '@/components/booking/book-culinary-classes'

export type SampleMenuCardProps = {
  title: string
  lines: string[]
  note: string
}

export function SampleMenuCard({ title, lines, note }: SampleMenuCardProps) {
  return (
    <BrandedCard theme="culinary" className="flex h-full flex-col">
      <h2 className="font-display text-xl font-normal text-[#2c2c2c] md:text-2xl">{title}</h2>
      <ul className={`${bookBody} mt-4 flex-1 space-y-2 text-sm`}>
        {lines.map((line) => (
          <li key={line} className="flex gap-2">
            <span className="text-[#C9A84C]">—</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 border-t border-[#C9A84C]/35 pt-4 font-sans text-xs text-[#2c2c2c]/55">{note}</p>
    </BrandedCard>
  )
}
