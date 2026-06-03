// ARCHIVED: One-off migration script. Do not re-run.
// Completed: 2026-05-16

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

const PAIRS = [
  ['        </div>\n        <CulinaryCard>', '        </CulinaryCard>\n        <CulinaryCard>'],
  ['            </div>\n            <CulinaryCard>', '            </CulinaryCard>\n            <CulinaryCard>'],
  ['      </div>\n      <CulinaryCard>', '      </CulinaryCard>\n      <CulinaryCard>'],
  ['          </div>\n          <CulinaryCard>', '          </CulinaryCard>\n          <CulinaryCard>'],
  ['    </div>\n    <CulinaryCard>', '    </CulinaryCard>\n    <CulinaryCard>'],
]

function fixInter(src) {
  let out = src
  let prev
  do {
    prev = out
    out = out.replace(/\n( +)<\/div>\n\1<CulinaryCard/g, '\n$1</CulinaryCard>\n$1<CulinaryCard')
  } while (out !== prev)
  return out
}

for (const rel of FILES) {
  let c = readFileSync(rel, 'utf8').replace(/\r\n/g, '\n')
  for (const [a, b] of PAIRS) {
    c = c.split(a).join(b)
  }
  c = fixInter(c)
  writeFileSync(rel, c)
}
console.log('Closing pair pass done.')
