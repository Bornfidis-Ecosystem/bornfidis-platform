import Link from 'next/link'
import { ROLE_LABELS, type InviteRole } from '@/lib/invite-copy'
import { WELCOME_CONTENT } from '@/lib/welcome-content'

export default function WelcomePageContent({ role }: { role: InviteRole }) {
  const content = WELCOME_CONTENT[role]
  const label = ROLE_LABELS[role]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {label}
        </h1>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {content.whatYouCanDo.title}
          </h2>
          <p className="text-gray-600">{content.whatYouCanDo.body}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {content.whatWeContactAbout.title}
          </h2>
          <p className="text-gray-600">{content.whatWeContactAbout.body}</p>
        </section>

        <section className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">{content.contact}</p>
        </section>

        <div className="flex flex-wrap gap-3 pt-4">
          <Link
            href={
              role === 'FARMER'
                ? '/farmer'
                : role === 'CHEF'
                  ? '/chef'
                  : role === 'PARTNER'
                    ? '/partner'
                    : '/'
            }
            className="inline-block rounded-lg bg-[#14532d] px-4 py-2 text-white font-medium hover:bg-[#0f3d22] transition"
          >
            {role === 'EDUCATOR' ? 'Go to Home' : 'Go to my area'}
          </Link>
          <Link
            href="/"
            className="inline-block rounded-lg border border-gray-300 px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
