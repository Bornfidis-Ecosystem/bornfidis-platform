import Link from 'next/link'
import Image from 'next/image'
import { brandAssets } from '@/lib/brand-assets'

export default function PublicFooter() {
  return (
    <footer className="w-full border-t border-[#C9A84C]/30 bg-[#fdf8f8] text-[#2c2c2c]">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* About */}
          <div>
            <Image
              src={brandAssets.iconGold}
              alt="Bornfidis"
              width={40}
              height={40}
              className="h-10 w-10 object-contain mb-3"
            />
            <h3 className="mb-4 font-display text-lg font-normal text-[#2c2c2c]">About Bornfidis</h3>
            <p className="mb-4 font-sans text-sm text-[#2c2c2c]/75">
              Regenerating land, people, and enterprise through faith-anchored food and fellowship.
            </p>
            <div className="h-px w-16 bg-[#C9A84C]" />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-display text-lg font-normal text-[#2c2c2c]">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/story" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Story
                </Link>
              </li>
              <li>
                <Link href="/book" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Provisions
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/impact" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Impact
                </Link>
              </li>
              <li>
                <Link href="/sportswear" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Sportswear
                </Link>
              </li>
              <li>
                <Link href="/dashboard/library" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  My Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Academy — all four products */}
          <div>
            <h3 className="mb-4 font-display text-lg font-normal text-[#2c2c2c]">Academy</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/academy" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  All Academy
                </Link>
              </li>
              <li>
                <Link href="/academy/regenerative-enterprise-foundations" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Regenerative Enterprise Foundations
                </Link>
              </li>
              <li>
                <Link href="/academy/regenerative-farmer-blueprint" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Regenerative Farmer Blueprint
                </Link>
              </li>
              <li>
                <Link href="/academy/vermont-contractor-foundations" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Vermont Contractor Foundations
                </Link>
              </li>
              <li>
                <Link href="/academy/jamaican-chef-enterprise-system" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Jamaican Chef Enterprise System
                </Link>
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-4 font-display text-lg font-normal text-[#2c2c2c]">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/chefs" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Chefs
                </Link>
              </li>
              <li>
                <Link href="/farmers" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Farmers
                </Link>
              </li>
              <li>
                <Link href="/stories" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Stories
                </Link>
              </li>
              <li>
                <Link href="/launch" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Launch
                </Link>
              </li>
              <li>
                <Link href="/cooperative" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Cooperative
                </Link>
              </li>
              <li>
                <Link href="/replicate" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Replicate
                </Link>
              </li>
              <li>
                <Link href="/testament" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Testament
                </Link>
              </li>
              <li>
                <Link href="/housing" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Housing
                </Link>
              </li>
              <li>
                <Link href="/legacy" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Legacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Join */}
          <div>
            <h3 className="mb-4 font-display text-lg font-normal text-[#2c2c2c]">Join the Movement</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/replicate/apply-leader" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Launch a Region
                </Link>
              </li>
              <li>
                <Link href="/replicate/invest" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Invest in Impact
                </Link>
              </li>
              <li>
                <Link href="/chef/apply" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Become a Chef
                </Link>
              </li>
              <li>
                <Link href="/farm/apply" className="font-sans text-[#2c2c2c]/70 transition hover:text-[#C9A84C]">
                  Become a Farmer
                </Link>
              </li>
            </ul>
          </div>

          {/* Covenant */}
          <div>
            <h3 className="mb-4 font-display text-lg font-normal text-[#2c2c2c]">Our Covenant</h3>
            <p className="mb-4 font-sans text-sm italic text-[#2c2c2c]/75">
              "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters."
            </p>
            <p className="font-sans text-xs text-[#2c2c2c]/55">— Colossians 3:23</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-[#C9A84C]/25 pt-8 text-center font-sans text-sm text-[#2c2c2c]/60">
          <p>&copy; {new Date().getFullYear()} Bornfidis Provisions. All rights reserved.</p>
          <p className="mt-2">Regenerating land, people, and enterprise through faith.</p>
        </div>
      </div>
    </footer>
  )
}
