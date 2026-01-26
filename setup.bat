@echo off
setlocal

echo 🚀 Starting Fitness Tracker Setup...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js (v16+) first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm version: %NPM_VERSION%

:: Check if MongoDB is installed
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB is not installed locally.
    echo Please either:
    echo 1. Install MongoDB locally, or
    echo 2. Use a cloud MongoDB service (MongoDB Atlas)
    echo.
    set /p CONTINUE=Continue anyway? (y/n): 
    if /i not "%CONTINUE%"=="y" (
        exit /b 1
    )
) else (
    echo ✅ MongoDB is installed
)

:: Setup backend
echo 📦 Setting up backend...
cd backend

if not exist "package.json" (
    echo ❌ Backend package.json not found
    pause
    exit /b 1
)

echo Installing backend dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo ✅ Backend setup complete

:: Setup frontend
echo 📦 Setting up frontend...
cd ..\frontend

if not exist "package.json" (
    echo ❌ Frontend package.json not found
    pause
    exit /b 1
)

echo Installing frontend dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo ✅ Frontend setup complete

:: Create environment file if it doesn't exist
cd ..
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ✅ Created .env file
    echo ⚠️  Please edit .env file with your actual configuration values
) else (
    echo ✅ .env file already exists
)

echo.
echo 🎉 Setup Complete!
echo.
echo Next steps:
echo 1. Edit .env file with your WhatsApp API credentials
echo 2. Start MongoDB (if using local instance): mongod
echo 3. Start backend: cd backend ^&^& npm run dev
echo 4. Start frontend: cd frontend ^&^& npm start
echo.
echo For WhatsApp setup, see WHATSAPP_TEMPLATES.md
echo For detailed instructions, see README.md
echo.
pause