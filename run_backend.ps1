$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir
$env:PYTHONPATH = $ScriptDir
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Starting TransitPulse Backend (FastAPI + Uvicorn)" -ForegroundColor Green
Write-Host " API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
python -m uvicorn backend.app.main:app --reload --port 8000
