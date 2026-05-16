import type { ReactNode } from 'react'

type CulinaryDashboardShellProps = {
  children: ReactNode
  /** Optional asymmetrical grid wrapper for dashboard home plates */
  className?: string
}

/**
 * Inner canvas wrapper — use inside CulinaryAdminChrome for consistent max-width and horizontal padding.
 * Children already receive padding from chrome; use this when a page needs an extra grid shell.
 */
export function CulinaryDashboardShell({ children, className = '' }: CulinaryDashboardShellProps) {
  return <div className={`w-full ${className}`.trim()}>{children}</div>
}
