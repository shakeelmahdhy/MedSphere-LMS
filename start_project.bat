@echo off
echo Starting E-Learning Project...

echo.
echo [1/2] Starting Backend...
start cmd /k "cd backend && (if not exist venv python -m venv venv) && .\venv\Scripts\activate && pip install -r requirements.txt && python main.py"

echo.
echo [2/2] Starting Frontend...
start cmd /k "npm install && npm run dev"

echo.
echo Project services are starting in separate windows.
echo - Backend will run at http://localhost:8000
echo - Frontend will run at http://localhost:5173
echo.
pause
