# Run from repo root: .\scripts\check-deploy-status.ps1
# Shows where local, origin/master, and origin/main stand (so you know what Vercel is deploying).

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "`n=== Remotes ===" -ForegroundColor Cyan
git remote -v

Write-Host "`n=== Current branch and sync with origin ===" -ForegroundColor Cyan
git status -sb

Write-Host "`n=== Commits on MASTER not on MAIN (these are NOT on production if Vercel uses main) ===" -ForegroundColor Yellow
$count = git rev-list --count origin/main..origin/master 2>$null
if ($count -eq 0) {
    Write-Host "None. main and master are in sync." -ForegroundColor Green
} else {
    Write-Host "Count: $count" -ForegroundColor Yellow
    git log --oneline origin/main..origin/master
    Write-Host "`n--> Merge master into main (via PR or 'git merge origin/master' on main) to get these to production." -ForegroundColor Yellow
}

Write-Host "`n=== Last 3 commits on MAIN (what production likely has) ===" -ForegroundColor Cyan
git log --oneline -3 origin/main

Write-Host "`n=== Last 3 commits on MASTER ===" -ForegroundColor Cyan
git log --oneline -3 origin/master

Write-Host "`nDone. See DEPLOY_STATUS.md for how to fix the disconnect.`n" -ForegroundColor Cyan
