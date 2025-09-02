@echo off
echo ======================================
echo   코딩 멘토 자동 시작 설정
echo ======================================
echo.

REM 현재 스크립트의 절대 경로 구하기
set SCRIPT_PATH=%~dp0start-server.bat

echo 시작프로그램에 등록 중...
echo 경로: %SCRIPT_PATH%

REM 레지스트리에 시작프로그램 등록
reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run" /v "CodingMentorServer" /t REG_SZ /d "\"%SCRIPT_PATH%\"" /f

if %errorlevel%==0 (
    echo.
    echo ======================================
    echo   설정 완료!
    echo   컴퓨터를 재시작하면 자동으로 서버가
    echo   시작됩니다.
    echo ======================================
) else (
    echo.
    echo ======================================
    echo   오류가 발생했습니다.
    echo   관리자 권한으로 실행해주세요.
    echo ======================================
)

pause