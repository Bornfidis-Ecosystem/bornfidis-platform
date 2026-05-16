import Image from 'next/image'
import FarmerJoinFormVoiceFirst from '@/components/farm/FarmerJoinFormVoiceFirst'
import { brandPhotos } from '@/lib/brand-photos'

export default function FarmerApplyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-forestDark text-white py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl font-bold mb-3">Island Harvest Hub</h1>
          <div className="h-1 w-32 bg-gold mx-auto mb-4"></div>
          <p className="text-green-100 text-lg">
            Join our regenerative supplier network
          </p>
        </div>
      </header>

      <div className="container mx-auto max-w-3xl px-4 -mt-8 mb-10">
        <div className="relative aspect-[21/9] overflow-hidden rounded-2xl shadow-md">
          <Image
            src={brandPhotos.cocoaHarvest}
            alt="Farmers with fresh harvest — join the Island Harvest Hub"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 48rem"
            priority
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white border-2 border-forestDark rounded-lg shadow-lg p-4 md:p-8">
          <FarmerJoinFormVoiceFirst />
        </div>

        {/* Footer */}
        <div className="mt-8 md:mt-12 text-center text-gray-500 text-sm px-4">
          <p className="italic">
            &ldquo;The earth is the Lord&apos;s, and everything in it, the world, and all who live in it.&rdquo;
          </p>
          <p className="mt-2 font-semibold">— Psalm 24:1</p>
        </div>
      </main>
    </div>
  )
}

