@echo off
echo ======================================
echo   코딩 멘토 서버 자동 시작 (동적 IP)
echo ======================================
echo.

REM 현재 IP 주소 자동 감지
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr "IPv4" ^| findstr "192.168"') do set CURRENT_IP=%%i
set CURRENT_IP=%CURRENT_IP: =%
echo 현재 IP: %CURRENT_IP%

REM IP 기반 설정은 자동 감지되므로 업데이트 불필요
echo 자동 IP 감지 시스템 사용 중...

echo 백엔드 서버 시작 중... (포트 3001)
start "Backend Server" cmd /k "cd /d %~dp0backend && node server.js"

timeout /t 3 /nobreak >nul

echo 프론트엔드 서버 시작 중... (포트 3008)
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run serve"

echo.
echo ======================================
echo   서버가 시작되었습니다!
echo   집에서: http://localhost:3008
echo   학원에서: http://%CURRENT_IP%:3008
echo ======================================
echo 두 주소 모두 자동으로 작동합니다!
echo.

timeout /t 5 /nobreak >nul
start http://localhost:3008

pause