@echo off
echo ============================================
echo      GitHub 자동 업로드 도우미
echo ============================================
echo.

:: GitHub CLI 설치 확인
where gh >nul 2>&1
if %errorlevel% neq 0 (
    echo GitHub CLI가 설치되어 있지 않습니다.
    echo 수동으로 업로드하시거나 GitHub CLI를 설치해주세요.
    echo.
    echo 수동 업로드 방법:
    echo 1. https://github.com 에서 계정 생성
    echo 2. "New repository" 클릭
    echo 3. 이름: puzzle-trading-bot
    echo 4. Public 선택 후 생성
    echo 5. 다음 파일들을 웹에서 업로드:
    echo    - cloud_mobile_app.py
    echo    - streamlit_requirements.txt
    echo    - cloud_config.py
    echo    - README.md
    echo.
    pause
    exit /b 1
)

:: GitHub 로그인 확인
echo GitHub 로그인 상태 확인 중...
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo GitHub에 로그인이 필요합니다.
    gh auth login
)

echo.
echo 업로드할 파일 확인:
echo ✅ cloud_mobile_app.py
echo ✅ streamlit_requirements.txt
echo ✅ cloud_config.py  
echo ✅ README.md

echo.
set /p repo_name="저장소 이름 (기본값: puzzle-trading-bot): "
if "%repo_name%"=="" set repo_name=puzzle-trading-bot

echo.
echo 저장소 생성 및 파일 업로드 중...

:: Git 초기화
git init

:: 업로드할 파일들만 선택
git add cloud_mobile_app.py streamlit_requirements.txt cloud_config.py README.md

:: 커밋
git commit -m "퍼즐 트레이딩 봇 - Streamlit Cloud 배포용"

:: GitHub 저장소 생성
gh repo create %repo_name% --public --source=. --remote=origin --push

echo.
echo ✅ 업로드 완료!
echo.
echo 🌐 저장소 주소: https://github.com/%USERNAME%/%repo_name%
echo.
echo 다음 단계:
echo 1. https://share.streamlit.io 접속
echo 2. GitHub로 로그인
echo 3. "New app" 클릭
echo 4. Repository: %USERNAME%/%repo_name%
echo 5. Main file: cloud_mobile_app.py
echo 6. Deploy 클릭!
echo.
pause