# SmartHire - Startup Script
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SmartHire - AI Mock Interview Platform" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Start Backend
Write-Host "[1/2] Starting Backend Server..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "$PSScriptRoot\backend"
Write-Host "  ✓ Backend starting on http://localhost:5000" -ForegroundColor Green

# Start Frontend
Write-Host "`n[2/2] Starting Frontend..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "$PSScriptRoot\frontend"
Write-Host "  ✓ Frontend starting on http://localhost:3000" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Frontend will open automatically in browser" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop servers" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
