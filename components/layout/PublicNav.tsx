'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function PublicNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/book', label: 'Provisions' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/academy', label: 'Academy' },
    { href: '/impact', label: 'Impact' },
    { href: '/story', label: 'Our Story' },
  ]

  return (
    <nav className="bg-forestDark text-white shadow-lg sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="text-xl md:text-2xl font-bold">Bornfidis</div>
            <div className="h-6 md:h-8 w-1 bg-gold"></div>
            <div className="text-xs md:text-sm text-white">Provisions</div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-all duration-200 ease-in-out whitespace-nowrap ${
                  pathname === link.href
                    ? 'bg-gold text-forest'
                    : 'text-white hover:bg-forestDarker hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard/library"
              className="px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-all duration-200 ease-in-out whitespace-nowrap text-white hover:bg-forestDarker hover:text-white"
            >
              My Library
            </Link>
            <Link
              href="/admin/login"
              className="px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-all duration-200 ease-in-out whitespace-nowrap bg-gold text-forest hover:bg-goldDark ml-1"
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
          <div className="lg:hidden border-t border-forestDarker py-4">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out ${
                    pathname === link.href
                      ? 'bg-gold text-forest'
                      : 'text-white hover:bg-forestDarker hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/dashboard/library"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out text-white hover:bg-forestDarker"
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
