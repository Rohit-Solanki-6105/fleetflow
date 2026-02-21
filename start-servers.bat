@echo off
echo ========================================
echo Starting FleetFlow Development Servers
echo ========================================
echo.

REM Start Django Backend
echo Starting Django Backend Server...
start cmd /k "cd /d %~dp0 && venv\Scripts\activate && python manage.py runserver"

REM Wait a bit for backend to start
timeout /t 3 /nobreak > nul

REM Start Next.js Frontend
echo Starting Next.js Frontend Server...
start cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo ========================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/api/docs/
echo Admin:    http://localhost:8000/admin
echo ========================================
echo.
echo Press any key to close this window...
pause > nul
