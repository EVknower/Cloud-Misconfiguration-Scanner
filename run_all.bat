@echo off
echo ========================================
echo   Cloud Misconfiguration Scanner
echo   Multi-Cloud Security Tool
echo ========================================
echo.

echo [1/3] Starting Backend (Python FastAPI)...
start "Backend API" cmd /k "cd backend && echo Installing dependencies... && pip install -r requirements.txt && echo. && echo Backend starting on http://localhost:8000 && python main.py"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend (React Dashboard)...
start "Frontend UI" cmd /k "cd frontend && echo Installing dependencies... && npm install && echo. && echo Frontend starting on http://localhost:3000 && npm start"

echo.
echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo   Backend API:  http://localhost:8000
echo   API Docs:     http://localhost:8000/docs
echo   Frontend UI:  http://localhost:3000
echo.
echo ========================================
echo   Optional: Run Go Scanner
echo ========================================
echo.
echo   In a new terminal, run:
echo   cd scanner
echo   go run main.go --provider aws
echo.
echo ========================================
echo Press any key to exit...
pause >nul