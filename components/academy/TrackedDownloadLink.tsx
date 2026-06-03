'use client'

import { trackAcademyDownloadClick } from '@/lib/academy-analytics'

interface TrackedDownloadLinkProps {
  href: string
  productSlug: string
  productTitle: string
  source: 'success_page' | 'library'
  className?: string
  children: React.ReactNode
}

/**
 * Link that fires academy_download_click before navigation.
 * Use for "Download [Product]" on success page and Download in My Library.
 */
export function TrackedDownloadLink({
  href,
  productSlug,
  productTitle,
  source,
  className,
  children,
}: TrackedDownloadLinkProps) {
  const handleClick = () => {
    trackAcademyDownloadClick(productSlug, productTitle, source)
  }
  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  )
}
