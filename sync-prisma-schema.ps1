# Sync Prisma Schema with Supabase Intake Table
# This script helps sync the Prisma schema with your existing Supabase table

Write-Host "🔄 Syncing Prisma Schema with Supabase..." -ForegroundColor Cyan

# Step 1: Remove locked Prisma client
Write-Host "`n📋 Step 1: Removing locked Prisma client..." -ForegroundColor Yellow
if (Test-Path "node_modules\.prisma\client") {
    try {
        Remove-Item -Recurse -Force "node_modules\.prisma\client" -ErrorAction Stop
        Write-Host "✅ Removed Prisma client directory" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not remove Prisma client (may be locked)" -ForegroundColor Yellow
        Write-Host "   Please close:" -ForegroundColor Yellow
        Write-Host "   - Next.js dev server (Ctrl+C)" -ForegroundColor Cyan
        Write-Host "   - Any IDE/editor with Prisma files open" -ForegroundColor Cyan
        Write-Host "   Then run this script again." -ForegroundColor Cyan
        exit 1
    }
} else {
    Write-Host "✅ No Prisma client directory to remove" -ForegroundColor Green
}

# Step 2: Try db pull (may fail if connection doesn't work)
Write-Host "`n📋 Step 2: Attempting to pull schema from database..." -ForegroundColor Yellow
$pullResult = npx prisma db pull 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pulled schema from database" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not pull from database (connection issue)" -ForegroundColor Yellow
    Write-Host "   Schema has been manually updated - verify column names match your table" -ForegroundColor Yellow
    Write-Host "   See SYNC_INTAKE_TABLE.md for details" -ForegroundColor Cyan
}

# Step 3: Generate Prisma client
Write-Host "`n📋 Step 3: Generating Prisma client..." -ForegroundColor Yellow
$generateResult = npx prisma generate 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma client generated successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    Write-Host "   Error output:" -ForegroundColor Yellow
    Write-Host $generateResult -ForegroundColor Gray
    exit 1
}

Write-Host "`n✨ Done! You can now:" -ForegroundColor Green
Write-Host "   1. Test connection: Visit http://localhost:3000/api/test-db" -ForegroundColor Cyan
Write-Host "   2. Use db.intake in your code" -ForegroundColor Cyan
