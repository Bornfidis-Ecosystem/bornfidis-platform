# Quick fix for .env file - Updates DATABASE_URL to Supabase direct connection
# Run this script to fix the localhost connection error

Write-Host "🔧 Fixing .env file..." -ForegroundColor Cyan

# Get the correct connection string
# User should get this from: Supabase Dashboard → Settings → Database → Direct connection
$correctUrl = 'postgresql://postgres:Bornfidis2026@db.axqmavsjdrvhsdjetznb.supabase.co:5432/postgres?sslmode=require'

Write-Host "`n⚠️  Using default connection string with password 'Bornfidis2026'" -ForegroundColor Yellow
Write-Host "   If your password is different, edit .env manually after running this script." -ForegroundColor Yellow
Write-Host "`n   Press Enter to continue, or Ctrl+C to cancel..." -ForegroundColor Cyan
$null = Read-Host

# Read current .env file
if (Test-Path ".env") {
    $content = Get-Content ".env" -Raw
    
    # Replace the DATABASE_URL line
    if ($content -match 'DATABASE_URL') {
        $newContent = $content -replace 'DATABASE_URL\s*=.*', "DATABASE_URL=`"$correctUrl`""
        Set-Content ".env" $newContent -NoNewline
        Write-Host "`n✅ Updated DATABASE_URL in .env" -ForegroundColor Green
        Write-Host "   Changed from: prisma+postgres://localhost..." -ForegroundColor Gray
        Write-Host "   Changed to:   postgresql://postgres:...@db.axqmavsjdrvhsdjetznb.supabase.co:5432..." -ForegroundColor Gray
    } else {
        # Add DATABASE_URL if it doesn't exist
        Add-Content ".env" "`nDATABASE_URL=`"$correctUrl`""
        Write-Host "`n✅ Added DATABASE_URL to .env" -ForegroundColor Green
    }
} else {
    # Create .env file
    Set-Content ".env" "DATABASE_URL=`"$correctUrl`""
    Write-Host "`n✅ Created .env with DATABASE_URL" -ForegroundColor Green
}

Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Fix permission error:" -ForegroundColor White
Write-Host "      Remove-Item -Recurse -Force node_modules\.prisma\client" -ForegroundColor Yellow
Write-Host "`n   2. Generate Prisma client:" -ForegroundColor White
Write-Host "      npx prisma generate" -ForegroundColor Yellow
Write-Host "`n   3. Apply migration:" -ForegroundColor White
Write-Host "      npx prisma migrate dev --name phase11g2_schema_updates" -ForegroundColor Yellow
