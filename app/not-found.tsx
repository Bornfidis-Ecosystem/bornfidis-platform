import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center bg-bone px-6 py-16 text-center text-[#1a1a1a]">
      <p className="font-sans text-sm font-semibold uppercase tracking-wider text-[#ffbc00]">404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-[#1a1a1a]/70">
        That URL doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-none bg-[#002747] px-6 py-3 font-sans text-sm font-semibold uppercase tracking-[0.1em] text-[#faf6f0] transition hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  )
}
