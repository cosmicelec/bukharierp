@echo off
echo ===================================================
echo Bukhari ERP - 1-Click Demo Launcher (Testing Phase)
echo ===================================================
echo.

:: 1. Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Node.js is missing. Attempting to install via winget...
    winget install OpenJS.NodeJS -e --silent
    echo [INFO] Please close this window and run start-demo.bat again after Node installs!
    pause
    exit /b
)

:: 2. Check for Ollama
where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Ollama is missing. Attempting to install via winget...
    winget install Ollama.Ollama -e --silent
    echo [INFO] Ollama installed. Please close this window and run start-demo.bat again!
    pause
    exit /b
) else (
    echo [INFO] Ollama found. Ensuring llama3.2 model is downloaded (this may take a while)...
    ollama pull llama3.2
)

echo.
echo [INFO] Installing NPM dependencies (this may take a minute on first run)...
call npm install

echo.
echo [INFO] Initializing local SQLite database...
call npx prisma generate
call npx prisma db push

:: (Optional) Seed the database if it's empty
:: call npx prisma db seed

echo.
echo [INFO] Starting the Application...
echo Please wait while the Next.js and Rust backend compile.
echo The desktop app will open automatically!
echo.
call npm run tauri dev

pause
