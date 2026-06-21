$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\package.json")) {
  throw "Run this script from the Frontend folder."
}

Write-Host "Cleaning generated folders..." -ForegroundColor Cyan
Remove-Item -Recurse -Force ".\.next" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".\node_modules" -ErrorAction SilentlyContinue

Write-Host "Installing dependencies with pnpm..." -ForegroundColor Cyan
pnpm install

Write-Host "Checking TypeScript..." -ForegroundColor Cyan
pnpm run typecheck

Write-Host "Frontend setup completed." -ForegroundColor Green
Write-Host "Start it with: pnpm run dev"
