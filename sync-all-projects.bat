@echo off
REM ==========================================
REM 전체 프로젝트 동기화 스크립트
REM 집-학원 간 코드 동기화용
REM ==========================================

echo ==========================================
echo     전체 프로젝트 동기화 시작
echo     %date% %time%
echo ==========================================
echo.

cd /d C:\Users\sintt

REM Git 상태 확인
echo [1/6] 현재 Git 상태 확인...
git status --short
echo.

REM 변경사항 확인
git diff --quiet
if %errorlevel% == 0 (
    git diff --cached --quiet
    if %errorlevel% == 0 (
        echo 변경사항이 없습니다.
        goto CHECK_REMOTE
    )
)

REM 모든 변경사항 추가
echo [2/6] 모든 변경사항 스테이징...
git add -A 2>nul
echo.

REM 커밋 생성
echo [3/6] 커밋 생성 중...
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set TODAY=%%c-%%a-%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set NOW=%%a:%%b
git commit -m "동기화: %TODAY% %NOW% - 작업 내용 백업"
echo.

:CHECK_REMOTE
REM 원격에서 최신 변경사항 가져오기
echo [4/6] 원격 저장소에서 변경사항 확인...
git fetch origin main 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo ⚠️  GitHub 저장소 연결 실패!
    echo ========================================
    echo.
    echo GitHub에 저장소를 만드는 방법:
    echo.
    echo 1. https://github.com 로그인
    echo 2. 우측 상단 + 버튼 → New repository
    echo 3. Repository name: my-projects
    echo 4. Private 선택 (비공개)
    echo 5. Create repository 클릭
    echo.
    echo 그 다음 이 명령어 실행:
    echo    git remote add origin https://github.com/sinttogi/my-projects.git
    echo    git push -u origin main
    echo ========================================
    goto END
)

REM Pull (병합)
echo [5/6] 원격 변경사항 병합...
git pull origin main --no-edit 2>nul
if %errorlevel% neq 0 (
    echo 병합 충돌이 있을 수 있습니다. 수동으로 해결하세요.
    goto END
)

REM Push
echo [6/6] GitHub로 푸시...
git push origin main 2>nul
if %errorlevel% == 0 (
    echo ✅ 동기화 성공!
) else (
    echo ❌ 푸시 실패. 위의 안내를 따라 저장소를 생성하세요.
)

:END
echo.
echo ==========================================
echo     동기화 작업 완료
echo     %date% %time%
echo ==========================================
echo.

REM 현재 상태 요약
echo 📊 최종 상태:
git log --oneline -3
echo.
git status --short

echo.
echo 종료하려면 아무 키나 누르세요...
pause >nul