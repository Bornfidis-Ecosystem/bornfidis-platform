$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..

$replacements = @(
  @('text-[#1a5f3f]', 'text-forestDark'),
  @('bg-[#1a5f3f]', 'bg-forestDark'),
  @('border-[#1a5f3f]', 'border-forestDark'),
  @('hover:bg-[#154a32]', 'hover:bg-forestDarker'),
  @('hover:bg-[#144a30]', 'hover:bg-forestDarker'),
  @('focus:ring-[#1a5f3f]', 'focus:ring-forestDark'),
  @('focus:border-[#1a5f3f]', 'focus:border-forestDark'),
  @('text-[#FFBC00]', 'text-gold'),
  @('bg-[#FFBC00]', 'bg-gold'),
  @('border-[#154a32]', 'border-forestDarker'),
  @('border-[#1a5f3f]/20', 'border-forestDark/20'),
  @('border-[#1a5f3f]/30', 'border-forestDark/30')
)

Get-ChildItem -Path app -Recurse -Include *.tsx | ForEach-Object {
  $content = Get-Content -LiteralPath $_.FullName -Raw
  $changed = $false
  foreach ($r in $replacements) {
    if ($content -like "*$($r[0])*") {
      $content = $content.Replace($r[0], $r[1])
      $changed = $true
    }
  }
  if ($changed) {
    Set-Content -LiteralPath $_.FullName -Value $content
    Write-Host $_.FullName
  }
}
