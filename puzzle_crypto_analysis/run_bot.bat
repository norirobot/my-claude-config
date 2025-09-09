@echo off
echo ============================================
echo      퍼즈 트레이딩 봇 실행 프로그램
echo ============================================
echo.

:: 파이썬 설치 확인
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python이 설치되어 있지 않습니다!
    echo Python 3.8 이상을 설치해주세요.
    pause
    exit /b 1
)

:: 필요한 패키지 설치
echo [1/3] 필요한 패키지 확인 중...
pip show pandas >nul 2>&1
if %errorlevel% neq 0 (
    echo 패키지를 설치합니다. 잠시만 기다려주세요...
    pip install -r requirements.txt
)

:: config.py 존재 확인
if not exist config.py (
    echo [ERROR] config.py 파일이 없습니다!
    pause
    exit /b 1
)

:: 실행 모드 선택
echo.
echo [2/3] 실행 모드를 선택하세요:
echo.
echo   1. 모의투자 (PAPER) - 추천
echo   2. 백테스트 (BACKTEST)
echo   3. 실전투자 (REAL) - 주의!
echo   4. 종료
echo.
set /p mode="선택 (1-4): "

if "%mode%"=="1" (
    echo.
    echo [모의투자 모드로 실행합니다]
    python -c "import config; config.MODE='PAPER'; exec(open('main.py').read())"
) else if "%mode%"=="2" (
    echo.
    echo [백테스트 모드로 실행합니다]
    python -c "import config; config.MODE='BACKTEST'; exec(open('main.py').read())"
) else if "%mode%"=="3" (
    echo.
    echo ================================================
    echo   WARNING: 실전 투자 모드입니다!
    echo   실제 돈이 거래됩니다. 주의하세요!
    echo ================================================
    echo.
    set /p confirm="정말 실전 투자를 시작하시겠습니까? (yes/no): "
    if /i "%confirm%"=="yes" (
        python -c "import config; config.MODE='REAL'; exec(open('main.py').read())"
    ) else (
        echo 취소되었습니다.
    )
) else if "%mode%"=="4" (
    echo 프로그램을 종료합니다.
    exit /b 0
) else (
    echo 잘못된 선택입니다.
)

echo.
pause