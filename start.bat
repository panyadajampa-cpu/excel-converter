@echo off
echo ⚡ Excel Converter — Starting up...
echo.

echo [1/2] Starting Flask backend on :5000
cd backend
if not exist venv (
    echo   Creating virtualenv...
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt -q
start "Flask Backend" python app.py
cd ..

timeout /t 2 /nobreak >nul

echo [2/2] Starting Vite frontend on :3000
cd frontend
if not exist node_modules (
    echo   Installing npm packages...
    npm install
)
start "Vite Frontend" npm run dev
cd ..

echo.
echo Both servers started.
echo   Frontend ^> http://localhost:3000
echo   Backend  ^> http://localhost:5000
echo.
pause
