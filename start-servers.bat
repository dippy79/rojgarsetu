@echo off
echo ========================================
echo RojgarSetu - Starting Both Servers
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if PostgreSQL is running (optional check)
echo Starting Backend Server (Port 5000)...
start "Rojgarsetu Backend" cmd /k "cd /d f:\Rojgarsetu && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Port 3000)...
start "Rojgarsetu Frontend" cmd /k "cd /d f:\Rojgarsetu\frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to close this window...
pause >nul

