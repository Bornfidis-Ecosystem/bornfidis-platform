import type { ReactNode } from 'react'

type PageContainerProps = {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'main'
  /** Editorial /book layout — 1440px canvas per Culinary OS prototype */
  wide?: boolean
}

export function PageContainer({ children, className = '', as: As = 'div', wide = false }: PageContainerProps) {
  const max = wide ? 'max-w-[1440px]' : 'max-w-7xl'
  const pad = wide ? 'px-6 md:px-16' : 'px-6 md:px-10'
  return <As className={`mx-auto w-full ${max} ${pad} ${className}`.trim()}>{children}</As>
}
