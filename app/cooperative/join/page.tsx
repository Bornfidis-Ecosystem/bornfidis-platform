import CooperativeJoinForm from './CooperativeJoinForm'

export default function CooperativeJoinPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl font-bold mb-3">Join the Cooperative</h1>
          <div className="h-1 w-32 bg-[#FFBC00] mx-auto mb-4"></div>
          <p className="text-green-100 text-lg">
            Become part of the global regenerative movement
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white border-2 border-[#1a5f3f] rounded-lg shadow-lg p-8">
          <CooperativeJoinForm />
        </div>
      </main>
    </div>
  )
}
