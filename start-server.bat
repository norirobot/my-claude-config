@echo off
echo ======================================
echo   코딩 멘토 서버 자동 시작
echo ======================================
echo.

REM 현재 IP 주소 확인
echo 현재 IP 주소 확인 중...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr "IPv4"') do set IP=%%i
set IP=%IP: =%
echo 현재 IP: %IP%
echo.

REM 서버 시작
echo 백엔드 서버 시작 중... (포트 3001)
start "Backend Server" cmd /k "cd /d %~dp0backend && node server.js"

echo 3초 대기...
timeout /t 3 /nobreak >nul

echo 프론트엔드 서버 시작 중... (포트 3006)
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run serve"

echo.
echo ======================================
echo   서버가 시작되었습니다!
echo   접속 주소: http://%IP%:3006
echo ======================================
echo.

REM 브라우저에서 자동으로 열기
timeout /t 3 /nobreak >nul
start http://%IP%:3006

pause