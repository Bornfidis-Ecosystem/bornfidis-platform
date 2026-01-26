// Quick script to verify .env.local is loaded correctly
require('dotenv').config({ path: '.env.local' })

console.log('=== Environment Variable Check ===')
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0)
console.log('DATABASE_URL starts with postgresql://:', process.env.DATABASE_URL?.startsWith('postgresql://') || false)
console.log('DATABASE_URL preview:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 60) + '...' : 'UNDEFINED')
console.log('\n=== Next.js should load these automatically ===')
console.log('Make sure to restart: npm run dev')
