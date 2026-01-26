import ImpactInvestorForm from './ImpactInvestorForm'

export default function InvestPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#FFBC00] text-[#1a5f3f] py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl font-bold mb-3">Impact Investor Portal</h1>
          <div className="h-1 w-32 bg-[#1a5f3f] mx-auto mb-4"></div>
          <p className="text-[#1a5f3f] text-lg">
            Invest in the global replication of regenerative food systems
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white border-2 border-[#FFBC00] rounded-lg shadow-lg p-8">
          <ImpactInvestorForm />
        </div>
      </main>
    </div>
  )
}
