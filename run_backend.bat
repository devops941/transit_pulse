@echo off
cd /d "%~dp0"
set PYTHONPATH=%CD%
echo ========================================================
echo  Starting TransitPulse Backend (FastAPI + Uvicorn)
echo  API Docs: http://localhost:8000/docs
echo ========================================================
python -m uvicorn backend.app.main:app --reload --port 8000
pause
