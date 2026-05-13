import type { ReactNode } from 'react'

type PageContainerProps = {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'main'
}

export function PageContainer({ children, className = '', as: As = 'div' }: PageContainerProps) {
  return <As className={`mx-auto w-full max-w-7xl px-6 md:px-10 ${className}`.trim()}>{children}</As>
}
