@echo off
echo.
echo 🚀 Fix Missing Features Table in Production Supabase
echo.
echo The PGRST205 error means the 'features' table is missing from your production database.
echo.
echo 📋 Quick Fix Steps:
echo.
echo 1. Open your Supabase Dashboard:
echo    https://app.supabase.com/projects
echo.
echo 2. Select your project: mgkarabtbhluvkrfyrmu
echo.
echo 3. Click "SQL Editor" in the left sidebar
echo.
echo 4. Copy and paste the SQL from: create-tables-manually.sql
echo.
echo 5. Click "Run" to execute the SQL
echo.
echo 🎯 After completion, you should be able to:
echo    - View features on your homepage
echo    - Access the owner dashboard
echo    - Add, edit, and delete features
echo.
echo 📁 Files created for you:
echo    - create-tables-manually.sql (complete SQL script)
echo    - FIX_TABLES_GUIDE.md (detailed instructions)
echo    - execute-sql-via-powershell.ps1 (PowerShell automation)
echo.
echo Press any key to open the Supabase dashboard...
pause > nul
start https://app.supabase.com/projects
echo.
echo ✅ Dashboard opened! Follow the steps above to fix the issue.
echo.