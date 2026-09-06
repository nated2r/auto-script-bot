@echo off
setlocal EnableExtensions
cd /d "%~dp0web" || (
  echo [ERROR] Cannot enter web folder.
  pause
  exit /b 1
)

if not exist "package.json" (
  echo [ERROR] package.json not found in web\
  pause
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] node not found in PATH. Install Node.js then reopen.
  pause
  exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm not found in PATH.
  pause
  exit /b 1
)

if not exist ".env" (
  echo [ERROR] web\.env missing.
  if exist ".env.example" copy /y ".env.example" ".env" >nul
  echo Open web\.env and set DEEPSEEK_API_KEY=sk-xxxx then run again.
  notepad ".env"
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo [INFO] Running npm install...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

echo [INFO] Freeing ports 8787 / 5173 if busy...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ports=8787,5173; foreach($port in $ports){ Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }"

echo.
echo ========================================
echo  Short Script Web - local start
echo  UI  http://localhost:5173
echo  API http://localhost:8787
echo  Stop with Ctrl+C in this window
echo ========================================
echo.

start "short-script-api-wait" /min cmd /c "powershell -NoProfile -ExecutionPolicy Bypass -Command \"for($i=0;$i -lt 60;$i++){ try { $h=Invoke-RestMethod 'http://localhost:8787/api/health' -TimeoutSec 1; if($h.ok){ Start-Process 'http://localhost:5173/'; break } } catch {} Start-Sleep -Seconds 1 }\""

call npm run dev
set ERR=%ERRORLEVEL%

echo.
echo [INFO] Stopped. exit=%ERR%
pause
exit /b %ERR%
