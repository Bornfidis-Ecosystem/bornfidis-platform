import Link from 'next/link'

const paths = [
  {
    title: 'Book an Event',
    description: 'Host a faith-anchored meal for your community.',
    href: '/book',
    buttonText: 'Book Now',
    color: 'bg-[#FFBC00] text-[#1a5f3f] hover:bg-gold-dark',
  },
  {
    title: 'Join as Chef',
    description: 'Partner with us to serve regenerative meals.',
    href: '/chef/apply',
    buttonText: 'Apply',
    color: 'bg-[#1a5f3f] text-white hover:bg-[#154a32]',
  },
  {
    title: 'Join as Farmer',
    description: 'Supply regenerative ingredients to our network.',
    href: '/farm/apply',
    buttonText: 'Apply',
    color: 'bg-[#1a5f3f] text-white hover:bg-[#154a32]',
  },
  {
    title: 'Launch a Region',
    description: 'Bring Bornfidis to your community.',
    href: '/replicate/apply-leader',
    buttonText: 'Learn More',
    color: 'bg-[#FFBC00] text-[#1a5f3f] hover:bg-gold-dark',
  },
  {
    title: 'Invest in Impact',
    description: 'Support regenerative agriculture and community development.',
    href: '/replicate/invest',
    buttonText: 'Invest',
    color: 'bg-[#1a5f3f] text-white hover:bg-[#154a32]',
  },
  {
    title: 'Apply for Housing',
    description: 'Join our community-owned housing program.',
    href: '/housing',
    buttonText: 'Apply',
    color: 'bg-[#FFBC00] text-[#1a5f3f] hover:bg-gold-dark',
  },
]

export default function HomePaths() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a5f3f] mb-4">Choose Your Path</h2>
          <div className="h-1 w-24 bg-[#FFBC00] mx-auto mb-6"></div>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Whether you're hosting an event, joining our network, or investing in impact,
            there's a path for you in the Bornfidis movement.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map((path) => (
            <div
              key={path.title}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold text-[#1a5f3f] mb-3">{path.title}</h3>
              <p className="text-gray-600 mb-4">{path.description}</p>
              <Link
                href={path.href}
                className={`inline-block px-6 py-2 rounded-lg font-semibold transition ${path.color}`}
              >
                {path.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
