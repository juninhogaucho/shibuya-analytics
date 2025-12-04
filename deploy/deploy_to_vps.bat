@echo off
REM ============================================================================
REM SHIBUYA ANALYTICS - DEPLOYMENT PACKAGE BUILDER
REM ============================================================================
REM 
REM This script creates a deployment package and uploads it to your VPS.
REM Run this from your LOCAL Windows machine.
REM
REM Usage:
REM   deploy_to_vps.bat YOUR_VPS_IP
REM
REM Example:
REM   deploy_to_vps.bat 123.45.67.89
REM
REM ============================================================================

setlocal EnableDelayedExpansion

set VPS_IP=%1

if "%VPS_IP%"=="" (
    echo.
    echo ERROR: Please provide your VPS IP address
    echo.
    echo Usage: deploy_to_vps.bat YOUR_VPS_IP
    echo Example: deploy_to_vps.bat 123.45.67.89
    echo.
    exit /b 1
)

echo.
echo ============================================
echo  SHIBUYA ANALYTICS - DEPLOYMENT BUILDER
echo ============================================
echo.
echo Target VPS: %VPS_IP%
echo.

REM Get script directory
set SCRIPT_DIR=%~dp0
set ANALYTICS_DIR=%SCRIPT_DIR%..
set BACKEND_DIR=%SCRIPT_DIR%..\..\medallion_api

echo Building frontend for production...
cd /d "%ANALYTICS_DIR%"

REM Set production API URL (will be overwritten on server, but good for local build)
echo VITE_API_BASE=https://api.shibuya.trade > .env.production

REM Build frontend
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Frontend build failed!
    exit /b 1
)

echo Frontend built successfully!
echo.

REM Create deployment package directory
set DEPLOY_PKG=%TEMP%\shibuya_deploy_%DATE:~-4%%DATE:~4,2%%DATE:~7,2%
if exist "%DEPLOY_PKG%" rd /s /q "%DEPLOY_PKG%"
mkdir "%DEPLOY_PKG%"
mkdir "%DEPLOY_PKG%\shibuya_analytics"

echo Creating deployment package...

REM Copy frontend dist
xcopy /E /I /Q "%ANALYTICS_DIR%\dist" "%DEPLOY_PKG%\shibuya_analytics\dist"

REM Copy deploy script
copy "%SCRIPT_DIR%deploy_shibuya.sh" "%DEPLOY_PKG%\"

REM Copy backend (excluding heavy folders)
echo Copying backend files...
robocopy "%BACKEND_DIR%" "%DEPLOY_PKG%\medallion_api" /E /XD .git node_modules __pycache__ .venv venv logs data backups .pytest_cache .mypy_cache /NFL /NDL /NJH /NJS

echo.
echo Deployment package created at: %DEPLOY_PKG%
echo.

REM Check if we can connect to VPS
echo Testing SSH connection to %VPS_IP%...
ssh -o ConnectTimeout=5 -o BatchMode=yes root@%VPS_IP% "echo 'SSH OK'" 2>nul
if errorlevel 1 (
    echo.
    echo WARNING: Could not connect to VPS via SSH.
    echo Make sure:
    echo   1. Your SSH key is set up (ssh-copy-id root@%VPS_IP%)
    echo   2. VPS is running and accessible
    echo.
    echo The deployment package is at: %DEPLOY_PKG%
    echo You can manually upload it with:
    echo   scp -r "%DEPLOY_PKG%\*" root@%VPS_IP%:/opt/shibuya-deploy/
    echo.
    pause
    exit /b 0
)

echo SSH connection OK!
echo.

REM Create remote directory and upload
echo Uploading to VPS (this may take a few minutes)...
ssh root@%VPS_IP% "mkdir -p /opt/shibuya-deploy"
scp -r "%DEPLOY_PKG%\*" root@%VPS_IP%:/opt/shibuya-deploy/

if errorlevel 1 (
    echo.
    echo ERROR: Upload failed!
    exit /b 1
)

echo.
echo ============================================
echo  UPLOAD COMPLETE!
echo ============================================
echo.
echo Files uploaded to: root@%VPS_IP%:/opt/shibuya-deploy/
echo.
echo To complete deployment, SSH into your VPS and run:
echo.
echo   ssh root@%VPS_IP%
echo   bash /opt/shibuya-deploy/deploy_shibuya.sh
echo.
echo Or run it directly:
echo   ssh root@%VPS_IP% "bash /opt/shibuya-deploy/deploy_shibuya.sh"
echo.

set /p RUN_NOW="Run deployment script now? (y/N): "
if /i "%RUN_NOW%"=="y" (
    echo.
    echo Running deployment script on VPS...
    echo.
    ssh root@%VPS_IP% "bash /opt/shibuya-deploy/deploy_shibuya.sh"
)

echo.
echo Done!
pause
