# Fix Prisma Connection Issues
# This script helps resolve database connection and permission errors

Write-Host "🔧 Fixing Prisma Connection Issues..." -ForegroundColor Cyan

# Step 1: Check if .env.local exists and copy DATABASE_URL to .env
Write-Host "`n📋 Step 1: Checking environment files..." -ForegroundColor Yellow

if (Test-Path ".env.local") {
    Write-Host "✅ Found .env.local" -ForegroundColor Green
    
    # Read DATABASE_URL from .env.local
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match 'DATABASE_URL\s*=\s*"([^"]+)"') {
        $dbUrl = $matches[1]
        Write-Host "✅ Found DATABASE_URL in .env.local" -ForegroundColor Green
        
        # Check if it's using pooler (needs to be direct for migrations)
        if ($dbUrl -match 'pooler\.supabase\.com') {
            Write-Host "⚠️  WARNING: DATABASE_URL uses connection pooler!" -ForegroundColor Yellow
            Write-Host "   Migrations need DIRECT connection (port 5432)" -ForegroundColor Yellow
            Write-Host "   Current: $($dbUrl.Substring(0, [Math]::Min(80, $dbUrl.Length)))..." -ForegroundColor Yellow
            Write-Host "`n   Please update .env.local with DIRECT connection:" -ForegroundColor Yellow
            Write-Host "   Format: postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require" -ForegroundColor Cyan
            Write-Host "   Get it from: Supabase Dashboard → Settings → Database → Direct connection" -ForegroundColor Cyan
            Write-Host "`n   Press any key after updating .env.local..." -ForegroundColor Yellow
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        
        # Create/update .env file for Prisma CLI
        $envLine = "DATABASE_URL=`"$dbUrl`""
        if (Test-Path ".env") {
            $existingEnv = Get-Content ".env" -Raw
            if ($existingEnv -match 'DATABASE_URL') {
                # Replace existing DATABASE_URL
                $existingEnv = $existingEnv -replace 'DATABASE_URL\s*=.*', $envLine
                Set-Content ".env" $existingEnv
                Write-Host "✅ Updated DATABASE_URL in .env" -ForegroundColor Green
            } else {
                # Append DATABASE_URL
                Add-Content ".env" "`n$envLine"
                Write-Host "✅ Added DATABASE_URL to .env" -ForegroundColor Green
            }
        } else {
            # Create new .env file
            Set-Content ".env" $envLine
            Write-Host "✅ Created .env with DATABASE_URL" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ DATABASE_URL not found in .env.local" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ .env.local not found!" -ForegroundColor Red
    exit 1
}

# Step 2: Fix EPERM issue by closing locked files
Write-Host "`n📋 Step 2: Fixing file permission issues..." -ForegroundColor Yellow

$prismaClientPath = "node_modules\.prisma\client"
if (Test-Path $prismaClientPath) {
    Write-Host "⚠️  Prisma client exists - checking for locked files..." -ForegroundColor Yellow
    
    # Try to remove the client directory (will fail if locked)
    try {
        Remove-Item -Recurse -Force $prismaClientPath -ErrorAction Stop
        Write-Host "✅ Removed existing Prisma client (will regenerate)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not remove Prisma client (may be locked)" -ForegroundColor Yellow
        Write-Host "   Please close:" -ForegroundColor Yellow
        Write-Host "   - Next.js dev server (npm run dev)" -ForegroundColor Cyan
        Write-Host "   - Any IDE/editor with Prisma files open" -ForegroundColor Cyan
        Write-Host "   - Then run: Remove-Item -Recurse -Force node_modules\.prisma\client" -ForegroundColor Cyan
    }
} else {
    Write-Host "✅ No existing Prisma client to remove" -ForegroundColor Green
}

# Step 3: Generate Prisma client
Write-Host "`n📋 Step 3: Generating Prisma client..." -ForegroundColor Yellow
Write-Host "   Running: npx prisma generate" -ForegroundColor Cyan

try {
    npx prisma generate
    Write-Host "`n✅ Prisma client generated successfully!" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Failed to generate Prisma client" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Test migration
Write-Host "`n📋 Step 4: Testing database connection..." -ForegroundColor Yellow
Write-Host "   Running: npx prisma migrate status" -ForegroundColor Cyan

try {
    npx prisma migrate status
    Write-Host "`n✅ Database connection successful!" -ForegroundColor Green
} catch {
    Write-Host "`n⚠️  Database connection failed" -ForegroundColor Yellow
    Write-Host "   This is OK if you haven't applied migrations yet" -ForegroundColor Yellow
}

Write-Host "`n✨ Done! You can now run:" -ForegroundColor Green
Write-Host "   npx prisma migrate dev --name phase11g2_schema_updates" -ForegroundColor Cyan
