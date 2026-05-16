import fs from 'fs'

const envFile = process.argv[2] || '.env.local'
const keys = process.argv[3] ? [process.argv[3]] : ['DATABASE_URL', 'DIRECT_URL']

if (!fs.existsSync(envFile)) {
  console.log(`${envFile}: missing`)
  process.exit(1)
}

const raw = fs.readFileSync(envFile, 'utf8')

for (const key of keys) {
  const line = raw.split(/\r?\n/).find((l) => new RegExp(`^\\s*${key}\\s*=`).test(l))
  if (!line) {
    console.log(`${envFile} ${key}: not set`)
    continue
  }

  const val = line
    .replace(new RegExp(`^\\s*${key}\\s*=\\s*`), '')
    .trim()
    .replace(/^["']|["']$/g, '')

  try {
    const u = new URL(val)
    const host = u.hostname
    const port = u.port || '5432'
    const isLocal = /^(localhost|127\.0\.0\.1)$/i.test(host)
    const isSupabase = /\.supabase\.com$/i.test(host) || host.includes('pooler.supabase.com')
    console.log(
      `${envFile} ${key}: host=${host} port=${port} target=${isLocal ? 'LOCAL' : isSupabase ? 'SUPABASE' : 'OTHER'}`
    )
  } catch {
    console.log(`${envFile} ${key}: invalid URL`)
  }
}
