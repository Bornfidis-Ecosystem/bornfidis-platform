'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function PublicNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/story', label: 'Our Story' },
    { href: '/launch', label: 'Launch' },
    { href: '/stories', label: 'Stories' },
    { href: '/book', label: 'Book Event' },
    { href: '/chefs', label: 'Chefs' },
    { href: '/farmers', label: 'Farmers' },
    { href: '/cooperative', label: 'Cooperative' },
    { href: '/replicate', label: 'Replicate' },
    { href: '/impact', label: 'Impact' },
    { href: '/testament', label: 'Testament' },
    { href: '/housing', label: 'Housing' },
    { href: '/legacy', label: 'Legacy' },
  ]

  return (
    <nav className="bg-[#1a5f3f] text-white shadow-lg sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="text-xl md:text-2xl font-bold">Bornfidis</div>
            <div className="h-6 md:h-8 w-1 bg-[#FFBC00]"></div>
            <div className="text-xs md:text-sm text-green-100">Provisions</div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition whitespace-nowrap ${
                  pathname === link.href
                    ? 'bg-[#FFBC00] text-[#1a5f3f]'
                    : 'text-green-100 hover:bg-[#154a32] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2 focus:outline-none focus:ring-2 focus:ring-[#FFBC00] rounded"
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
          <div className="lg:hidden border-t border-[#154a32] py-4">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    pathname === link.href
                      ? 'bg-[#FFBC00] text-[#1a5f3f]'
                      : 'text-green-100 hover:bg-[#154a32] hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
