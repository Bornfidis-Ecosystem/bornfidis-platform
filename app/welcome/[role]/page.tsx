import Link from 'next/link'
import { notFound } from 'next/navigation'

const FOOTER_NOTE =
  "Questions or ideas? You'll be able to reach the Bornfidis team when needed."

const WELCOME_CONTENT: Record<
  string,
  { body: string; bullets: string[]; footer: string }
> = {
  farmer: {
    body: "You're here because you grow food and care about quality and fairness. Bornfidis connects farmers with chefs and communities who value reliable, locally grown produce.",
    bullets: [
      "You'll see opportunities that match what you grow",
      "We'll contact you when something fits",
      "You decide when and how you participate",
    ],
    footer:
      "There's nothing you need to do right now. Take your time and explore.",
  },
  chef: {
    body: "You're here because you value quality ingredients and reliable local sourcing. Bornfidis connects chefs directly with trusted farmers—no middlemen, no confusion.",
    bullets: [
      "You'll see sourcing opportunities when available",
      "We'll reach out with details you can review calmly",
      "You choose what works for your kitchen",
    ],
    footer: "No commitments required. This is about fit, not pressure.",
  },
  educator: {
    body: "You're here because you teach, mentor, or guide others—and care about sustainable food systems. Bornfidis values educators as leaders in building knowledge, skills, and community trust.",
    bullets: [
      "You may be invited to share insight, guidance, or learning opportunities",
      "We'll connect when your experience aligns with a need",
      "You choose how involved you want to be",
    ],
    footer: "Observe first. Participate when it feels right.",
  },
  partner: {
    body: "You're here because you support initiatives that strengthen local food systems and communities. Bornfidis collaborates with partners who value long-term impact over short-term gain.",
    bullets: [
      "You'll see ways to support or collaborate",
      "We'll reach out when alignment is clear",
      "You decide your level of involvement",
    ],
    footer: "This is an open door, not an obligation.",
  },
}

const VALID_ROLES = ['farmer', 'chef', 'educator', 'partner'] as const

export default async function WelcomeRolePage({
  params,
}: {
  params: Promise<{ role: string }>
}) {
  const { role } = await params
  const slug = role?.toLowerCase()
  if (!slug || !VALID_ROLES.includes(slug as (typeof VALID_ROLES)[number])) {
    notFound()
  }

  const content = WELCOME_CONTENT[slug] ?? WELCOME_CONTENT.partner

  return (
    <main className="min-h-screen p-6 max-w-xl mx-auto space-y-5">
      <h1 className="text-xl font-semibold text-gray-900">
        Welcome to Bornfidis
      </h1>

      <p className="text-gray-700">{content.body}</p>

      <div>
        <h2 className="text-sm font-semibold text-gray-800 mb-2">
          What happens next
        </h2>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          {content.bullets.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-gray-600">{content.footer}</p>

      <p className="text-xs text-gray-500 pt-2">{FOOTER_NOTE}</p>

      <p className="pt-4">
        <Link
          href="/"
          className="text-sm text-green-700 font-medium hover:underline"
        >
          Go to Home
        </Link>
      </p>
    </main>
  )
}
