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
    <div className="py-12 text-center">
      <p className="text-lg text-gray-500">{title}</p>
      {description ? <p className="mt-2 text-sm text-gray-400">{description}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  )
}
