@echo off
title SmartHire - AI Mock Interview Platform
echo ========================================
echo   SmartHire - AI Mock Interview Platform
echo ========================================
echo.

echo [1/2] Starting Backend Server...
cd /d %~dp0backend
start "SmartHire Backend" cmd /k "node server.js"
echo   ✓ Backend running on http://localhost:5000

echo.
echo [2/2] Starting Frontend (Production Build)...
cd /d %~dp0frontend
start "SmartHire Frontend" cmd /k "node server.js"
echo   ✓ Frontend running on http://localhost:3000

echo.
echo ========================================
echo   Both services are running!
echo   - Backend: http://localhost:5000
echo   - Frontend: http://localhost:3000
echo ========================================
echo.
echo IMPORTANT: Open http://localhost:3000 in your browser
echo.
pause
