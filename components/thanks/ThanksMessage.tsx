import type { ReactNode } from 'react'

import { bookBody, bookHeadline } from '@/components/booking/book-culinary-classes'

export function ThanksMessage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className={`${bookHeadline} text-xl md:text-2xl`}>{title}</h2>
      <div className={`${bookBody} mt-4 text-sm`}>{children}</div>
    </div>
  )
}
