import Image from 'next/image'

import { BrandedCard } from '@/components/ui/BrandedCard'
import { bookBody } from '@/components/booking/book-culinary-classes'

export type SignatureDishCardProps = {
  name: string
  description: string
  tag: string
  imageSrc: string
  imageAlt: string
}

export function SignatureDishCard({ name, description, tag, imageSrc, imageAlt }: SignatureDishCardProps) {
  return (
    <BrandedCard theme="culinary" className="flex h-full flex-col overflow-hidden p-0">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image src={imageSrc} alt={imageAlt} fill className="object-cover object-center" sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <h2 className="font-display text-2xl font-light italic text-[#2c2c2c] md:text-[1.65rem]">{name}</h2>
        <p className={`${bookBody} mt-3 flex-1 text-sm leading-relaxed`}>{description}</p>
        <p className="mt-6 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C9A84C]">{tag}</p>
      </div>
    </BrandedCard>
  )
}
