@echo off
echo ======================================
echo   코딩 멘토 서버 자동 시작 (동적 IP)
echo ======================================
echo.

REM 현재 IP 주소 자동 감지
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr "IPv4" ^| findstr "192.168"') do set CURRENT_IP=%%i
set CURRENT_IP=%CURRENT_IP: =%
echo 현재 IP: %CURRENT_IP%

REM 프론트엔드 package.json 업데이트
echo 프론트엔드 설정 업데이트 중...
powershell -Command "(Get-Content '%~dp0frontend\package.json') -replace '192\.168\.\d+\.\d+', '%CURRENT_IP%' | Set-Content '%~dp0frontend\package.json'"

REM App.js도 업데이트 (필요한 경우)
echo 프론트엔드 코드 업데이트 중...
powershell -Command "(Get-Content '%~dp0frontend\src\App.js') -replace '192\.168\.\d+\.\d+', '%CURRENT_IP%' | Set-Content '%~dp0frontend\src\App.js'"

echo 백엔드 서버 시작 중... (포트 3001)
start "Backend Server" cmd /k "cd /d %~dp0backend && node server.js"

timeout /t 3 /nobreak >nul

echo 프론트엔드 서버 시작 중... (포트 3006)
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run serve"

echo.
echo ======================================
echo   서버가 시작되었습니다!
echo   접속 주소: http://%CURRENT_IP%:3006
echo ======================================
echo 이 주소를 학원에서도 사용하세요!
echo.

timeout /t 5 /nobreak >nul
start http://%CURRENT_IP%:3006

pause