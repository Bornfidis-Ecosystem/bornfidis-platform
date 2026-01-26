import Link from 'next/link'

export default function PublicFooter() {
  return (
    <footer className="bg-[#1a5f3f] text-white w-full">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#FFBC00]">About Bornfidis</h3>
            <p className="text-green-100 text-sm mb-4">
              Regenerating land, people, and enterprise through faith-anchored food and fellowship.
            </p>
            <div className="h-1 w-16 bg-[#FFBC00]"></div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#FFBC00]">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/story" className="text-green-100 hover:text-[#FFBC00] transition">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/book" className="text-green-100 hover:text-[#FFBC00] transition">
                  Book Event
                </Link>
              </li>
              <li>
                <Link href="/impact" className="text-green-100 hover:text-[#FFBC00] transition">
                  Impact
                </Link>
              </li>
              <li>
                <Link href="/testament" className="text-green-100 hover:text-[#FFBC00] transition">
                  Testament
                </Link>
              </li>
            </ul>
          </div>

          {/* Join */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#FFBC00]">Join the Movement</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/replicate/apply-leader" className="text-green-100 hover:text-[#FFBC00] transition">
                  Launch a Region
                </Link>
              </li>
              <li>
                <Link href="/replicate/invest" className="text-green-100 hover:text-[#FFBC00] transition">
                  Invest in Impact
                </Link>
              </li>
              <li>
                <Link href="/chef/apply" className="text-green-100 hover:text-[#FFBC00] transition">
                  Become a Chef
                </Link>
              </li>
              <li>
                <Link href="/farm/apply" className="text-green-100 hover:text-[#FFBC00] transition">
                  Become a Farmer
                </Link>
              </li>
            </ul>
          </div>

          {/* Covenant */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#FFBC00]">Our Covenant</h3>
            <p className="text-green-100 text-sm italic mb-4">
              "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters."
            </p>
            <p className="text-xs text-green-200">— Colossians 3:23</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#154a32] mt-8 pt-8 text-center text-sm text-green-100">
          <p>&copy; {new Date().getFullYear()} Bornfidis Provisions. All rights reserved.</p>
          <p className="mt-2">Regenerating land, people, and enterprise through faith.</p>
        </div>
      </div>
    </footer>
  )
}
