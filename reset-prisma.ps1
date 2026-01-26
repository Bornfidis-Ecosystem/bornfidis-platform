# Reset Prisma State for Bornfidis Platform
# Run this script to clean up old Island Harvest Hub migrations

Write-Host "🌱 Resetting Prisma state for Bornfidis Platform..." -ForegroundColor Green
Write-Host "`n⚠️  IMPORTANT: Stop your dev server (Ctrl+C) and close VS Code/Cursor before running this!" -ForegroundColor Yellow
Write-Host "   Press any key to continue or Ctrl+C to cancel..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Step 1: Remove old migrations
Write-Host "`n1. Removing old migrations..." -ForegroundColor Yellow
if (Test-Path "prisma\migrations") {
    Remove-Item -Recurse -Force "prisma\migrations" -ErrorAction SilentlyContinue
    Write-Host "   ✅ Removed old migrations" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No migrations folder found" -ForegroundColor Gray
}

# Step 2: Remove Prisma client cache (with retry logic)
Write-Host "`n2. Removing Prisma client cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.prisma") {
    # Try to remove, but don't fail if files are locked
    try {
        Get-ChildItem "node_modules\.prisma" -Recurse | Remove-Item -Force -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue
        Write-Host "   ✅ Removed Prisma client cache" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Some files are locked. This is OK - Prisma generate will overwrite them." -ForegroundColor Yellow
    }
} else {
    Write-Host "   ℹ️  No Prisma cache found" -ForegroundColor Gray
}

# Step 3: Generate fresh Prisma client
Write-Host "`n3. Generating fresh Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Prisma client generated" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

# Step 4: Create initial migration
Write-Host "`n4. Creating initial migration..." -ForegroundColor Yellow
Write-Host "   ⚠️  Make sure DIRECT_URL is set in .env.local!" -ForegroundColor Yellow
npx prisma migrate dev --name init_bornfidis_platform
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n   ✅ Migration created successfully!" -ForegroundColor Green
    Write-Host "`n🌱 Bornfidis Platform is ready!" -ForegroundColor Green
} else {
    Write-Host "`n   ❌ Migration failed" -ForegroundColor Red
    Write-Host "   Check your DIRECT_URL in .env.local" -ForegroundColor Yellow
    exit 1
}
