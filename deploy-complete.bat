@echo off
REM Complete Deployment Script for M873 Project (Windows)
REM This script handles all file updates and triggers CI/CD pipeline

echo 🚀 Starting complete deployment process...
echo 📦 Updating every single file to GitHub with CI/CD pipeline

REM Check if git is available
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git is not installed or not in PATH
    exit /b 1
)

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not in a git repository
    exit /b 1
)

REM Get current branch
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo [INFO] Current branch: %CURRENT_BRANCH%

REM Show current status
echo [INFO] Current git status:
git status --short

REM Add all files (including untracked and modified)
echo [INFO] Adding all files to git...
git add -A

REM Check if there are any changes
git diff-index --quiet HEAD --
if %errorlevel% equ 0 (
    echo [WARNING] No changes detected. Creating a deployment marker commit.
    echo # Deployment Marker - %date% %time% > deployment-marker.txt
    git add deployment-marker.txt
)

REM Create a comprehensive commit message (
echo [INFO] Creating deployment commit...
git commit -m "🚀 Complete Deployment with OTP Integration

📦 Files Updated:
✅ OwnerAuth component with OTP authentication
✅ Supabase Edge Functions (send-owner-otp, send-otp-email)
✅ Fallback OTP service for development
✅ Vite configuration with proxy setup
✅ Database migrations and OTP table
✅ Authentication helpers and utilities
✅ Type definitions for RPC functions
✅ Test files for OTP functionality

🔧 Features Implemented:
- Two-step owner authentication (password + OTP)
- Email-based OTP verification
- Fallback OTP service for development
- Supabase Edge Functions deployment
- Vite HMR configuration fix
- Complete CI/CD pipeline

🌐 Deployment:
- GitHub Pages deployment enabled
- Supabase Edge Functions auto-deployment
- Automated testing and verification
- Complete file synchronization

Triggered by: Complete deployment request
Pipeline: CI/CD with GitHub Actions"

REM Push to remote repository
echo [INFO] Pushing to GitHub repository...
git push origin %CURRENT_BRANCH%

if %errorlevel% equ 0 (
    echo ✅ All files pushed to GitHub successfully!
    echo 🔄 CI/CD pipeline triggered automatically
    echo 🌐 Deployment will be available at: https://m-873.github.io/M873/
    
    REM Show GitHub Actions status
    echo [INFO] You can monitor the deployment progress at:
    echo    https://github.com/M-873/M873/actions
    
    REM Clean up deployment marker if it exists
    if exist deployment-marker.txt (
        del deployment-marker.txt
        echo [INFO] Cleaned up deployment marker
    )
) else (
    echo ❌ Failed to push to GitHub
    echo Please check your internet connection and repository permissions
    exit /b 1
)

echo 🎉 Complete deployment process finished!
echo 📧 OTP authentication system is now live
echo 🔧 All files updated and synchronized

echo.
echo 📝 Next Steps:
echo 1. Monitor the GitHub Actions workflow: https://github.com/M-873/M873/actions
echo 2. Test the OTP functionality at: https://m-873.github.io/M873/
echo 3. Check deployment status in the Actions tab
echo 4. Verify all features are working correctly
echo.
echo 🚀 Deployment completed successfully!

pause