import PassiveIncomeCard from '@/components/passive/PassiveIncomeCard'

export const dynamic = 'force-dynamic'

/** Inline icons (Lucide-style). Install lucide-react and use <ClipboardList /> etc. if you prefer. */
const IconClipboard = () => (
  <svg
    width={32}
    height={32}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-goldAccent"
    aria-hidden
  >
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M9 14h6M9 10h6" />
  </svg>
)
const IconCalculator = () => (
  <svg
    width={32}
    height={32}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-goldAccent"
    aria-hidden
  >
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6h8M8 10h8M8 14h2M14 14h2M8 18h2M14 18h2" />
  </svg>
)
const IconFileCheck = () => (
  <svg
    width={32}
    height={32}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-goldAccent"
    aria-hidden
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M9 15l2 2 4-4" />
  </svg>
)

export default function PassiveIncomePage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-forest mb-8">
        Bornfidis Passive Income Tools
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PassiveIncomeCard
          icon={<IconClipboard />}
          title="Farmer Intake & Profile Sheet"
          description="Create a professional farmer profile to attract reliable buyers."
          price="FREE"
          roles={['FARMER']}
          href="/resources/templates/farmer-intake-profile"
        />

        <PassiveIncomeCard
          icon={<IconCalculator />}
          title="Produce Pricing Calculator"
          description="Know your minimum price so you never sell at a loss."
          price="JMD $1,500"
          roles={['FARMER']}
          href="/resources/templates/produce-pricing-calculator"
          priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_PRICING_CALCULATOR}
        />

        <PassiveIncomeCard
          icon={<IconFileCheck />}
          title="Chef–Farmer Order Agreement"
          description="Set clear expectations to prevent disputes."
          price="JMD $2,000"
          roles={['FARMER', 'CHEF']}
          href="/resources/templates/chef-farmer-order-agreement"
          priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_ORDER_AGREEMENT}
        />
      </div>
    </main>
  )
}

