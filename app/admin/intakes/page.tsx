import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import SignOutButton from '@/components/admin/SignOutButton'
import ReprocessIntakeButton from '@/components/admin/ReprocessIntakeButton'
import Link from 'next/link'

interface ParsedJson {
  name?: string | null
  parish?: string | null
  acres?: number | null
  crops?: string[]
  confidence?: 'high' | 'medium' | 'low'
  notes?: string[]
}

async function getIntakes() {
  await requireAuth()

  try {
    const intakes = await db.farmerIntake.findMany({
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            parish: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return { intakes, error: null }
  } catch (error: any) {
    console.error('Error fetching intakes:', error)
    return { 
      intakes: [], 
      error: error.message || 'Failed to fetch intakes. Please check your database connection.' 
    }
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'received':
      return 'bg-gray-100 text-gray-800'
    case 'parsed':
      return 'bg-blue-100 text-blue-800'
    case 'profile_created':
      return 'bg-green-100 text-green-800'
    case 'needs_review':
      return 'bg-amber-100 text-amber-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getPreviewText(intake: any): string {
  // Prefer transcript, then messageText
  if (intake.transcript) {
    return intake.transcript
  }
  if (intake.messageText) {
    return intake.messageText
  }
  return ''
}

function getCropsFromParsedJson(parsedJson: ParsedJson | null): string[] {
  if (!parsedJson || !parsedJson.crops) {
    return []
  }
  return parsedJson.crops.slice(0, 3) // Max 3 crops
}

export default async function IntakesPage() {
  const { intakes, error: fetchError } = await getIntakes()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-forestDark text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin/farmers" className="text-green-100 hover:text-white mb-2 inline-block">
                ← Back to Farmers
              </Link>
              <h1 className="text-2xl font-bold">Farmer Intakes</h1>
              <p className="text-gold text-sm mt-1">
                {fetchError ? 'Connection error' : `${intakes.length} intake${intakes.length !== 1 ? 's' : ''} (last 50)`}
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {fetchError ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden p-8">
            <div className="text-center">
              <div className="text-red-600 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Database Connection Error</h2>
              <p className="text-gray-600 mb-4">{fetchError}</p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left max-w-2xl mx-auto">
                <h3 className="font-semibold text-amber-900 mb-2">Troubleshooting Steps:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-amber-800">
                  <li><strong>If you see "Not IPv4 compatible" in Supabase:</strong> Use <strong>Session Pooler</strong> (port 6543) instead of direct connection</li>
                  <li>Update your <code className="bg-amber-100 px-1 rounded">.env</code> file with the <strong>Session Pooler</strong> connection string from Supabase Dashboard</li>
                  <li>Format: <code className="bg-amber-100 px-1 rounded">postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require</code></li>
                  <li>Verify your Supabase project is active (not paused)</li>
                  <li>Restart your dev server after updating <code className="bg-amber-100 px-1 rounded">.env</code></li>
                </ol>
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  <strong>Note:</strong> Session Pooler works for runtime queries. For migrations, apply them manually via Supabase SQL Editor.
                </div>
              </div>
              <Link
                href="/admin/intakes"
                className="inline-block mt-6 px-6 py-2 bg-forestDark text-white rounded-lg hover:bg-[#154a32] transition-colors"
              >
                Try Again
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Channel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preview
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Farmer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {intakes.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        No intakes yet.
                      </td>
                    </tr>
                  ) : (
                    intakes.map((intake) => {
                      const previewText = getPreviewText(intake)
                      const parsedJson = intake.parsedJson as ParsedJson | null
                      const crops = getCropsFromParsedJson(parsedJson)
                      
                      return (
                        <tr key={intake.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(intake.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {intake.channel}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {intake.fromPhone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {intake.mediaContentType ? (
                              <span className="text-gold">🎙️ Voice</span>
                            ) : (
                              <span>💬 Text</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(intake.status)}`}>
                              {intake.status}
                            </span>
                            {intake.error && (
                              <span className="ml-2 text-xs text-red-600" title={intake.error}>
                                ⚠️
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                            <div className="space-y-1">
                              {previewText ? (
                                <div className="truncate" title={previewText}>
                                  {previewText.substring(0, 80)}
                                  {previewText.length > 80 ? '...' : ''}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                              {crops.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {crops.map((crop, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-forestDark/10 text-forestDark border border-forestDark/20"
                                    >
                                      {crop}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {intake.farmer ? (
                              <div>
                                <Link
                                  href={`/admin/farmers/${intake.farmer.id}`}
                                  className="font-medium text-forestDark hover:text-[#154a32]"
                                >
                                  {intake.farmer.name}
                                </Link>
                                {intake.farmer.parish && (
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {intake.farmer.parish}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <ReprocessIntakeButton intakeId={intake.id} />
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

