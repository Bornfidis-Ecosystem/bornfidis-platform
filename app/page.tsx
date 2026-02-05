import Link from 'next/link';
import { FeaturedChefsSection } from '@/components/FeaturedChefsSection';

export default async function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-10 bg-gradient-to-b from-green-50 to-white">
      <h1 className="text-3xl font-bold text-green-900 mb-2">Bornfidis Platform</h1>
      <p className="text-gray-700 mb-8 text-center max-w-md">
        Regenerating land, people, and enterprise.
      </p>
      <FeaturedChefsSection />
      <Link
        href="/admin/login"
        className="px-6 py-3 bg-green-800 text-white font-semibold rounded-lg hover:bg-green-900 transition mt-8"
      >
        Enter Platform
      </Link>
    </main>
  );
}
