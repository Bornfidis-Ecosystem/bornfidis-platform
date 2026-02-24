'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

const ACADEMY_DROPDOWN_LINKS = [
  { href: '/academy', label: 'All Academy' },
  { href: '/academy?category=Foundations', label: 'Foundations' },
  { href: '/academy?category=Farming', label: 'For Farmers' },
  { href: '/academy?category=Culinary', label: 'For Chefs' },
  { href: '/academy?category=Contracting', label: 'For Contractors' },
]

export default function PublicNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [academyDropdownOpen, setAcademyDropdownOpen] = useState(false)
  const [navLogoError, setNavLogoError] = useState(false)
  const academyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (academyRef.current && !academyRef.current.contains(e.target as Node)) {
        setAcademyDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/book', label: 'Provisions' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/impact', label: 'Impact' },
    { href: '/story', label: 'Our Story' },
  ]
  const isAcademyActive = pathname === '/academy' || pathname.startsWith('/academy/')

  return (
    <nav className="bg-navy text-white shadow-lg sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo: public/brand/icons/icon-anchor-gold.png or public/brand/logos (see docs/BRANDING_GUIDE.md) */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            {navLogoError ? (
              <>
                <div className="text-xl md:text-2xl font-bold">Bornfidis</div>
                <div className="h-6 md:h-8 w-1 bg-gold"></div>
                <div className="text-xs md:text-sm text-white">Provisions</div>
              </>
            ) : (
              <>
                <Image
                  src="/brand/icons/icon-anchor-gold.png"
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain flex-shrink-0"
                  onError={() => setNavLogoError(true)}
                />
                <div className="text-xl md:text-2xl font-bold">Bornfidis</div>
                <div className="h-6 md:h-8 w-1 bg-gold"></div>
                <div className="text-xs md:text-sm text-white">Provisions</div>
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-all duration-200 ease-in-out whitespace-nowrap ${
                  pathname === link.href
                    ? 'bg-gold text-navy'
                    : 'text-white hover:bg-navyLight hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Academy with dropdown — prominent */}
            <div
              ref={academyRef}
              className="relative"
              onMouseEnter={() => setAcademyDropdownOpen(true)}
              onMouseLeave={() => setAcademyDropdownOpen(false)}
            >
              <Link
                href="/academy"
                className={`inline-flex items-center gap-0.5 px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-all duration-200 ease-in-out whitespace-nowrap ${
                  isAcademyActive
                    ? 'bg-gold text-navy'
                    : 'text-white hover:bg-navyLight hover:text-white'
                }`}
              >
                Academy
                <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {academyDropdownOpen && (
                <div className="absolute left-0 top-full pt-1 z-50 min-w-[180px]">
                  <div className="rounded-lg border border-navyLight bg-navy shadow-xl py-2">
                    {ACADEMY_DROPDOWN_LINKS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-white hover:bg-navyLight hover:text-gold transition"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link
              href="/sportswear"
              className="px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-all duration-200 ease-in-out whitespace-nowrap text-white hover:bg-navyLight hover:text-white"
            >
              Sportswear
            </Link>
            <Link
              href="/dashboard/library"
              className="px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-all duration-200 ease-in-out whitespace-nowrap text-white hover:bg-navyLight hover:text-white"
            >
              My Library
            </Link>
            <Link
              href="/admin/login"
              className="px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-all duration-200 ease-in-out whitespace-nowrap bg-gold text-navy hover:bg-goldDark ml-1"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2 focus:outline-none focus:ring-2 focus:ring-gold rounded"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-navyLight py-4">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out ${
                    pathname === link.href
                      ? 'bg-gold text-navy'
                      : 'text-white hover:bg-navyLight hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {/* Academy + dropdown links on mobile */}
              <div className="pt-2">
                <p className="px-4 py-1 text-xs font-semibold text-gold uppercase tracking-wider">Academy</p>
                {ACADEMY_DROPDOWN_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-6 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                      item.href === '/academy' && pathname === '/academy'
                        ? 'bg-gold/20 text-gold'
                        : 'text-green-100 hover:bg-navyLight hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <Link
                href="/sportswear"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out text-white hover:bg-navyLight"
              >
                Sportswear
              </Link>
              <Link
                href="/dashboard/library"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out text-white hover:bg-navyLight"
              >
                My Library
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gold text-forest"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
