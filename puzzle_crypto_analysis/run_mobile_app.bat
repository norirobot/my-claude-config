@echo off
title 퍼즐 트레이딩 봇 - 모바일 앱
color 0A

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║                                                       ║
echo ║        🚀 퍼즐 트레이딩 봇 모바일 앱 시작 🚀         ║
echo ║                                                       ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

:: Python과 Streamlit 확인
echo [1/3] 환경 확인 중...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python이 설치되어 있지 않습니다!
    echo    Python 3.8 이상을 설치해주세요.
    pause
    exit /b 1
)

pip show streamlit >nul 2>&1
if %errorlevel% neq 0 (
    echo [2/3] Streamlit 설치 중...
    pip install streamlit plotly
) else (
    echo ✅ Streamlit 설치 확인됨
)

:: 로컬 IP 주소 찾기
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set "LOCAL_IP=%%a"
    goto :found_ip
)
:found_ip
set LOCAL_IP=%LOCAL_IP: =%

echo.
echo [3/3] 앱 실행 중...
echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║  📱 모바일에서 접속하는 방법:                         ║
echo ║                                                       ║
echo ║  1. 같은 WiFi에 연결                                 ║
echo ║  2. 브라우저에서 접속:                               ║
echo ║     http://%LOCAL_IP%:8501                            ║
echo ║                                                       ║
echo ║  🖥️  PC에서는:                                       ║
echo ║     http://localhost:8501                             ║
echo ║                                                       ║
echo ║  📱 앱처럼 사용하려면:                               ║
echo ║     브라우저 메뉴 → "홈 화면에 추가"                 ║
echo ║                                                       ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

:: Streamlit 앱 실행
streamlit run mobile_app.py --server.address=0.0.0.0 --server.port=8501

echo.
echo 앱이 종료되었습니다.
pause