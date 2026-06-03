import type { ReactNode } from 'react'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="py-stack-xl text-center font-culinary-sans">
      <p className="text-body-lg text-culinary-text-muted">{title}</p>
      {description ? <p className="mt-stack-sm text-body-md text-culinary-text-muted/80">{description}</p> : null}
      {action ? <div className="mt-stack-md flex justify-center">{action}</div> : null}
    </div>
  )
}
