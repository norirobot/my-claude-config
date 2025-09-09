@echo off
chcp 65001 > nul
echo ======================================
echo    에듀OK 출석 모니터링 시스템
echo ======================================
echo.

REM Python 설치 확인
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] Python이 설치되어 있지 않습니다.
    echo Python 3.8 이상을 설치해주세요.
    pause
    exit /b 1
)

REM 가상환경 생성 및 활성화
if not exist "venv" (
    echo [정보] 가상환경을 생성중입니다...
    python -m venv venv
)

echo [정보] 가상환경을 활성화합니다...
call venv\Scripts\activate.bat

REM 패키지 설치
echo [정보] 필요한 패키지를 설치중입니다...
pip install -r requirements.txt

REM Chrome 드라이버 확인 메시지
echo.
echo [중요] Chrome 브라우저가 설치되어 있는지 확인해주세요.
echo 자동으로 ChromeDriver가 다운로드됩니다.
echo.

REM 설정 파일 확인
if not exist "config.json" (
    echo [오류] config.json 파일이 없습니다.
    echo 에듀OK 로그인 정보를 설정해주세요.
    pause
    exit /b 1
)

REM 설정 완료 확인
findstr "YOUR_ID_HERE" config.json > nul
if %errorlevel% equ 0 (
    echo [경고] config.json에서 로그인 정보를 수정해주세요.
    echo YOUR_ID_HERE, YOUR_PASSWORD_HERE 등을 실제 정보로 변경하세요.
    echo.
    echo 1. config.json 파일을 메모장으로 열기
    echo 2. YOUR_ID_HERE를 실제 ID로 변경
    echo 3. YOUR_PASSWORD_HERE를 실제 비밀번호로 변경  
    echo 4. YOUR_ACADEMY_CODE를 실제 학원코드로 변경
    echo.
    set /p choice="설정을 완료했으면 Y를 입력하세요 (Y/N): "
    if /i "%choice%" neq "Y" (
        notepad config.json
        echo 설정을 완료한 후 다시 실행해주세요.
        pause
        exit /b 1
    )
)

REM 백엔드 서버 시작
echo [정보] 웹 서버를 시작합니다...
echo 대시보드 URL: http://localhost:5000
echo 종료하려면 Ctrl+C를 누르세요.
echo.

cd backend
python app.py