import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-16 text-center bg-[#F7F3EA] text-[#0F3D2E]">
      <p className="text-sm font-semibold uppercase tracking-wider text-[#9D7C2F]">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-[#25483C] max-w-md">
        That URL doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-[#C9A84C] px-6 py-3 text-sm font-medium text-[#0F3D2E] hover:opacity-90 transition"
      >
        Back to home
      </Link>
    </div>
  )
}
