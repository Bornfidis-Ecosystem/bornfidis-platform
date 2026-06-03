// ARCHIVED: One-off migration script. Do not re-run.
// Completed: 2026-05-16

/**
 * One-shot: dashboard client shells → CulinaryCard + closing tag fix pass.
 * Run: node scripts/_migrate-dashboard-clients.mjs
 */
import { readFileSync, writeFileSync } from 'fs'

const FILES = [
  'app/admin/replication/ReplicationDashboardClient.tsx',
  'app/admin/cooperative/CooperativeDashboardClient.tsx',
  'app/admin/harvest/HarvestDashboardClient.tsx',
  'app/admin/legacy/LegacyDashboardClient.tsx',
  'app/admin/testament/TestamentDashboardClient.tsx',
  'app/admin/housing/HousingDashboardClient.tsx',
  'app/admin/impact/ImpactDashboardClient.tsx',
  'app/admin/ops/OpsDashboardClient.tsx',
  'app/admin/coordinator/CoordinatorDashboardClient.tsx',
  'app/admin/stories/StoriesDashboardClient.tsx',
  'app/admin/risks/RisksClient.tsx',
  'app/admin/forecast/ForecastClient.tsx',
  'app/admin/forecast/ai/AiDemandForecastClient.tsx',
  'app/admin/leaderboard/LeaderboardAdminClient.tsx',
  'app/admin/succession/SuccessionClient.tsx',
]

const OPEN_REPLACEMENTS = [
  // Replication / Cooperative metric & similar
  ['<div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">', '<CulinaryCard>'],
  ['<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">', '<CulinaryCard>'],
  ['<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">', '<CulinaryCard>'],
  ['<div className="bg-white rounded-lg shadow-sm border border-gray-200">', '<CulinaryCard padded={false}>'],
  ['<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">', '<CulinaryCard padded={false} className="overflow-hidden">'],
  // Impact accent borders
  ['<div className="bg-white rounded-lg shadow-sm p-6 border-2 border-forestDark">', '<CulinaryCard className="border-2 border-forestDark">'],
  ['<div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gold">', '<CulinaryCard className="border-2 border-gold">'],
  ['<div className="bg-white rounded-lg shadow-sm p-6 border-2 border-green-500">', '<CulinaryCard className="border-2 border-green-500">'],
  // Ops / Risks / Forecast / AI / Leaderboard (order variants)
  ['<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">', '<CulinaryCard>'],
  ['<div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">', '<CulinaryCard>'],
  ['<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">', '<CulinaryCard padded={false} className="overflow-hidden">'],
  ['<div className="bg-white rounded-lg border border-gray-200 p-4">', '<CulinaryCard>'],
  ['<section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">', '<CulinaryCard as="section" padded={false} className="overflow-hidden">'],
  // Coordinator table shell (no border in original)
  ['<div className="bg-white rounded-lg shadow-sm overflow-hidden">', '<CulinaryCard padded={false} className="overflow-hidden">'],
]

function addImport(src) {
  if (src.includes("from '@/components/culinary-os'")) return src
  return src.replace(/^('use client'\s*\n)/m, "$1import { CulinaryCard } from '@/components/culinary-os'\n")
}

function fixInterCardClosings(src) {
  let out = src
  let prev
  do {
    prev = out
    out = out.replace(/\n( +)<\/div>\n\1<CulinaryCard/g, '\n$1</CulinaryCard>\n$1<CulinaryCard')
  } while (out !== prev)
  return out
}

/** Ops: white sections use </section> — convert those closings to </CulinaryCard> */
function fixOpsSectionClosings(src, rel) {
  if (!rel.includes('ops/OpsDashboard')) return src
  return src.replace(
    /<CulinaryCard as="section" padded={false} className="overflow-hidden">([\s\S]*?)<\/section>/g,
    '<CulinaryCard as="section" padded={false} className="overflow-hidden">$1</CulinaryCard>'
  )
}

for (const rel of FILES) {
  let c = readFileSync(rel, 'utf8')
  const hadCard = c.includes('<CulinaryCard')
  c = addImport(c)
  for (const [from, to] of OPEN_REPLACEMENTS) {
    c = c.split(from).join(to)
  }
  c = fixInterCardClosings(c)
  c = fixOpsSectionClosings(c, rel)
  // Impact: hero gradient — drop shadow-lg only
  c = c.replace(
    'className="bg-gradient-to-r from-forestDark to-forestDarker rounded-lg shadow-lg p-8 text-white"',
    'className="bg-gradient-to-r from-forestDark to-forestDarker rounded-none shadow-none p-8 text-white"'
  )
  // Inline edit popovers: flat culinary shell (not full CulinaryCard to avoid layout quirks)
  c = c.replace(
    'className="inline-block p-3 rounded border border-gray-200 bg-white shadow"',
    'className="inline-block rounded-none border border-culinary-outline bg-culinary-bone p-3 shadow-none"'
  )
  c = c.replace(
    'className="inline-block mt-1 p-2 rounded border border-gray-200 bg-white shadow"',
    'className="inline-block mt-1 rounded-none border border-culinary-outline bg-culinary-bone p-2 shadow-none"'
  )
  writeFileSync(rel, c)
  console.log(rel, hadCard ? '(had cards)' : '')
}

console.log('Done. Manually verify: first/last card closings, Forecast assumptions block.')
