import Link from 'next/link'

const btnPrimaryClass =
  'inline-flex min-h-[48px] items-center justify-center rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-midnight shadow-md transition hover:bg-brass'

const btnGhostClass =
  'inline-flex min-h-[48px] items-center justify-center rounded-full border border-midnight/15 px-8 py-3.5 text-sm font-medium text-midnight transition hover:bg-midnight hover:text-cream'

export function ThanksActionButtons() {
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
      <Link href="/" className={btnPrimaryClass}>
        Return to Home
      </Link>
      <Link href="/menu" className={btnGhostClass}>
        View Sample Menus
      </Link>
    </div>
  )
}
