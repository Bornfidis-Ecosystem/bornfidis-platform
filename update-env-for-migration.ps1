# Update .env file with correct Supabase direct connection for migrations
# This fixes the "localhost:51260" connection error

Write-Host "🔧 Updating .env file for Prisma migrations..." -ForegroundColor Cyan

# Get direct connection string from user
Write-Host "`n📋 Please provide your Supabase DIRECT connection string:" -ForegroundColor Yellow
Write-Host "   Get it from: Supabase Dashboard → Settings → Database → Direct connection" -ForegroundColor Cyan
Write-Host "   Format: postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require" -ForegroundColor Cyan
Write-Host "`n   Or press Enter to use the default (you can edit .env manually after):" -ForegroundColor Yellow

$dbUrl = Read-Host "DATABASE_URL"

# If user didn't provide, use default format (they can edit manually)
if ([string]::IsNullOrWhiteSpace($dbUrl)) {
    $dbUrl = 'postgresql://postgres:Bornfidis2026@db.axqmavsjdrvhsdjetznb.supabase.co:5432/postgres?sslmode=require'
    Write-Host "`n⚠️  Using default connection string. Please verify it's correct!" -ForegroundColor Yellow
    Write-Host "   You can edit .env file manually if needed." -ForegroundColor Yellow
}

# Validate format
if ($dbUrl -notmatch '^postgresql://') {
    Write-Host "`n❌ ERROR: DATABASE_URL must start with 'postgresql://'" -ForegroundColor Red
    Write-Host "   Current: $($dbUrl.Substring(0, [Math]::Min(50, $dbUrl.Length)))..." -ForegroundColor Red
    exit 1
}

# Check if it's using pooler
if ($dbUrl -match 'pooler\.supabase\.com|:6543') {
    Write-Host "`n⚠️  WARNING: This looks like a connection pooler!" -ForegroundColor Yellow
    Write-Host "   Migrations need DIRECT connection (port 5432, not 6543)" -ForegroundColor Yellow
    Write-Host "   Continue anyway? (y/n)" -ForegroundColor Yellow
    $continue = Read-Host
    if ($continue -ne 'y' -and $continue -ne 'Y') {
        Write-Host "Cancelled. Please get the DIRECT connection string and try again." -ForegroundColor Yellow
        exit 0
    }
}

# Update .env file
$envLine = "DATABASE_URL=`"$dbUrl`""

if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    
    if ($envContent -match 'DATABASE_URL') {
        # Replace existing DATABASE_URL
        $envContent = $envContent -replace 'DATABASE_URL\s*=.*', $envLine
        Set-Content ".env" $envContent -NoNewline
        Write-Host "`n✅ Updated DATABASE_URL in .env" -ForegroundColor Green
    } else {
        # Append DATABASE_URL
        Add-Content ".env" "`n$envLine"
        Write-Host "`n✅ Added DATABASE_URL to .env" -ForegroundColor Green
    }
} else {
    # Create new .env file
    Set-Content ".env" $envLine
    Write-Host "`n✅ Created .env with DATABASE_URL" -ForegroundColor Green
}

Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Stop your dev server (if running)" -ForegroundColor White
Write-Host "   2. Run: Remove-Item -Recurse -Force node_modules\.prisma\client" -ForegroundColor White
Write-Host "   3. Run: npx prisma generate" -ForegroundColor White
Write-Host "   4. Run: npx prisma migrate dev --name phase11g2_schema_updates" -ForegroundColor White
