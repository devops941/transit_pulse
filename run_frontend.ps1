$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir "frontend")
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Starting TransitPulse Frontend (React + Vite)" -ForegroundColor Green
Write-Host " Web URL: http://localhost:5173" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
npm run dev
