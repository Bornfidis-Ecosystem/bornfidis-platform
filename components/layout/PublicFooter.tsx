import Link from 'next/link'
import Image from 'next/image'

export default function PublicFooter() {
  return (
    <footer className="bg-navy text-white w-full">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* About */}
          <div>
            <Image
              src="/brand/icons/icon-anchor-gold.png"
              alt="Bornfidis"
              width={40}
              height={40}
              className="h-10 w-10 object-contain mb-3"
            />
            <h3 className="text-lg font-semibold mb-4 text-gold">About Bornfidis</h3>
            <p className="text-green-100 text-sm mb-4">
              Regenerating land, people, and enterprise through faith-anchored food and fellowship.
            </p>
            <div className="h-1 w-16 bg-gold"></div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/story" className="text-green-100 hover:text-gold transition">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/book" className="text-green-100 hover:text-gold transition">
                  Provisions
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-green-100 hover:text-gold transition">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/impact" className="text-green-100 hover:text-gold transition">
                  Impact
                </Link>
              </li>
              <li>
                <Link href="/dashboard/library" className="text-green-100 hover:text-gold transition">
                  My Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Academy — all four products */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gold">Academy</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/academy" className="text-green-100 hover:text-gold transition">
                  All Academy
                </Link>
              </li>
              <li>
                <Link href="/academy/regenerative-enterprise-foundations" className="text-green-100 hover:text-gold transition">
                  Regenerative Enterprise Foundations
                </Link>
              </li>
              <li>
                <Link href="/academy/regenerative-farmer-blueprint" className="text-green-100 hover:text-gold transition">
                  Regenerative Farmer Blueprint
                </Link>
              </li>
              <li>
                <Link href="/academy/vermont-contractor-foundations" className="text-green-100 hover:text-gold transition">
                  Vermont Contractor Foundations
                </Link>
              </li>
              <li>
                <Link href="/academy/jamaican-chef-enterprise-system" className="text-green-100 hover:text-gold transition">
                  Jamaican Chef Enterprise System
                </Link>
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gold">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/chefs" className="text-green-100 hover:text-gold transition">
                  Chefs
                </Link>
              </li>
              <li>
                <Link href="/farmers" className="text-green-100 hover:text-gold transition">
                  Farmers
                </Link>
              </li>
              <li>
                <Link href="/stories" className="text-green-100 hover:text-gold transition">
                  Stories
                </Link>
              </li>
              <li>
                <Link href="/launch" className="text-green-100 hover:text-gold transition">
                  Launch
                </Link>
              </li>
              <li>
                <Link href="/cooperative" className="text-green-100 hover:text-gold transition">
                  Cooperative
                </Link>
              </li>
              <li>
                <Link href="/replicate" className="text-green-100 hover:text-gold transition">
                  Replicate
                </Link>
              </li>
              <li>
                <Link href="/testament" className="text-green-100 hover:text-gold transition">
                  Testament
                </Link>
              </li>
              <li>
                <Link href="/housing" className="text-green-100 hover:text-gold transition">
                  Housing
                </Link>
              </li>
              <li>
                <Link href="/legacy" className="text-green-100 hover:text-gold transition">
                  Legacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Join */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gold">Join the Movement</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/replicate/apply-leader" className="text-green-100 hover:text-gold transition">
                  Launch a Region
                </Link>
              </li>
              <li>
                <Link href="/replicate/invest" className="text-green-100 hover:text-gold transition">
                  Invest in Impact
                </Link>
              </li>
              <li>
                <Link href="/chef/apply" className="text-green-100 hover:text-gold transition">
                  Become a Chef
                </Link>
              </li>
              <li>
                <Link href="/farm/apply" className="text-green-100 hover:text-gold transition">
                  Become a Farmer
                </Link>
              </li>
            </ul>
          </div>

          {/* Covenant */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gold">Our Covenant</h3>
            <p className="text-green-100 text-sm italic mb-4">
              "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters."
            </p>
            <p className="text-xs text-green-200">— Colossians 3:23</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-navyLight mt-8 pt-8 text-center text-sm text-green-100">
          <p>&copy; {new Date().getFullYear()} Bornfidis Provisions. All rights reserved.</p>
          <p className="mt-2">Regenerating land, people, and enterprise through faith.</p>
        </div>
      </div>
    </footer>
  )
}
