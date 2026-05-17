import Link from 'next/link'

const links = [
  { href: '/experience', label: 'Experience' },
  { href: '/menu', label: 'Menus' },
  { href: '/story', label: 'Story' },
  { href: '/book', label: 'Book' },
  { href: '/contact', label: 'Contact' },
] as const

/** Minimal guest footer for public marketing shell pages. */
export function PublicEditorialFooter() {
  return (
    <footer className="border-t border-[#C9A84C]/35 bg-[#fdf8f8] px-6 py-16 text-center md:px-16 md:py-20">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Footer">
          {links.map((l, i) => (
            <span key={l.href} className="inline-flex items-center gap-6">
              {i > 0 ? <span className="text-[#2c2c2c]/25" aria-hidden>·</span> : null}
              <Link
                href={l.href}
                className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#2c2c2c]/65 no-underline transition hover:text-[#C9A84C]"
              >
                {l.label}
              </Link>
            </span>
          ))}
        </nav>
        <p className="mt-10 font-sans text-xs text-[#2c2c2c]/50">
          © 2026 Bornfidis Provisions · Vermont &amp; Jamaica
        </p>
        <a
          href="mailto:reservations@bornfidis.com"
          className="mt-3 font-sans text-xs text-[#2c2c2c]/65 no-underline transition hover:text-[#C9A84C]"
        >
          reservations@bornfidis.com
        </a>
      </div>
    </footer>
  )
}
